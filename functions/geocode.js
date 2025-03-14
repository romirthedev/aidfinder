const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { query } = event.queryStringParameters;
    if (!query) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Query parameter required' })
        };
    }

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
        const data = await response.json();
        if (data.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) })
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Location not found' })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Geocoding failed' })
        };
    }
};
