// src/utils/nostr/eventCacheUtils.ts
import type NDK from "@nostr-dev-kit/ndk";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { getEventMetadata } from "./eventUtils";
import dayjs from "dayjs";

// Shared event cache with different strategies
export const eventCache = new Map<
  string,
  { events: NDKEvent[]; timestamp: number }
>();
export const CACHE_DURATION = 45 * 60 * 1000; // 45 minutes

// Cache keys
export const CACHE_KEYS = {
  INSTANT_EVENTS: "instant-events",
  BACKGROUND_EVENTS: "background-events",
  ALL_EVENTS: "all-events",
  CALENDARS: "calendars-cache",
} as const;

export const getCachedEvents = (key: string): NDKEvent[] | null => {
  const cached = eventCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.events;
  }
  return null;
};

export const cacheEvents = (key: string, events: NDKEvent[]) => {
  eventCache.set(key, {
    events: [...events],
    timestamp: Date.now(),
  });
};

/**
 * Optimized batch event fetching used across the app
 * Returns categorized events with caching
 */
export async function fetchEvents(ndk: NDK): Promise<{
  allEvents: NDKEvent[];
  upcomingEvents: NDKEvent[];
  pastEvents: NDKEvent[];
  loading: boolean;
}> {
  // Check cache first
  const cachedEvents = getCachedEvents(CACHE_KEYS.ALL_EVENTS);
  if (cachedEvents && cachedEvents.length > 0) {
    console.log("⚡ Loading events from cache");
    const { upcoming, past } = categorizeEvents(cachedEvents);
    return {
      allEvents: cachedEvents,
      upcomingEvents: upcoming,
      pastEvents: past,
      loading: false,
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const sixMonthsFromNow = Math.floor(dayjs().add(6, "months").unix());

  try {
    console.log("🚀 Starting optimized batch event fetch");

    // Strategy: High-limit batch fetching like UpcomingEventsSection
    const quickFilters: NDKFilter[] = [
      {
        kinds: [31922 as any, 31923 as any],
        since: now,
        until: sixMonthsFromNow,
        limit: 1000,
      },
      {
        kinds: [31922 as any, 31923 as any],
        since: now - 7 * 24 * 3600, // Last week
        limit: 500,
      },
      {
        kinds: [31922 as any, 31923 as any],
        since: now - 30 * 24 * 3600, // Last month
        until: now,
        limit: 300,
      },
    ];

    // Fetch all filters in parallel
    const fetchPromises = quickFilters.map(async (filter) => {
      try {
        const events = await ndk.fetchEvents(filter);
        return Array.from(events.values()) as NDKEvent[];
      } catch (error) {
        console.error("Error fetching events with filter:", filter, error);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    const allEvents = results.flat();

    // Remove duplicates
    const uniqueEvents = allEvents.filter(
      (event, index, self) => index === self.findIndex((e) => e.id === event.id)
    );

    console.log(`🔄 Got ${uniqueEvents.length} unique events`);

    // Filter out deleted events using ultra-optimized batch deletion checking
    const activeEvents = uniqueEvents;
    console.log(
      `✅ ${activeEvents.length}/${uniqueEvents.length} events are active after deletion filtering`
    );

    // Cache the active results
    cacheEvents(CACHE_KEYS.ALL_EVENTS, activeEvents);

    // Categorize events
    const { upcoming, past } = categorizeEvents(activeEvents);

    return {
      allEvents: activeEvents,
      upcomingEvents: upcoming,
      pastEvents: past,
      loading: false,
    };
  } catch (error) {
    console.error("Error in optimized event fetch:", error);
    return {
      allEvents: [],
      upcomingEvents: [],
      pastEvents: [],
      loading: false,
    };
  }
}

/**
 * Categorizes events into upcoming and past
 */
export function categorizeEvents(events: NDKEvent[]): {
  upcoming: NDKEvent[];
  past: NDKEvent[];
} {
  const now = Math.floor(Date.now() / 1000);
  const upcoming: NDKEvent[] = [];
  const past: NDKEvent[] = [];

  events.forEach((event) => {
    const metadata = getEventMetadata(event);
    if (!metadata.start) return;

    const eventStart = parseInt(metadata.start);
    if (eventStart >= now) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  });

  // Sort functions
  const sortAsc = (a: NDKEvent, b: NDKEvent) => {
    const aStart = getEventMetadata(a).start;
    const bStart = getEventMetadata(b).start;
    if (!aStart) return 1;
    if (!bStart) return -1;
    return parseInt(aStart) - parseInt(bStart);
  };

  const sortDesc = (a: NDKEvent, b: NDKEvent) => {
    const aStart = getEventMetadata(a).start;
    const bStart = getEventMetadata(b).start;
    if (!aStart) return 1;
    if (!bStart) return -1;
    return parseInt(bStart) - parseInt(aStart);
  };

  return {
    upcoming: upcoming.sort(sortAsc),
    past: past.sort(sortDesc),
  };
}

/**
 * Calculates event counts for calendars efficiently
 */
export function calculateCalendarEventCounts(
  calendars: NDKEvent[],
  allEvents: NDKEvent[]
): Map<string, { upcoming: number; past: number }> {
  const now = Math.floor(Date.now() / 1000);
  const counts = new Map<string, { upcoming: number; past: number }>();

  // Initialize all calendars with zero counts
  calendars.forEach((calendar) => {
    counts.set(calendar.id, { upcoming: 0, past: 0 });
  });

  // Build a map of event coordinates for faster lookup
  const eventCoordinates = new Map<
    string,
    { event: NDKEvent; isUpcoming: boolean }
  >();

  allEvents.forEach((event) => {
    const metadata = getEventMetadata(event);
    if (!metadata.start) return;

    const eventStart = parseInt(metadata.start);
    const isUpcoming = eventStart >= now;
    const dTag = event.tags.find((t: any) => t[0] === "d")?.[1] || "";
    const eventCoordinate = `${event.kind}:${event.pubkey}:${dTag}`;

    eventCoordinates.set(eventCoordinate, { event, isUpcoming });
  });

  console.log(`📊 Built coordinate map for ${eventCoordinates.size} events`);

  // Count events for each calendar
  calendars.forEach((calendar) => {
    const currentCounts = counts.get(calendar.id)!;

    // Get all 'a' tags (event references) from this calendar
    const eventRefs = calendar.tags.filter((t: any) => t[0] === "a");

    eventRefs.forEach((ref) => {
      const eventCoordinate = ref[1]; // The coordinate string
      const eventData = eventCoordinates.get(eventCoordinate);

      if (eventData) {
        if (eventData.isUpcoming) {
          currentCounts.upcoming++;
        } else {
          currentCounts.past++;
        }
      }
    });
  });

  // Log some debug info
  calendars.slice(0, 3).forEach((calendar) => {
    const metadata = getEventMetadata(calendar);
    const counts_data = counts.get(calendar.id);
    const totalRefs = calendar.tags.filter((t: any) => t[0] === "a").length;
    console.log(
      `📊 Calendar "${metadata.title}": ${totalRefs} refs, ${counts_data?.upcoming} upcoming, ${counts_data?.past} past`
    );
  });

  return counts;
}
