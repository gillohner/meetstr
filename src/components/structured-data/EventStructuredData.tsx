import type { NDKEvent } from "@nostr-dev-kit/ndk";

import { getEventMetadata } from "@/utils/nostr/eventUtils";

interface EventStructuredDataProps {
  event: NDKEvent;
  eventId: string;
}

export function EventStructuredData({
  event,
  eventId,
}: EventStructuredDataProps) {
  const metadata = getEventMetadata(event);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: metadata.title || "Unnamed Event",
    description: metadata.summary || event.content || "",
    url: `https://meetstr.com/event/${eventId}`,
    image: metadata.image || `https://meetstr.com/api/og/event/${eventId}`,
    startDate: metadata.start
      ? new Date(parseInt(metadata.start) * 1000).toISOString()
      : undefined,
    endDate: metadata.end
      ? new Date(parseInt(metadata.end) * 1000).toISOString()
      : undefined,
    location: metadata.location
      ? {
          "@type": "Place",
          name: metadata.location,
        }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: "Meetstr",
      url: "https://meetstr.com",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
