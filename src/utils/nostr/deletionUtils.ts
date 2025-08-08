// src/utils/nostr/deletionUtils.ts
import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";

// Cache for deletion events to avoid repeated fetches
const deletionCache = new Map<
  string,
  { deletions: NDKEvent[]; timestamp: number }
>();
const DELETION_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Optimized batch deletion checking for multiple events
 */
export async function filterDeletedEvents(
  ndk: NDK,
  events: NDKEvent[]
): Promise<NDKEvent[]> {
  if (!events.length) return events;

  try {
    console.log(`🗑️ Checking ${events.length} events for deletions (batched)`);

    // Group events by author for efficient batch fetching
    const eventsByAuthor = new Map<string, NDKEvent[]>();
    events.forEach((event) => {
      const author = event.pubkey;
      if (!eventsByAuthor.has(author)) {
        eventsByAuthor.set(author, []);
      }
      eventsByAuthor.get(author)!.push(event);
    });

    console.log(`📊 Grouped events from ${eventsByAuthor.size} authors`);

    // Fetch deletion events for all authors in parallel
    const deletionPromises = Array.from(eventsByAuthor.keys()).map(
      async (author) => {
        return await fetchDeletionEventsForAuthor(ndk, author);
      }
    );

    const allDeletionResults = await Promise.all(deletionPromises);
    const allDeletionEvents = allDeletionResults.flat();

    console.log(`🗑️ Found ${allDeletionEvents.length} total deletion events`);

    // Build a set of deleted event coordinates for fast lookup
    const deletedCoordinates = new Set<string>();

    allDeletionEvents.forEach((deletionEvent) => {
      const aTags = deletionEvent.tags.filter((tag) => tag[0] === "a");
      aTags.forEach((aTag) => {
        deletedCoordinates.add(aTag[1]);
      });
    });

    // Filter out deleted events
    const activeEvents = events.filter((event) => {
      const dTag = event.tags.find((t) => t[0] === "d")?.[1] || "";
      const eventCoordinate = `${event.kind}:${event.pubkey}:${dTag}`;

      if (deletedCoordinates.has(eventCoordinate)) {
        // Additional verification: check if deletion was created after the event
        const relevantDeletions = allDeletionEvents.filter(
          (delEvent) =>
            delEvent.pubkey === event.pubkey &&
            delEvent.tags.some(
              (tag) => tag[0] === "a" && tag[1] === eventCoordinate
            )
        );

        for (const deletion of relevantDeletions) {
          if (
            deletion.created_at &&
            event.created_at &&
            deletion.created_at >= event.created_at
          ) {
            console.log(
              `🗑️ Event ${event.id} was deleted by ${deletion.pubkey}`
            );
            return false; // Event is deleted
          }
        }
      }

      return true; // Event is active
    });

    console.log(
      `✅ ${activeEvents.length}/${events.length} events are active after deletion filtering`
    );
    return activeEvents;
  } catch (error) {
    console.error("Error in batch deletion checking:", error);
    // On error, return all events (assume none are deleted)
    return events;
  }
}

/**
 * Fetch deletion events for a specific author with caching
 */
async function fetchDeletionEventsForAuthor(
  ndk: NDK,
  author: string
): Promise<NDKEvent[]> {
  const cacheKey = `deletions-${author}`;

  // Check cache first
  const cached = deletionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < DELETION_CACHE_DURATION) {
    return cached.deletions;
  }

  try {
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;

    const deletionEvents = await ndk.fetchEvents({
      kinds: [5], // NIP-09 deletion events
      authors: [author],
      since: thirtyDaysAgo, // Only look back 30 days for performance
      limit: 100, // Reasonable limit per author
    });

    const deletionArray = Array.from(deletionEvents.values()) as NDKEvent[];

    // Cache the results
    deletionCache.set(cacheKey, {
      deletions: deletionArray,
      timestamp: Date.now(),
    });

    return deletionArray;
  } catch (error) {
    console.error(`Error fetching deletions for author ${author}:`, error);
    return [];
  }
}

/**
 * Ultra-optimized batch deletion checking for large event sets
 * This version groups all authors and fetches deletion events in a single batch
 */
export async function filterDeletedEventsUltraFast(
  ndk: NDK,
  events: NDKEvent[]
): Promise<NDKEvent[]> {
  if (!events.length) return events;

  try {
    console.log(`🚀 Ultra-fast deletion check for ${events.length} events`);

    // Get all unique authors
    const authors = [...new Set(events.map((event) => event.pubkey))];
    console.log(`📊 Checking deletions for ${authors.length} unique authors`);

    // Fetch all deletion events for all authors in ONE batch query
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;

    const allDeletionEvents = await ndk.fetchEvents({
      kinds: [5], // NIP-09 deletion events
      authors: authors, // All authors at once
      since: thirtyDaysAgo,
      limit: 2000, // High limit to get all deletion events
    });

    const deletionArray = Array.from(allDeletionEvents.values()) as NDKEvent[];
    console.log(
      `🗑️ Found ${deletionArray.length} deletion events across all authors`
    );

    // Build deletion lookup map for O(1) access
    const deletionMap = new Map<string, NDKEvent[]>();

    deletionArray.forEach((deletionEvent) => {
      const aTags = deletionEvent.tags.filter((tag) => tag[0] === "a");
      aTags.forEach((aTag) => {
        const coordinate = aTag[1];
        if (!deletionMap.has(coordinate)) {
          deletionMap.set(coordinate, []);
        }
        deletionMap.get(coordinate)!.push(deletionEvent);
      });
    });

    console.log(`📍 Built deletion map for ${deletionMap.size} coordinates`);

    // Filter events using the lookup map
    const activeEvents = events.filter((event) => {
      const dTag = event.tags.find((t) => t[0] === "d")?.[1] || "";
      const eventCoordinate = `${event.kind}:${event.pubkey}:${dTag}`;

      const deletions = deletionMap.get(eventCoordinate);
      if (!deletions || deletions.length === 0) {
        return true; // No deletions found, event is active
      }

      // Check if any deletion was created after the event
      for (const deletion of deletions) {
        if (
          deletion.created_at &&
          event.created_at &&
          deletion.created_at >= event.created_at &&
          deletion.pubkey === event.pubkey
        ) {
          console.log(`🗑️ Event ${event.id} was deleted by ${deletion.pubkey}`);
          return false; // Event is deleted
        }
      }

      return true; // Event is active
    });

    console.log(
      `✅ ${activeEvents.length}/${events.length} events are active (ultra-fast batch)`
    );
    return activeEvents;
  } catch (error) {
    console.error("Error in ultra-fast deletion checking:", error);
    // Fallback to regular batch method
    return await filterDeletedEvents(ndk, events);
  }
}

/**
 * Checks if a single event has been deleted (for backwards compatibility)
 * Uses the batch method internally for consistency
 */
export async function isEventDeleted(
  ndk: NDK,
  event: NDKEvent
): Promise<boolean> {
  const result = await filterDeletedEvents(ndk, [event]);
  return result.length === 0; // If filtered out, it was deleted
}

/**
 * Clear deletion cache (useful for testing or force refresh)
 */
export function clearDeletionCache(): void {
  deletionCache.clear();
}
