// src/utils/location/locationUtils.ts
import { decodeGeohash } from "@/utils/location/geohash";
import { fetchOsmTags } from "@/utils/location/osmTags";
import addressFormatter from "@fragaria/address-formatter";
import type { LocationData } from "@/types/location";

// In-memory cache for Nominatim and OSM API calls (keyed by URL)
const nominatimCache: Record<string, any> = {};

// Rate limiter queue implementation
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly intervalMs: number;

  constructor(intervalMs: number = 1000) {
    this.intervalMs = intervalMs;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.intervalMs) {
        const waitTime = this.intervalMs - timeSinceLastRequest;
        console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      const task = this.queue.shift();
      if (task) {
        this.lastRequestTime = Date.now();
        await task();
      }
    }

    this.processing = false;
  }
}

// Create a single rate limiter instance for all Nominatim requests
const rateLimiter = new RateLimiter(1000); // 1 request per second

// Helper to fetch with cache and rate limiting
async function fetchWithCache(url: string) {
  console.log("url: ", url);

  if (nominatimCache[url]) {
    console.log("Cache hit for URL:", url);
    return nominatimCache[url];
  }

  console.log("Cache miss for URL:", url);

  // Use rate limiter to control requests
  const data = await rateLimiter.add(async () => {
    const response = await fetch(url, {
      headers: { "User-Agent": "meetstr-nostr" },
    });
    console.log("Response status:", response.status);

    if (!response.ok) return null;

    const result = await response.json();
    console.log("Fetched data:", result);
    return result;
  });

  if (data) {
    nominatimCache[url] = data;
  }

  return data;
}

export async function getLocationInfo(
  locationName: string,
  geohash?: string
): Promise<LocationData | null> {
  try {
    let osmResult: any = null;

    console.log("Fetching location info for:", locationName, geohash);

    // Try location name search first
    if (locationName) {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;
      const results = await fetchWithCache(url);
      osmResult = results?.[0];
    }

    // Fallback to geohash reverse geocoding
    if (!osmResult && geohash) {
      const decoded = decodeGeohash(geohash);
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${decoded.latitude}&lon=${decoded.longitude}&format=json`;
      osmResult = await fetchWithCache(url);
    }

    if (!osmResult) return null;

    // Fetch complete payment tags from Overpass (could also be rate limited if needed)
    const osmTags = await fetchOsmTags(osmResult.osm_type, osmResult.osm_id);

    const paymentMethods = {
      acceptsBitcoin: osmTags["currency:XBT"] === "yes",
      onChain: osmTags["payment:onchain"] === "yes",
      lightning: osmTags["payment:lightning"] === "yes",
      contactless: osmTags["payment:lightning_contactless"] === "yes",
    };

    // Generate map links
    const coords = {
      latitude: parseFloat(osmResult.lat),
      longitude: parseFloat(osmResult.lon),
    };

    const mapLinks = {
      osm: `https://openstreetmap.org/${osmResult.osm_type}/${osmResult.osm_id}`,
      google: `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude},${osmResult.display_name}`,
      apple: `https://maps.apple.com/?q=${osmResult.name}&ll=${coords.latitude},${coords.longitude}`,
      ...(paymentMethods.acceptsBitcoin && {
        btcmap: `https://btcmap.org/merchant/${osmResult.osm_type}:${osmResult.osm_id}`,
      }),
    };

    const addressComponents = {
      houseNumber:
        osmTags["addr:housenumber"] || osmResult.address?.house_number,
      road: osmTags["addr:street"] || osmResult.address?.road,
      city: osmTags["addr:city"] || osmResult.address?.city,
      postcode: osmTags["addr:postcode"] || osmResult.address?.postcode,
      state: osmTags["addr:state"] || osmResult.address?.state,
      country: osmTags["addr:country"] || osmResult.address?.country,
      countryCode: osmResult.address?.country_code,
    };

    const formattedName = osmTags.name;
    const formattedAddress = addressFormatter.format(addressComponents);

    return {
      coords,
      osmInfo: {
        displayName: osmResult.display_name,
        id: osmResult.osm_id,
        type: osmResult.type,
        tags: osmResult.tags || {},
      },
      paymentMethods,
      mapLinks,
      formattedName,
      formattedAddress,
    };
  } catch (error) {
    console.error("Location service error:", error);
    return null;
  }
}
