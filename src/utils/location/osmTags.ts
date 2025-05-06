// src/utils/location/osmTags.ts
import axios from 'axios';

// Function to fetch payment tags from OSM using Overpass API
const fetchOsmTags = async (osmType: string, osmId: number) => {
    const query = `
        [out:json];
        ${osmType}(${osmId});
        out tags;
    `;
    const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
    
    try {
        const response = await axios.get(url);
        return response.data.elements[0]?.tags || {};
    } catch (error) {
        console.error('Error fetching OSM payment tags:', error);
        return {};
    }
}

export { fetchOsmTags };