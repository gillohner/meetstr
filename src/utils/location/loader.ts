// src/utils/location/loader.ts
import DataLoader from "dataloader";
import { getLocationInfo, LocationData } from "./locationUtils";

type LocationKey = {
  locationName: string;
  geohash?: string | null;
};

const batchLoadLocations = async (keys: readonly LocationKey[]) => {
  return Promise.all(
    keys.map(({ locationName, geohash }) => getLocationInfo(locationName, geohash || undefined))
  );
};

export const locationLoader = new DataLoader<LocationKey, LocationData | null>(batchLoadLocations, {
  cache: true,
  cacheKeyFn: (key) => `${key.locationName}|${key.geohash || ""}`,
});
