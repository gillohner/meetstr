// src/hooks/useLocationInfo.ts
import { useQuery } from "@tanstack/react-query";
import { locationLoader } from "@/utils/location/loader";
import type { LocationData } from "@/types/location";

export function useLocationInfo(
  locationName?: string | null,
  geohash?: string | null
) {
  return useQuery<LocationData | null>({
    queryKey: ["location", locationName, geohash],
    queryFn: () =>
      locationLoader.load({
        locationName: locationName || "",
        geohash: geohash || "",
      }),
    enabled: Boolean(locationName || geohash),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
