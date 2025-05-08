// src/hooks/useLocationInfo.ts
import { useQuery } from '@tanstack/react-query';
import { locationLoader } from '@/utils/location/loader';
import { LocationData } from '@/utils/location/locationInfo';

export function useLocationInfo(locationName?: string | null, geohash?: string | null) {
  // Create a stable query key
  const queryKey = ['location', locationName || '', geohash || ''];
  
  return useQuery<LocationData | null>({
    queryKey,
    queryFn: () => locationLoader.load({ 
      locationName: locationName || '', 
      geohash
    }),
    enabled: Boolean(locationName || geohash),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
