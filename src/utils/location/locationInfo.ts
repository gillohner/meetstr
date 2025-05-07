// src/utils/location/locationInfo.ts
import { decodeGeohash } from '@/utils/location/geohash';
import { fetchOsmTags } from '@/utils/location/osmTags';
import addressFormatter from '@fragaria/address-formatter';
import { cache } from '@/utils/cacheManager';
import { enqueueNominatimRequest } from '@/utils/batchService';
import { retryWithBackoff } from '@/utils/errorRecovery';

export interface LocationData {
  coords: { latitude: number; longitude: number };
  osmInfo?: {
    displayName: string;
    id: number;
    type: string;
    tags: Record<string, string>;
  };
  paymentMethods: {
    acceptsBitcoin: boolean;
    onChain: boolean;
    lightning: boolean;
    contactless: boolean;
  };
  mapLinks: Record<string, string>;
  formattedName: string;
  formattedAddress: string;
}

export async function getLocationInfo(locationName: string, geohash?: string): Promise<LocationData | null> {
  const cacheKey = `location-${locationName}-${geohash}`;
  const cached = cache.get(cacheKey);
  // if (cached) return cached;

  try {
    let osmResult: any = null;
    
    console.log('Location name try:', locationName);
    // Try location name search first
    if (locationName) {
      osmResult = await enqueueNominatimRequest(locationName)
    }
    console.log('OSM result 1:', osmResult);

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


    console.log('OSM result:', osmResult);
    // Fetch complete payment tags from Overpass
    const osmTags = await fetchOsmTags(
      osmResult.osm_type, 
      osmResult.osm_id
    );
    console.log('OSM tags:', osmTags);

    const paymentMethods = {
      acceptsBitcoin: osmTags['currency:XBT'] === 'yes',  // Direct key access
      onChain: osmTags['payment:onchain'] === 'yes',
      lightning: osmTags['payment:lightning'] === 'yes',
      contactless: osmTags['payment:lightning_contactless'] === 'yes'
    };

    // Generate map links
    const coords = {
      latitude: parseFloat(osmResult.lat),
      longitude: parseFloat(osmResult.lon)
    };

    const mapLinks = {
      osm: `https://openstreetmap.org/${osmResult.osm_type}/${osmResult.osm_id}`,
      google: `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude},${osmResult.display_name}`,
      apple: `https://maps.apple.com/?q=${osmResult.name}&ll=${coords.latitude},${coords.longitude}`,
      ...(paymentMethods.acceptsBitcoin && {
        btcmap: `https://btcmap.org/merchant/${osmResult.osm_type}:${osmResult.osm_id}`
      }),
    };

    const addressComponents = {
      houseNumber: osmTags['addr:housenumber'] || osmResult.address?.house_number,
      road: osmTags['addr:street'] || osmResult.address?.road,
      city: osmTags['addr:city'] || osmResult.address?.city,
      postcode: osmTags['addr:postcode'] || osmResult.address?.postcode,
      state: osmTags['addr:state'] || osmResult.address?.state,
      country: osmTags['addr:country'] || osmResult.address?.country,
      countryCode: osmResult.address?.country_code
    };

    const formattedName = osmTags.name;
    const formattedAddress = addressFormatter.format(addressComponents);

    const result = {
      coords,
      osmInfo: {
        displayName: osmResult.display_name,
        id: osmResult.osm_id,
        type: osmResult.type,
        tags: osmResult.tags || {}
      },
      paymentMethods,
      mapLinks,
      formattedName,
      formattedAddress
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    await retryWithBackoff(() => getLocationInfo(locationName, geohash));
    console.error('Location service error:', error);
    return null;
  }
}
