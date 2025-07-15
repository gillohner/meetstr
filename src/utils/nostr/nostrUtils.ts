// src/utils/nostr/nostrUtils.ts
import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

/**
 * Fetches a Nostr event using various identifier types
 *
 * @param ndk - The initialized NDK instance
 * @param identifier - Can be an event ID, naddr, or other identifier
 * @returns Promise that resolves to the event or null if not found
 */
export const fetchEventById = async (
  ndk: NDK,
  identifier: string
): Promise<NDKEvent | null> => {
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
  const deletedEventRefs: string[] = [];

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
        kinds: [kind as number],
        authors: [pubkey],
        "#d": [dTag],
      });

      if (!event) return null;

      // Check for deletion events (NIP-09)
      const isDeleted = await checkForDeletionEvents(
        ndk,
        event,
        pubkey,
        kind,
        dTag
      );

      if (isDeleted) {
        deletedEventRefs.push(tag[1]);
        return null; // Skip deleted events
      }

      const startTime = parseInt(
        event.tags.find((t) => t[0] === "start")?.[1] || "0"
      );

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

  // If we found deleted events, update the calendar to remove their references
  if (deletedEventRefs.length > 0) {
    removeDeletedEventsFromCalendar(ndk, calendarEvent, deletedEventRefs);
  }

  // Sort functions
  const sortAsc = (a: NDKEvent, b: NDKEvent) =>
    (getStartTime(a) || 0) - (getStartTime(b) || 0);

  const sortDesc = (a: NDKEvent, b: NDKEvent) =>
    (getStartTime(b) || 0) - (getStartTime(a) || 0);

  return {
    upcoming: upcoming.sort(sortAsc),
    past: past.sort(sortDesc),
  };
};

/**
 * Removes deleted event references from a calendar and publishes the updated calendar
 *
 * @param ndk - NDK instance
 * @param calendarEvent - The calendar event to update
 * @param deletedEventRefs - Array of deleted event coordinate strings to remove
 */
async function removeDeletedEventsFromCalendar(
  ndk: NDK,
  calendarEvent: NDKEvent,
  deletedEventRefs: string[]
): Promise<void> {
  try {
    console.log(
      `Removing ${deletedEventRefs.length} deleted events from calendar`
    );

    // Create updated calendar event
    const updatedCalendar = new NDKEvent(ndk);
    updatedCalendar.kind = 31924;
    updatedCalendar.content = calendarEvent.content || "";

    // Filter out the deleted event references
    updatedCalendar.tags = calendarEvent.tags.filter((tag) => {
      if (tag[0] === "a") {
        return !deletedEventRefs.includes(tag[1]);
      }
      return true; // Keep all non-'a' tags
    });

    // Sign and publish the updated calendar
    await updatedCalendar.sign();
    await updatedCalendar.publish();

    console.log(
      `Successfully updated calendar ${calendarEvent.id}, removed ${deletedEventRefs.length} deleted event references`
    );
  } catch (error) {
    console.error("Error updating calendar to remove deleted events:", error);
  }
}

/**
 * Checks if an event has been deleted according to NIP-09
 *
 * @param ndk - NDK instance
 * @param event - The event to check
 * @param pubkey - The event author's public key
 * @param kind - The event kind
 * @param dTag - The d-tag identifier for replaceable events
 * @returns Promise<boolean> - True if the event has been deleted
 */
async function checkForDeletionEvents(
  ndk: NDK,
  event: NDKEvent,
  pubkey: string,
  kind: number,
  dTag: string
): Promise<boolean> {
  try {
    // Query for deletion events (kind 5) from the same author
    const deletionEvents = await ndk.fetchEvents({
      kinds: [5],
      authors: [pubkey],
      // Optional: Add time constraint to improve performance
      since: event.created_at ? event.created_at - 86400 : undefined, // 24 hours before event
    });

    // Check if any deletion event references this calendar event
    for (const deletionEvent of deletionEvents) {
      // Check for 'a' tags that match our event
      const aTags = deletionEvent.tags.filter((tag) => tag[0] === "a");

      for (const aTag of aTags) {
        if (aTag[1] === `${kind}:${pubkey}:${dTag}`) {
          // Verify the deletion event was created after the original event
          if (
            deletionEvent.created_at &&
            event.created_at &&
            deletionEvent.created_at >= event.created_at
          ) {
            console.log(
              `Event ${event.id} has been deleted by ${deletionEvent.pubkey}`
            );
            return true; // Event has been deleted
          }
        }
      }
    }

    return false; // No deletion found
  } catch (error) {
    console.error("Error checking for deletion events:", error);
    return false; // On error, assume not deleted
  }
}

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
    // TODO: add explicit relays

    return nip19.neventEncode({
      id: event.id,
      author: event.pubkey,
      kind: event.kind,
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

    // TODO: add explicit relays
    return nip19.naddrEncode({
      identifier: dTag,
      pubkey: event.pubkey,
      kind: event.kind,
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
