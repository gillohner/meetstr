// src/app/api/calendar/[id]/route.ts
import { NextResponse } from "next/server";
import { getNdk } from "@/lib/ndkClient";
import { fetchCalendarEvents, fetchEventById } from "@/utils/nostr/nostrUtils";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { nip19 } from "nostr-tools";
import { locationLoader } from "@/utils/location/loader";
import type { LocationData } from "@/types/location";
import { getEventNip19Encoding } from "@/utils/nostr/nostrUtils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: calendarNaddr } = await params;
  const url = new URL(req.url);
  const fromIso = url.searchParams.get("from") ?? undefined;
  const toIso = url.searchParams.get("to") ?? undefined;
  const includePast = url.searchParams.get("includePast") === "true";

  const ndk = getNdk();

  // 1. Fetch & validate calendar event
  const calendarEvent = await fetchEventById(ndk, calendarNaddr);
  if (!calendarEvent || calendarEvent.kind !== 31924) {
    return NextResponse.json(
      { error: "Invalid calendar ID or event not found" },
      { status: 404 }
    );
  }

  // 2. Extract calendar metadata
  const metadata = getEventMetadata(calendarEvent);

  metadata.meetstrUrl = `https://meetstr.com/calendar/${calendarNaddr}`;

  // 3. Fetch upcoming & past events
  const { upcoming, past } = await fetchCalendarEvents(ndk, calendarEvent);

  // 4. Filter by from/to date if provided
  const from = fromIso ? Date.parse(fromIso) / 1000 : undefined;
  const to = toIso ? Date.parse(toIso) / 1000 : undefined;

  function filterByDate(events: any[]) {
    return events.filter((evt) => {
      const meta = getEventMetadata(evt);
      const start = meta.start ? parseInt(meta.start) : undefined;
      if (start === undefined) return false;
      if (from && start < from) return false;
      if (to && start > to) return false;
      return true;
    });
  }

  const filteredUpcoming = filterByDate(upcoming);
  const filteredPast = includePast ? filterByDate(past) : [];

  // 5. Combine and serialize events
  const allEvents = [...filteredUpcoming, ...filteredPast];

  const serializedEvents = allEvents.map((evt) => {
    const meta = getEventMetadata(evt);

    // Generate meetstrUrl for individual events
    const eventNip19 = getEventNip19Encoding(evt);
    const meetstrUrl = `https://meetstr.com/event/${eventNip19}`;

    return {
      id: nip19.neventEncode({
        id: evt.id,
        author: evt.pubkey,
        kind: evt.kind,
      }),
      created_at: evt.created_at,
      metadata: {
        ...meta,
        meetstrUrl,
      },
      isUpcoming: filteredUpcoming.includes(evt),
    };
  });

  // 6. Deduplicate location keys for batch processing
  const locationKeys = new Map<
    string,
    { locationName: string; geohash?: string }
  >();

  serializedEvents.forEach((evt) => {
    const loc = evt.metadata.location;
    const geo = evt.metadata.geohash;

    if (loc || geo) {
      const key = `${loc || ""}|${geo || ""}`;
      if (!locationKeys.has(key)) {
        locationKeys.set(key, { locationName: loc || "", geohash: geo });
      }
    }
  });

  // 7. Batch load all location data using DataLoader (respects rate limiting)
  const uniqueLocationKeys = Array.from(locationKeys.values());
  console.log(`Batch loading ${uniqueLocationKeys.length} unique locations`);

  const locationDataList = await locationLoader.loadMany(uniqueLocationKeys);

  // 8. Create location map for quick lookup
  const locationMap = new Map<string, LocationData | null>();
  uniqueLocationKeys.forEach((key, index) => {
    const mapKey = `${key.locationName}|${key.geohash || ""}`;
    locationMap.set(mapKey, locationDataList[index] as LocationData | null);
  });

  // 9. Enrich events with location data
  const enrichedEvents = serializedEvents.map((evt) => {
    const loc = evt.metadata.location;
    const geo = evt.metadata.geohash;
    const mapKey = `${loc || ""}|${geo || ""}`;
    const locationData = locationMap.get(mapKey) || null;

    return {
      ...evt,
      locationData,
    };
  });

  // 10. Split back into upcoming and past
  const upcomingWithLocation = enrichedEvents.filter((evt) => evt.isUpcoming);
  const pastWithLocation = enrichedEvents.filter((evt) => !evt.isUpcoming);

  // 11. Return JSON
  return NextResponse.json({
    metadata,
    upcoming: upcomingWithLocation.map(({ isUpcoming, ...evt }) => evt),
    past: pastWithLocation.map(({ isUpcoming, ...evt }) => evt),
  });
}
