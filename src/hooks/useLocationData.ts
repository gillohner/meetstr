// src/hooks/useLocationData.ts
import { useQuery } from '@tanstack/react-query'
import { getLocationInfo } from '@/utils/location/locationInfo'

export const useLocationData = (location?: string, geohash?: string) => 
  useQuery({
    queryKey: ['location', location, geohash],
    queryFn: () => getLocationInfo(location || '', geohash),
    enabled: !!(location || geohash),
    staleTime: 60 * 60 * 1000 // 1 hour
  })