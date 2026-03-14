// Elevation Service using Open-Meteo Elevation API
// https://open-meteo.com/en/docs/elevation-api
// Free, no API key, CORS-enabled — works directly from the browser
import { supabase } from './supabaseClient';

const ELEVATION_API = 'https://api.open-meteo.com/v1/elevation';
const GRID_SIZE = 8; // 8×8 = 64 sample points

/**
 * Sample elevation at an 8×8 grid across the bounding box.
 * Returns array of { lat, lon, elevation } objects.
 */
export async function fetchElevationGrid(cityName, bbox) {
    const normalizedName = cityName.toLowerCase().trim();

    // 0. Check Supabase Cache first
    const { data: cacheData } = await supabase
        .from('city_cache')
        .select('elevation_data')
        .eq('city_name', normalizedName)
        .single();

    if (cacheData?.elevation_data) {
        console.log(`[Cache Hit] Serving elevation data for '${cityName}' from Supabase.`);
        return cacheData.elevation_data;
    }

    console.log(`[Cache Miss] Fetching fresh elevation data for '${cityName}' from Open-Meteo...`);

    const [[south, west], [north, east]] = bbox;

    const points = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const lat = south + (north - south) * (row + 0.5) / GRID_SIZE;
            const lon = west + (east - west) * (col + 0.5) / GRID_SIZE;
            points.push({ lat, lon });
        }
    }

    // Open-Meteo accepts comma-separated lat and lon arrays as query params
    const lats = points.map(p => p.lat.toFixed(6)).join(',');
    const lons = points.map(p => p.lon.toFixed(6)).join(',');
    const url = `${ELEVATION_API}?latitude=${lats}&longitude=${lons}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Elevation API error ${res.status}`);

    const json = await res.json();
    if (!json.elevation) throw new Error('No elevation data in response');

    const elevationResult = json.elevation.map((elev, i) => ({
        lat: points[i].lat,
        lon: points[i].lon,
        elevation: elev ?? 0,
    }));

    // Save to cache asynchronously 
    // (Note: city_name row should already exist from fetchCityData)
    supabase.from('city_cache')
        .update({ elevation_data: elevationResult })
        .eq('city_name', normalizedName)
        .then(({ error }) => {
            if (error) console.error("Error writing elevation to cache:", error.message);
        });

    return elevationResult;
}


/**
 * Estimate elevation at an arbitrary [lat, lon] using Inverse Distance Weighting (IDW)
 * over the sampled grid.
 */
export function interpolateElevation(lat, lon, samples) {
    if (!samples || samples.length === 0) return null;

    let weightedSum = 0;
    let weightTotal = 0;

    for (const s of samples) {
        const dist = Math.sqrt((lat - s.lat) ** 2 + (lon - s.lon) ** 2);
        if (dist < 1e-8) return s.elevation; // Exactly on a sample point
        const w = 1 / (dist * dist);
        weightedSum += w * s.elevation;
        weightTotal += w;
    }

    return weightedSum / weightTotal;
}

/**
 * Map elevation (in metres) to a discrete stepped topographic colour.
 * Avoids generic smooth gradients — uses clear colour tiers.
 */
export function elevationToColor(elevation) {
    if (elevation === null || elevation === undefined) return '#cccccc';
    if (elevation < 0) return '#9ec8f0'; // Below sea level — blue
    if (elevation < 5) return '#c8e6b0'; // Sea-level flat — pale green
    if (elevation < 20) return '#a8d080'; // Low — green
    if (elevation < 50) return '#e8e060'; // Moderate — yellow-green
    if (elevation < 100) return '#f0c040'; // Mid — amber
    if (elevation < 200) return '#e08030'; // Higher — orange
    if (elevation < 500) return '#c05018'; // High — red-orange
    return '#8b3010'; // Very high — dark maroon
}

/**
 * Return a human-readable label for elevation tier.
 */
export function elevationLabel(elevation) {
    if (elevation === null || elevation === undefined) return 'Unknown';
    if (elevation < 0) return `${elevation.toFixed(1)} m  (Below sea level)`;
    if (elevation < 5) return `${elevation.toFixed(1)} m  (Coastal flat)`;
    if (elevation < 20) return `${elevation.toFixed(1)} m  (Low-lying)`;
    if (elevation < 50) return `${elevation.toFixed(1)} m  (Moderate)`;
    if (elevation < 100) return `${elevation.toFixed(1)} m  (Elevated)`;
    if (elevation < 200) return `${elevation.toFixed(1)} m  (High ground)`;
    if (elevation < 500) return `${elevation.toFixed(1)} m  (Hills)`;
    return `${elevation.toFixed(1)} m  (Mountain)`;
}
