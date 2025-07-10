import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { fetchEventById } from "@/utils/nostr/nostrUtils";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { getNdk } from "@/lib/ndkClient";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: calendarId } = await params;

    const ndk = getNdk();
    const calendarEvent = await fetchEventById(ndk, calendarId);

    if (!calendarEvent || calendarEvent.kind !== 31924) {
      return new Response("Calendar not found", { status: 404 });
    }

    const metadata = getEventMetadata(calendarEvent);
    const title = metadata.title || "Unnamed Calendar";
    const description =
      metadata.summary || calendarEvent.content || "A Nostr calendar";

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px",
            color: "white",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 40,
              lineHeight: 1.2,
            }}
          >
            📅 {title}
          </div>
          <div
            style={{
              fontSize: 24,
              textAlign: "center",
              opacity: 0.9,
              maxWidth: "80%",
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 40,
              right: 40,
              fontSize: 20,
              opacity: 0.8,
            }}
          >
            meetstr.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating calendar OG image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
