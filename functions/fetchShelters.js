const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { lat, lon, radius = 50000 } = event.queryStringParameters; // Radius in meters, default 50km
    if (!lat || !lon) {
        return { statusCode: 400, body: JSON.stringify({ error: 'lat and lon parameters required' }) };
    }

    // Calculate bounding box (approximate, for simplicity)
    const latRad = radius / 111000; // 1 degree lat ~ 111km
    const lonRad = radius / (111000 * Math.cos(lat * Math.PI / 180));
    const bbox = `${lat - latRad},${lon - lonRad},${lat + latRad},${lon + lonRad}`;

    const overpassQuery = `
        [out:json];
        node["amenity"~"shelter|social_facility|food_bank"](${bbox});
        out body;
    `;

    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: overpassQuery
        });
        const data = await response.json();

        const shelters = data.elements.map(node => ({
            name: node.tags.name || `Unnamed ${node.tags.amenity || 'Shelter'}`,
            lat: node.lat,
            lon: node.lon,
            type: node.tags.amenity === 'food_bank' ? 'food' : node.tags.amenity === 'shelter' ? 'shelter' : 'medical', // Simplified mapping
            updated: new Date().toISOString().split('T')[0] // Mock update date
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(shelters)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch shelters', details: error.message })
        };
    }
};
