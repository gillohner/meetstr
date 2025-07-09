// src/app/api/calendar/[id]/route.ts
import { NextResponse } from "next/server";
import { getNdk } from "@/lib/ndkClient";
import { fetchCalendarEvents, fetchEventById } from "@/utils/nostr/nostrUtils";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { nip19 } from "nostr-tools";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const calendarNaddr = params.id;
  const url = new URL(req.url);
  const fromIso = url.searchParams.get("from") ?? undefined;
  const toIso = url.searchParams.get("to") ?? undefined;

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
  const { upcoming, past } = await fetchCalendarEvents(ndk, calendarEvent, {
    from: fromIso,
    to: toIso,
  });

  // 4. Serialize events to plain JSON-safe objects
  const serialize = (evt: any) => {
    const meta = getEventMetadata(evt);
    return {
      id: nip19.neventEncode({
        id: evt.id,
        author: evt.pubkey,
        kind: evt.kind,
      }),
      created_at: evt.created_at,
      metadata: meta,
    };
  };

  const upcomingJson = upcoming.map(serialize);
  const pastJson = past.map(serialize);

  // 5. Return JSON
  return NextResponse.json({
    metadata,
    upcoming: upcomingJson,
    past: pastJson,
  });
}
