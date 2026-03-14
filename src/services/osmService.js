// OSM Overpass API Service
// Fetches free map data from OpenStreetMap

// Helper to reliably get a bounding box from a city name via Nominatim
async function getBoundingBox(cityName) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch location data');

    const data = await res.json();
    if (!data || data.length === 0) {
        throw new Error(`Location "${cityName}" not found.`);
    }

    const result = data[0];
    // return [south, west, north, east] format required by overpass
    return {
        bbox: [
            parseFloat(result.boundingbox[0]), // south
            parseFloat(result.boundingbox[2]), // west
            parseFloat(result.boundingbox[1]), // north
            parseFloat(result.boundingbox[3])  // east
        ],
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon)
    };
}

export async function fetchCityData(cityName) {
    try {
        // 1. Get bounding box coordinates from city name
        const { bbox, lat, lon } = await getBoundingBox(cityName);
        // Overpass bounding box is: (south, west, north, east)
        const bboxString = `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`;

        // 2. We use public Overpass API for graph nodes and roads
        // This query grabs standard roads and specific public infrastructure 
        // without overflowing free API limits.
        const overpassQuery = `
      [out:json][timeout:25];
      (
        // Extract road network
        way["highway"](${bboxString});
        
        // Extract infrastructure
        node["amenity"="hospital"](${bboxString});
        node["amenity"="police"](${bboxString});
        node["amenity"="fire_station"](${bboxString});
        node["amenity"="school"](${bboxString});
      );
      out body;
      >;
      out skel qt;
    `;

        const apiUrl = import.meta.env.VITE_OSM_OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter';

        // Attempt 1: Fetch from Overpass
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: overpassQuery,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!response.ok) {
            throw new Error(`Overpass API Error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        return processOsmData(json, lat, lon, bbox);

    } catch (error) {
        console.error("OSM Error:", error);
        throw error;
    }
}

function processOsmData(rawOsmData, centerLat, centerLon, bbox) {
    const nodesMap = new Map();
    const rawNodes = [];
    const poiNodes = [];   // ← collect POIs separately so they're never lost
    const edges = [];

    const infrastructureStats = {
        hospitals: 0,
        emergency: 0
    };

    // 1. Pass 1: Parse all distinct lat/lon nodes first.
    rawOsmData.elements.forEach(el => {
        if (el.type === 'node') {
            nodesMap.set(el.id, {
                id: el.id,
                lat: el.lat,
                lon: el.lon,
                type: 'intersection', // default
                tags: el.tags || {}
            });

            // Track infrastructure specifically — push POIs into separate array
            if (el.tags && el.tags.amenity) {
                const node = nodesMap.get(el.id);
                if (el.tags.amenity === 'hospital') {
                    node.type = 'hospital';
                    infrastructureStats.hospitals++;
                    poiNodes.push(node);  // ← always collected regardless of ways
                } else if (el.tags.amenity === 'police' || el.tags.amenity === 'fire_station') {
                    node.type = 'emergency';
                    infrastructureStats.emergency++;
                    poiNodes.push(node);
                } else if (el.tags.amenity === 'school') {
                    node.type = 'school';
                    poiNodes.push(node);
                }
            }
        }
    });

    // 2. Pass 2: Parse ways/roads into edges.
    rawOsmData.elements.forEach(el => {
        if (el.type === 'way' && el.nodes && el.nodes.length > 1) {
            // Connect each adjacent node in the way as an edge.
            for (let i = 0; i < el.nodes.length - 1; i++) {
                const sourceId = el.nodes[i];
                const targetId = el.nodes[i + 1];

                const sourceNode = nodesMap.get(sourceId);
                const targetNode = nodesMap.get(targetId);

                if (sourceNode && targetNode) {
                    edges.push({
                        id: `e_${sourceId}_${targetId}`,
                        source: sourceNode,
                        target: targetNode,
                        roadType: el.tags?.highway || 'unknown'
                    });

                    // Add to our final node list if not already there 
                    // (We use a Set to keep clean unique arrays later, but push first here)
                    rawNodes.push(sourceNode);
                    rawNodes.push(targetNode);
                }
            }
        }
    });

    // Generate unique nodes array: road intersections + always include POIs
    const seenIds = new Set();
    const uniqueNodes = [];
    for (const n of [...rawNodes, ...poiNodes]) {
        if (!seenIds.has(n.id)) {
            seenIds.add(n.id);
            uniqueNodes.push(n);
        }
    }

    return {
        center: [centerLon, centerLat],
        // leafletBounds format: [[south, west], [north, east]]
        bbox: [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
        nodes: uniqueNodes,
        edges: edges,
        infrastructure: infrastructureStats,
        rawOsm: null
    };
}
