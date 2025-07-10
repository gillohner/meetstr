import type { Metadata, ResolvingMetadata } from "next";
import { fetchEventById } from "@/utils/nostr/nostrUtils";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { getNdk } from "@/lib/ndkClient";
import CalendarPageClient from "./CalendarPageClient";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id: calendarId } = await params;

  try {
    const ndk = getNdk();
    const calendarEvent = await fetchEventById(ndk, calendarId);

    if (!calendarEvent || calendarEvent.kind !== 31924) {
      return {
        title: "Calendar Not Found",
        description: "The requested calendar could not be found.",
      };
    }

    const metadata = getEventMetadata(calendarEvent);
    const title = metadata.title || "Unnamed Calendar";
    const description =
      metadata.summary ||
      calendarEvent.content ||
      "A Nostr calendar with upcoming events.";
    const calendarUrl = `https://meetstr.com/calendar/${calendarId}`;

    // Extract hashtags from tags
    const hashtags = calendarEvent.tags
      .filter((tag) => tag[0] === "t")
      .map((tag) => tag[1])
      .filter(Boolean);

    return {
      title,
      description,
      keywords: [...hashtags, "nostr", "calendar", "events", "meetup"],
      openGraph: {
        title,
        description,
        url: calendarUrl,
        type: "website",
        images: [
          {
            url: `/api/og/calendar/${calendarId}`,
            width: 1200,
            height: 630,
            alt: `${title} - Calendar`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`/api/og/calendar/${calendarId}`],
      },
      alternates: {
        canonical: calendarUrl,
      },
      other: {
        "event:start_date": metadata.start || "",
        "event:end_date": metadata.end || "",
        "event:location": metadata.location || "",
        "nostr:naddr": calendarId,
        "nostr:kind": "31924",
      },
    };
  } catch (error) {
    console.error("Error generating calendar metadata:", error);
    return {
      title: "Calendar Error",
      description: "An error occurred while loading this calendar.",
    };
  }
}

export default function CalendarPage({ params }: Props) {
  return <CalendarPageClient params={params} />;
}
