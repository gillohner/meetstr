// src/utils/location/locationUtils.ts
import { decodeGeohash } from "@/utils/location/geohash";
import { fetchOsmTags } from "@/utils/location/osmTags";
import addressFormatter from "@fragaria/address-formatter";
import type { LocationData } from "@/types/location";

export async function getLocationInfo(
  locationName: string,
  geohash?: string
): Promise<LocationData | null> {
  try {
    let osmResult: any = null;

    console.log("Fetching location info for:", locationName, geohash);

    // Try location name search first
    if (locationName) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`
      );

      console.log(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`
      );
      console.log("Location search response:", response);

      if (response.ok) {
        const results = await response.json();
        osmResult = results[0];
      }
    }

    // Fallback to geohash reverse geocoding
    if (!osmResult && geohash) {
      const decoded = decodeGeohash(geohash);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${decoded.latitude}&lon=${decoded.longitude}&format=json`
      );

      if (response.ok) {
        osmResult = await response.json();
      }
    }

    if (!osmResult) return null;

    // Fetch complete payment tags from Overpass
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
      houseNumber: osmTags["addr:housenumber"] || osmResult.address?.house_number,
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
