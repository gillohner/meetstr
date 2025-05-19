// src/utils/location/geohash.ts
const BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";
const BASE32_CODES_DICT: Record<string, number> = {};

// Build dictionary for faster lookup
for (let i = 0; i < BASE32_CODES.length; i++) {
  BASE32_CODES_DICT[BASE32_CODES[i]] = i;
}

export function encodeGeohash(lat: number, lon: number, precision = 9): string {
  let isLon = true;
  let hash = "";
  let bit = 0;
  let ch = 0;

  const latRange: [number, number] = [-90, 90];
  const lonRange: [number, number] = [-180, 180];

  while (hash.length < precision) {
    if (isLon) {
      const mid = (lonRange[0] + lonRange[1]) / 2;
      if (lon >= mid) {
        ch = (ch << 1) | 1;
        lonRange[0] = mid;
      } else {
        ch = (ch << 1) | 0;
        lonRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat >= mid) {
        ch = (ch << 1) | 1;
        latRange[0] = mid;
      } else {
        ch = (ch << 1) | 0;
        latRange[1] = mid;
      }
    }

    isLon = !isLon;
    if (++bit === 5) {
      hash += BASE32_CODES[ch];
      bit = 0;
      ch = 0;
    }
  }

  return hash;
}

export function decodeGeohash(geohash: string) {
  let isLon = true;
  const lat: [number, number] = [-90, 90];
  const lon: [number, number] = [-180, 180];
  let bit = 0;
  let ch = 0;

  geohash
    .toLowerCase()
    .split("")
    .forEach((char) => {
      const code = BASE32_CODES_DICT[char];
      if (code === undefined) throw new Error("Invalid geohash character");

      for (let bits = 4; bits >= 0; bits--) {
        const bitVal = (code >> bits) & 1;
        if (isLon) {
          const mid = (lon[0] + lon[1]) / 2;
          if (bitVal === 1) lon[0] = mid;
          else lon[1] = mid;
        } else {
          const mid = (lat[0] + lat[1]) / 2;
          if (bitVal === 1) lat[0] = mid;
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
