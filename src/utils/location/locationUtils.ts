// src/utils/location/locationUtils.ts
import { decodeGeohash } from "@/utils/location/geohash";
import { fetchOsmTags } from "@/utils/location/osmTags";
import addressFormatter from "@fragaria/address-formatter";
import type { LocationData } from "@/types/location";

// In-memory cache for Nominatim and OSM API calls (keyed by URL)
const nominatimCache: Record<string, any> = {};

// Helper to fetch with cache
async function fetchWithCache(url: string) {
  console.log("url: ", url);
  if (nominatimCache[url]) {
    console.log("Cache hit for URL:", url);
    return nominatimCache[url];
  }
  console.log("Cache miss for URL:", url);
  const response = await fetch(url, { headers: { "User-Agent": "meetstr" } });
  console.log("Response status:", response.status);
  if (!response.ok) return null;
  const data = await response.json();
  console.log("Fetched data:", data);
  nominatimCache[url] = data;
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

    // Fetch complete payment tags from Overpass (no cache here, but could be added similarly)
    const osmTags = await fetchOsmTags(osmResult.osm_type, osmResult.osm_id);

    const paymentMethods = {
      acceptsBitcoin: osmTags["currency:XBT"] === "yes", // Direct key access
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
