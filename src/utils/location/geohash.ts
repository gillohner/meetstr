// src/utils/location/geohash.ts
const BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";

export function decodeGeohash(geohash: string) {
  let isLon = true;
  const lat: [number, number] = [-90, 90];
  const lon: [number, number] = [-180, 180];

  geohash
    .toLowerCase()
    .split("")
    .forEach((char) => {
      const code = BASE32_CODES.indexOf(char);
      if (code === -1) throw new Error("Invalid geohash character");

      for (let bits = 4; bits >= 0; bits--) {
        const bit = (code >> bits) & 1;
        if (isLon) {
          const mid = (lon[0] + lon[1]) / 2;
          if (bit === 1) lon[0] = mid;
          else lon[1] = mid;
        } else {
          const mid = (lat[0] + lat[1]) / 2;
          if (bit === 1) lat[0] = mid;
          else lat[1] = mid;
        }
        isLon = !isLon;
      }
    });

  return {
    latitude: (lat[0] + lat[1]) / 2,
    longitude: (lon[0] + lon[1]) / 2,
    error: {
      latitude: lat[1] - lat[0],
      longitude: lon[1] - lon[0],
    },
  };
}
