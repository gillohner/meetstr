// src/hooks/useCalendarData.ts
import { useQuery } from "@tanstack/react-query";
import { useNdk } from "nostr-hooks";
import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

interface UseCalendarDataOptions {
  naddr?: string;
  enabled?: boolean;
}

export function useCalendarData({
  naddr,
  enabled = true,
}: UseCalendarDataOptions) {
  const { ndk } = useNdk();

  return useQuery({
    queryKey: ["calendar", naddr],
    queryFn: async () => {
      if (!ndk || !naddr) return null;

      try {
        // Decode naddr to get coordinate parts
        const decoded = nip19.decode(naddr);
        if (decoded.type !== "naddr") return null;

        const { pubkey, kind, identifier } = decoded.data;

        // Single optimized query for calendar
        const filter: NDKFilter = {
          kinds: [kind as any],
          authors: [pubkey],
          "#d": [identifier],
          limit: 1,
        };

        const events = await ndk.fetchEvents(filter);
        return events.size > 0 ? Array.from(events)[0] : null;
      } catch (error) {
        console.error("Error fetching calendar:", error);
        return null;
      }
    },
    enabled: enabled && !!ndk && !!naddr,
    staleTime: 1000 * 60 * 10, // 10 minutes (calendars change less frequently)
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
