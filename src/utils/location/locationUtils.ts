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

// Create a more aggressive rate limiter instance for all Nominatim requests
const rateLimiter = new RateLimiter(800); // Faster: 1.25 requests per second

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
      google: `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude},${encodeURIComponent(osmResult.display_name || "")}`,
      apple: `https://maps.apple.com/?q=${encodeURIComponent(osmResult.name || "")}&ll=${coords.latitude},${coords.longitude}`,
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

// Location normalization and geolocation utilities

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface NormalizedLocation {
  original: string;
  normalized: string;
  coordinates?: GeolocationCoordinates;
  country?: string;
  region?: string;
}

// City and country normalizations for German-speaking areas
const LOCATION_NORMALIZATIONS: Record<string, NormalizedLocation> = {
  // Switzerland variations
  schweiz: {
    original: "schweiz",
    normalized: "Switzerland",
    coordinates: { latitude: 46.8182, longitude: 8.2275 },
    country: "Switzerland",
  },
  switzerland: {
    original: "switzerland",
    normalized: "Switzerland",
    coordinates: { latitude: 46.8182, longitude: 8.2275 },
    country: "Switzerland",
  },
  suisse: {
    original: "suisse",
    normalized: "Switzerland",
    coordinates: { latitude: 46.8182, longitude: 8.2275 },
    country: "Switzerland",
  },
  svizzera: {
    original: "svizzera",
    normalized: "Switzerland",
    coordinates: { latitude: 46.8182, longitude: 8.2275 },
    country: "Switzerland",
  },
  ch: {
    original: "ch",
    normalized: "Switzerland",
    coordinates: { latitude: 46.8182, longitude: 8.2275 },
    country: "Switzerland",
  },

  // Major Swiss cities
  zurich: {
    original: "zurich",
    normalized: "Zurich, Switzerland",
    coordinates: { latitude: 47.3769, longitude: 8.5417 },
    country: "Switzerland",
    region: "Zurich",
  },
  zürich: {
    original: "zürich",
    normalized: "Zurich, Switzerland",
    coordinates: { latitude: 47.3769, longitude: 8.5417 },
    country: "Switzerland",
    region: "Zurich",
  },
  bern: {
    original: "bern",
    normalized: "Bern, Switzerland",
    coordinates: { latitude: 46.9481, longitude: 7.4474 },
    country: "Switzerland",
    region: "Bern",
  },
  berne: {
    original: "berne",
    normalized: "Bern, Switzerland",
    coordinates: { latitude: 46.9481, longitude: 7.4474 },
    country: "Switzerland",
    region: "Bern",
  },
  geneva: {
    original: "geneva",
    normalized: "Geneva, Switzerland",
    coordinates: { latitude: 46.2044, longitude: 6.1432 },
    country: "Switzerland",
    region: "Geneva",
  },
  genève: {
    original: "genève",
    normalized: "Geneva, Switzerland",
    coordinates: { latitude: 46.2044, longitude: 6.1432 },
    country: "Switzerland",
    region: "Geneva",
  },
  basel: {
    original: "basel",
    normalized: "Basel, Switzerland",
    coordinates: { latitude: 47.5596, longitude: 7.5886 },
    country: "Switzerland",
    region: "Basel",
  },
  "basel-stadt": {
    original: "basel-stadt",
    normalized: "Basel, Switzerland",
    coordinates: { latitude: 47.5596, longitude: 7.5886 },
    country: "Switzerland",
    region: "Basel",
  },
  lausanne: {
    original: "lausanne",
    normalized: "Lausanne, Switzerland",
    coordinates: { latitude: 46.5197, longitude: 6.6323 },
    country: "Switzerland",
    region: "Vaud",
  },

  // Germany variations
  deutschland: {
    original: "deutschland",
    normalized: "Germany",
    coordinates: { latitude: 51.1657, longitude: 10.4515 },
    country: "Germany",
  },
  germany: {
    original: "germany",
    normalized: "Germany",
    coordinates: { latitude: 51.1657, longitude: 10.4515 },
    country: "Germany",
  },
  allemagne: {
    original: "allemagne",
    normalized: "Germany",
    coordinates: { latitude: 51.1657, longitude: 10.4515 },
    country: "Germany",
  },
  de: {
    original: "de",
    normalized: "Germany",
    coordinates: { latitude: 51.1657, longitude: 10.4515 },
    country: "Germany",
  },

  // Major German cities
  berlin: {
    original: "berlin",
    normalized: "Berlin, Germany",
    coordinates: { latitude: 52.52, longitude: 13.405 },
    country: "Germany",
    region: "Berlin",
  },
  münchen: {
    original: "münchen",
    normalized: "Munich, Germany",
    coordinates: { latitude: 48.1351, longitude: 11.582 },
    country: "Germany",
    region: "Bavaria",
  },
  munich: {
    original: "munich",
    normalized: "Munich, Germany",
    coordinates: { latitude: 48.1351, longitude: 11.582 },
    country: "Germany",
    region: "Bavaria",
  },
  hamburg: {
    original: "hamburg",
    normalized: "Hamburg, Germany",
    coordinates: { latitude: 53.5511, longitude: 9.9937 },
    country: "Germany",
    region: "Hamburg",
  },
  köln: {
    original: "köln",
    normalized: "Cologne, Germany",
    coordinates: { latitude: 50.9375, longitude: 6.9603 },
    country: "Germany",
    region: "North Rhine-Westphalia",
  },
  cologne: {
    original: "cologne",
    normalized: "Cologne, Germany",
    coordinates: { latitude: 50.9375, longitude: 6.9603 },
    country: "Germany",
    region: "North Rhine-Westphalia",
  },
  frankfurt: {
    original: "frankfurt",
    normalized: "Frankfurt, Germany",
    coordinates: { latitude: 50.1109, longitude: 8.6821 },
    country: "Germany",
    region: "Hesse",
  },

  // Austria variations
  österreich: {
    original: "österreich",
    normalized: "Austria",
    coordinates: { latitude: 47.5162, longitude: 14.5501 },
    country: "Austria",
  },
  austria: {
    original: "austria",
    normalized: "Austria",
    coordinates: { latitude: 47.5162, longitude: 14.5501 },
    country: "Austria",
  },
  autriche: {
    original: "autriche",
    normalized: "Austria",
    coordinates: { latitude: 47.5162, longitude: 14.5501 },
    country: "Austria",
  },
  at: {
    original: "at",
    normalized: "Austria",
    coordinates: { latitude: 47.5162, longitude: 14.5501 },
    country: "Austria",
  },

  // Major Austrian cities
  wien: {
    original: "wien",
    normalized: "Vienna, Austria",
    coordinates: { latitude: 48.2082, longitude: 16.3738 },
    country: "Austria",
    region: "Vienna",
  },
  vienna: {
    original: "vienna",
    normalized: "Vienna, Austria",
    coordinates: { latitude: 48.2082, longitude: 16.3738 },
    country: "Austria",
    region: "Vienna",
  },
  salzburg: {
    original: "salzburg",
    normalized: "Salzburg, Austria",
    coordinates: { latitude: 47.8095, longitude: 13.055 },
    country: "Austria",
    region: "Salzburg",
  },
  innsbruck: {
    original: "innsbruck",
    normalized: "Innsbruck, Austria",
    coordinates: { latitude: 47.2692, longitude: 11.4041 },
    country: "Austria",
    region: "Tyrol",
  },
  graz: {
    original: "graz",
    normalized: "Graz, Austria",
    coordinates: { latitude: 47.0707, longitude: 15.4395 },
    country: "Austria",
    region: "Styria",
  },

  // General regions
  europa: {
    original: "europa",
    normalized: "Europe",
    coordinates: { latitude: 54.526, longitude: 15.2551 },
  },
  europe: {
    original: "europe",
    normalized: "Europe",
    coordinates: { latitude: 54.526, longitude: 15.2551 },
  },
  dach: {
    original: "dach",
    normalized: "DACH Region",
    coordinates: { latitude: 47.5, longitude: 10.5 },
  },
};

/**
 * Normalize a location string to a standardized format
 */
export function normalizeLocation(location: string): NormalizedLocation {
  const cleanLocation = location.toLowerCase().trim();

  // Try exact match first
  const exactMatch = LOCATION_NORMALIZATIONS[cleanLocation];
  if (exactMatch) {
    return exactMatch;
  }

  // Try partial matches for cities with country suffixes
  for (const [key, value] of Object.entries(LOCATION_NORMALIZATIONS)) {
    if (cleanLocation.includes(key) || key.includes(cleanLocation)) {
      return value;
    }
  }

  // Return original if no match found
  return {
    original: location,
    normalized: location,
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  coord1: GeolocationCoordinates,
  coord2: GeolocationCoordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get user's current location using browser geolocation API
 */
export function getCurrentLocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Get all normalized locations for autocomplete
 */
export function getAllNormalizedLocations(): string[] {
  return Object.values(LOCATION_NORMALIZATIONS).map((loc) => loc.normalized);
}

/**
 * Check if an event location is within a radius of a given coordinate
 */
export function isLocationWithinRadius(
  eventLocation: string,
  centerCoordinates: GeolocationCoordinates,
  radiusKm: number
): boolean {
  const normalizedLocation = normalizeLocation(eventLocation);

  if (!normalizedLocation.coordinates) {
    return false;
  }

  const distance = calculateDistance(
    centerCoordinates,
    normalizedLocation.coordinates
  );
  return distance <= radiusKm;
}
