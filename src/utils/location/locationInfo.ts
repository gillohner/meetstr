// src/utils/locationUtils.ts
import { decodeGeohash } from '@/utils/location/geohash';
import { fetchOsmTags } from '@/utils/location/osmTags';

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
}

export async function getLocationInfo(locationName: string, geohash?: string): Promise<LocationData | null> {
  try {
    let osmResult: any = null;
    
    // Try location name search first
    if (locationName) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`
      );
      
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
    const osmTags = await fetchOsmTags(
      osmResult.osm_type, 
      osmResult.osm_id
    );

    const paymentMethods = {
      acceptsBitcoin: osmTags['currency:XBT'] === 'yes',  // Direct key access
      onChain: osmTags['payment:onchain'] === 'yes',
      lightning: osmTags['payment:lightning'] === 'yes',
      contactless: osmTags['payment:lightning_contactless'] === 'yes'
    };

    console.log('Payment Methods:', paymentMethods);

    // Generate map links
    const coords = {
      latitude: parseFloat(osmResult.lat),
      longitude: parseFloat(osmResult.lon)
    };

    const mapLinks = {
      osm: `https://openstreetmap.org/${osmResult.osm_type}/${osmResult.osm_id}`,
      google: `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude},${osmResult.display_name}`,
      apple: `https://maps.apple.com/?q=${osmResult.name}&ll=${coords.latitude},${coords.longitude}`,
      btcmap: `https://btcmap.org/merchant/${osmResult.osm_type}:${osmResult.osm_id}`,
    };

    return {
      coords,
      osmInfo: {
        displayName: osmResult.display_name,
        id: osmResult.osm_id,
        type: osmResult.type,
        tags: osmResult.tags || {}
      },
      paymentMethods,
      mapLinks
    };

  } catch (error) {
    console.error('Location service error:', error);
    return null;
  }
}
