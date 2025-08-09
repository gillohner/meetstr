// src/hooks/useProfilesBatch.ts
import { useQuery } from "@tanstack/react-query";
import { useNdk } from "nostr-hooks";
import { type NDKFilter } from "@nostr-dev-kit/ndk";
import { useMemo } from "react";

export function useProfilesBatch(pubkeys: string[]) {
  const { ndk } = useNdk();

  // Deduplicate pubkeys
  const uniquePubkeys = useMemo(() => [...new Set(pubkeys)], [pubkeys]);

  return useQuery({
    queryKey: ["profiles-batch", uniquePubkeys.sort()],
    queryFn: async () => {
      if (!ndk || uniquePubkeys.length === 0) return new Map();

      // Batch fetch all profiles in one query
      const filter: NDKFilter = {
        kinds: [0],
        authors: uniquePubkeys,
        limit: uniquePubkeys.length,
      };

      const profiles = await ndk.fetchEvents(filter);
      const profileMap = new Map();

      profiles.forEach((profile) => {
        try {
          const metadata = JSON.parse(profile.content);
          profileMap.set(profile.pubkey, {
            ...metadata,
            pubkey: profile.pubkey,
          });
        } catch (error) {
          console.warn("Failed to parse profile metadata:", error);
        }
      });

      return profileMap;
    },
    enabled: !!ndk && uniquePubkeys.length > 0,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
}
