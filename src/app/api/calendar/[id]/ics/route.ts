import { NextResponse } from "next/server";
import { getNdk } from "@/lib/ndkClient";
import { fetchCalendarEvents, fetchEventById } from "@/utils/nostr/nostrUtils";
import { getEventMetadata } from "@/utils/nostr/eventUtils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: calendarNaddr } = await params;
  
  const ndk = getNdk();

  // Fetch calendar event
  const calendarEvent = await fetchEventById(ndk, calendarNaddr);
  if (!calendarEvent || calendarEvent.kind !== 31924) {
    return NextResponse.json(
      { error: "Invalid calendar ID or event not found" },
      { status: 404 }
    );
  }

  const calendarMetadata = getEventMetadata(calendarEvent);
  const { upcoming, past } = await fetchCalendarEvents(ndk, calendarEvent);
  const allEvents = [...upcoming, ...past];

  // Generate ICS content
  const icsContent = generateICSContent(calendarMetadata, allEvents);

  return new NextResponse(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${calendarMetadata.title || 'meetstr-calendar'}.ics"`,
      'Cache-Control': 'no-cache, must-revalidate',
      'X-Published-TTL': 'PT1H', // Refresh every hour
    },
  });
}

function generateICSContent(calendarMetadata: any, events: any[]): string {
  const now = new Date();
  const formatDate = (timestamp: string | number) => {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Meetstr//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarMetadata.title || 'Meetstr Calendar')}`,
    `X-WR-CALDESC:${escapeText(calendarMetadata.summary || '')}`,
    'X-WR-TIMEZONE:UTC',
    `LAST-MODIFIED:${formatDate(now.getTime() / 1000)}`,
  ];

  events.forEach(event => {
    const metadata = getEventMetadata(event);
    
    if (!metadata.start) return;

    const startDate = formatDate(metadata.start);
    const endDate = metadata.end ? formatDate(metadata.end) : formatDate(parseInt(metadata.start) + 3600); // Default 1 hour
    
    ics.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@meetstr.com`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${escapeText(metadata.title || 'Untitled Event')}`,
      `DESCRIPTION:${escapeText(metadata.summary || '')}`,
      metadata.location ? `LOCATION:${escapeText(metadata.location)}` : '',
      `URL:https://meetstr.com/event/${event.id}`,
      `CREATED:${formatDate(event.created_at)}`,
      `LAST-MODIFIED:${formatDate(event.created_at)}`,
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');
  
  return ics.filter(line => line !== '').join('\r\n');
}
