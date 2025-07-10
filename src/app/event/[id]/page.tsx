import { Metadata, ResolvingMetadata } from "next";
import { fetchEventById } from "@/utils/nostr/nostrUtils";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { getNdk } from "@/lib/ndkClient";
import EventPageClient from "./EventPageClient";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id: eventId } = await params;

  try {
    const ndk = getNdk();
    const event = await fetchEventById(ndk, eventId);

    if (!event || (event.kind !== 31922 && event.kind !== 31923)) {
      return {
        title: "Event Not Found",
        description: "The requested event could not be found.",
      };
    }

    const metadata = getEventMetadata(event);
    const title = metadata.title || "Unnamed Event";
    const description =
      metadata.summary || event.content || "A Nostr calendar event.";
    const eventUrl = `https://meetstr.com/event/${eventId}`;

    // Extract hashtags and create keywords
    const hashtags = event.tags
      .filter((tag) => tag[0] === "t")
      .map((tag) => tag[1])
      .filter(Boolean);

    // Format dates
    const startDate = metadata.start
      ? new Date(parseInt(metadata.start) * 1000).toISOString()
      : undefined;
    const endDate = metadata.end
      ? new Date(parseInt(metadata.end) * 1000).toISOString()
      : undefined;

    // Determine event type
    const eventType = event.kind === 31922 ? "date-based" : "time-based";

    return {
      title,
      description,
      keywords: [
        ...hashtags,
        "nostr",
        "event",
        "calendar",
        "meetup",
        eventType,
      ],
      openGraph: {
        title,
        description,
        url: eventUrl,
        type: "article",
        images: [
          {
            url: metadata.image || `/api/og/event/${eventId}`,
            width: 1200,
            height: 630,
            alt: `${title} - Event`,
          },
        ],
        publishedTime: startDate,
        section: "Events",
        tags: hashtags,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [metadata.image || `/api/og/event/${eventId}`],
      },
      alternates: {
        canonical: eventUrl,
      },
      other: {
        "event:start_date": startDate || "",
        "event:end_date": endDate || "",
        "event:location": metadata.location || "",
        "event:timezone": metadata.start_tzid || "",
        "nostr:naddr": eventId,
        "nostr:kind": event.kind.toString(),
        "article:tag": hashtags.join(","),
      },
    };
  } catch (error) {
    console.error("Error generating event metadata:", error);
    return {
      title: "Event Error",
      description: "An error occurred while loading this event.",
    };
  }
}

export default function EventPage({ params }: Props) {
  return <EventPageClient params={params} />;
}
