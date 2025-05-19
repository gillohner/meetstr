// src/utils/nostr/nostrUtils.ts
import { NDK, NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

/**
 * Fetches a Nostr event using various identifier types
 *
 * @param ndk - The initialized NDK instance
 * @param identifier - Can be an event ID, naddr, or other identifier
 * @returns Promise that resolves to the event or null if not found
 */
export const fetchEventById = async (ndk: NDK, identifier: string): Promise<NDKEvent | null> => {
  if (!ndk) {
    throw new Error("NDK instance not provided");
  }

  try {
    let filter: NDKFilter;

    // Handle different identifier types
    if (identifier.startsWith("naddr")) {
      // If it's an naddr, decode it to get the components
      try {
        const decoded = nip19.decode(identifier);
        if (decoded.type === "naddr") {
          const data = decoded.data;
          filter = {
            kinds: [data.kind],
            authors: [data.pubkey],
            "#d": [data.identifier],
          };
        } else {
          throw new Error("Invalid naddr format");
        }
      } catch (error) {
        console.error("Error decoding naddr:", error);
        return null;
      }
    } else if (identifier.startsWith("note")) {
      // If it's a note ID
      try {
        const decoded = nip19.decode(identifier);
        if (decoded.type === "note") {
          filter = { ids: [decoded.data] };
        } else {
          throw new Error("Invalid note format");
        }
      } catch (error) {
        console.error("Error decoding note:", error);
        return null;
      }
    } else {
      // Assume it's a raw event ID
      filter = { ids: [identifier] };
    }

    // Use NDK's fetchEvent method to get the first matching event
    const event = await ndk.fetchEvent(filter);
    return event;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
};

/**
 * Fetches and categorizes calendar events from a main calendar event
 *
 * @param ndk - Initialized NDK instance
 * @param calendarEvent - The main calendar event (kind 31924)
 * @returns Object containing sorted upcoming and past events
 */
export const fetchCalendarEvents = async (
  ndk: NDK,
  calendarEvent: NDKEvent
): Promise<{ upcoming: NDKEvent[]; past: NDKEvent[] }> => {
  const now = Math.floor(Date.now() / 1000);
  const upcoming: NDKEvent[] = [];
  const past: NDKEvent[] = [];

  if (!calendarEvent || calendarEvent.kind !== 31924) {
    return { upcoming, past };
  }

  const eventRefs = calendarEvent.tags.filter((tag) => tag[0] === "a");
  const fetchPromises = eventRefs.map(async (tag) => {
    const parts = tag[1].split(":");
    if (parts.length < 3) return null;

    const [kindStr, pubkey, dTag] = parts;
    const kind = parseInt(kindStr);

    if (kind !== 31922 && kind !== 31923) return null;

    try {
      const event = await ndk.fetchEvent({
        kinds: [kind],
        authors: [pubkey],
        "#d": [dTag],
      });

      if (!event) return null;

      const startTime = parseInt(event.tags.find((t) => t[0] === "start")?.[1] || "0");

      return { event, startTime };
    } catch (error) {
      console.error("Error fetching calendar event:", error);
      return null;
    }
  });

  const results = await Promise.all(fetchPromises);

  results.forEach((result) => {
    if (!result) return;

    if (result.startTime > now) {
      upcoming.push(result.event);
    } else {
      past.push(result.event);
    }
  });

  // Sort functions
  const sortAsc = (a: NDKEvent, b: NDKEvent) => (getStartTime(a) || 0) - (getStartTime(b) || 0);

  const sortDesc = (a: NDKEvent, b: NDKEvent) => (getStartTime(b) || 0) - (getStartTime(a) || 0);

  return {
    upcoming: upcoming.sort(sortAsc),
    past: past.sort(sortDesc),
  };
};

// Helper function to extract start time from event tags
const getStartTime = (event: NDKEvent): number | undefined => {
  const startTag = event.tags.find((t) => t[0] === "start");
  return startTag ? parseInt(startTag[1]) : undefined;
};

/**
 * Encodes an event into a NIP-19 nevent format
 */
export const encodeEventToNevent = (event: NDKEvent): string => {
  try {
    // Get relays from the event if available
    const relays = event.relayUrls ? Array.from(event.relayUrls) : [];

    return nip19.neventEncode({
      id: event.id,
      author: event.pubkey,
      kind: event.kind,
      relays,
    });
  } catch (error) {
    console.error("Error encoding event to nevent:", error);
    return "";
  }
};

/**
 * Encodes an addressable event into a NIP-19 naddr format
 */
export const encodeEventToNaddr = (event: NDKEvent): string => {
  try {
    // Extract d tag for the identifier
    const dTag = event.tags.find((t) => t[0] === "d")?.[1] || "";

    // Get relays from the event if available
    const relays = event.relayUrls ? Array.from(event.relayUrls) : [];

    return nip19.naddrEncode({
      identifier: dTag,
      pubkey: event.pubkey,
      kind: event.kind,
      relays,
    });
  } catch (error) {
    console.error("Error encoding event to naddr:", error);
    return "";
  }
};

/**
 * Gets the appropriate NIP-19 encoding for an event based on its kind
 */
export const getEventNip19Encoding = (event: NDKEvent): string => {
  // Replaceable/Parameterized replaceable events should use naddr
  if (
    [30023, 31922, 31923, 31924].includes(event.kind) ||
    (event.kind >= 30000 && event.kind < 40000)
  ) {
    return encodeEventToNaddr(event);
  }

  // Regular events use nevent
  return encodeEventToNevent(event);
};
