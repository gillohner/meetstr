// src/utils/location/locationLoader.ts
import DataLoader from 'dataloader';
import { getLocationInfo, LocationData } from './locationInfo';

type LocationKey = {
  locationName: string;
  geohash?: string | null;
};

// Create a batch function
const batchLoadLocations = async (keys: LocationKey[]) => {
  console.log(`Batching ${keys.length} location requests`);
  
  // Process in batch but make individual calls for now
  // Could be optimized further with a true batch API endpoint
  return Promise.all(
    keys.map(async ({ locationName, geohash }) => {
      try {
        return await getLocationInfo(locationName, geohash || undefined);
      } catch (error) {
        console.error('Error loading location', error);
        return null;
      }
    })
  );
};

// Create a singleton loader instance
export const locationLoader = new DataLoader<LocationKey, LocationData | null>(
  batchLoadLocations,
  {
    cache: true,
    cacheKeyFn: key => `${key.locationName}|${key.geohash || ''}`,
  }
);
