// src/hooks/useCalendarEvents.ts
import { useQuery } from "@tanstack/react-query";
import { useNdk } from "nostr-hooks";
import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import { useMemo } from "react";

interface UseCalendarEventsOptions {
  calendarCoordinate?: string;
  calendarEvent?: NDKEvent;
  enabled?: boolean;
}

export function useCalendarEvents({
  calendarCoordinate,
  calendarEvent,
  enabled = true,
}: UseCalendarEventsOptions) {
  const { ndk } = useNdk();

  // Extract event coordinates from calendar 'a' tags
  const eventCoordinates = useMemo(() => {
    if (!calendarEvent) return [];
    return calendarEvent.tags
      .filter((tag) => tag[0] === "a")
      .map((tag) => tag[1]);
  }, [calendarEvent]);

  return useQuery({
    queryKey: ["calendar-events", calendarCoordinate, eventCoordinates],
    queryFn: async () => {
      if (!ndk || !eventCoordinates.length) return [];

      const filters: NDKFilter[] = eventCoordinates.map((coordinate) => ({
        kinds: [31922 as any, 31923 as any],
        "#a": [coordinate],
        limit: 50,
      }));

      // Batch fetch all events in parallel
      const eventSets = await Promise.all(
        filters.map((filter) => ndk.fetchEvents(filter))
      );

      // Combine and deduplicate events
      const allEvents = new Map<string, NDKEvent>();
      eventSets.forEach((eventSet) => {
        eventSet.forEach((event) => {
          allEvents.set(event.id, event);
        });
      });

      return Array.from(allEvents.values()).sort((a, b) => {
        const aStart = a.tags.find((t) => t[0] === "start")?.[1];
        const bStart = b.tags.find((t) => t[0] === "start")?.[1];
        return (parseInt(aStart || "0") || 0) - (parseInt(bStart || "0") || 0);
      });
    },
    enabled: enabled && !!ndk && eventCoordinates.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });
}
