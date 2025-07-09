// src/app/api/calendar/[id]/route.ts
import { NextResponse } from "next/server";
import { getNdk } from "@/lib/ndkClient";
import { fetchCalendarEvents, fetchEventById } from "@/utils/nostr/nostrUtils";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { nip19 } from "nostr-tools";
import { getLocationInfo } from "@/utils/location/locationUtils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: calendarNaddr } = await params;
  const url = new URL(req.url);
  const fromIso = url.searchParams.get("from") ?? undefined;
  const toIso = url.searchParams.get("to") ?? undefined;
  const includePast = url.searchParams.get("includePast") === "false";

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
  const filteredPast = filterByDate(past);

  // 5. Serialize events to plain JSON-safe objects
  const serialize = async (evt: any) => {
    const meta = getEventMetadata(evt);
    let locationInfo = null;
    // Only fetch location info for events in the filtered range
    const start = meta.start ? parseInt(meta.start) : undefined;
    const inRange =
      (!from || (start && start >= from)) && (!to || (start && start <= to));
    if (inRange && (meta.location || meta.geohash)) {
      console.log("------------------------------------");
      console.log("Fetching location info for:", meta.location, meta.geohash);
      locationInfo = getLocationInfo(meta.location || "", meta.geohash);
      console.log("Location info:", locationInfo);
      console.log("------------------------------------");
    }
    return {
      id: nip19.neventEncode({
        id: evt.id,
        author: evt.pubkey,
        kind: evt.kind,
      }),
      created_at: evt.created_at,
      metadata: meta,
      locationInfo,
    };
  };

  // Use Promise.all to await all location info
  const upcomingJson = await Promise.all(filteredUpcoming.map(serialize));
  const pastJson = includePast
    ? await Promise.all(filteredPast.map(serialize))
    : [];

  // 6. Return JSON
  return NextResponse.json({
    metadata,
    upcoming: upcomingJson,
    past: pastJson,
  });
}
