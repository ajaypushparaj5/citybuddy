import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap, Rectangle, useMapEvents, Polygon, Marker } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Hospital, ShieldAlert, Flame, School, AlertTriangle, CloudRain, Car } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { interpolateElevation, elevationToColor, elevationLabel } from '../services/elevationService';

// ── Fly + lock map bounds to selected city ────────────────────────────────────
function BoundsManager({ center, bbox }) {
    const map = useMap();
    useEffect(() => {
        if (!center || !bbox) return;
        map.flyTo(center, 15, { duration: 1.2 });
        map.setMaxBounds(bbox);
        const boundsZoom = map.getBoundsZoom(bbox);
        map.setMinZoom(boundsZoom);
    }, [center, bbox, map]);
    return null;
}

// ── Click handler: get lat/lon + interpolated elevation ───────────────────────
function ClickHandler({ elevationSamples, onMapClick }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            const elev = elevationSamples
                ? interpolateElevation(lat, lng, elevationSamples)
                : null;
            onMapClick({ lat, lng, elevation: elev });
        }
    });
    return null;
}

// ── Selection handler: draws a 500m x 500m square around click ────────────────
function SelectionHandler({ onSelect }) {
    useMapEvents({
        contextmenu(e) { // Right click to select an area
            const { lat, lng } = e.latlng;
            // ~500m square in degrees (rough estimation)
            const d = 0.0025; 
            const bbox = [[lat - d, lng - d], [lat + d, lng + d]];
            onSelect(bbox);
        }
    });
    return null;
}

// ── Elevation grid rectangles (Smoothed via high-density IDW) ─────────────────
function ElevationLayer({ elevationSamples, bbox }) {
    if (!elevationSamples || elevationSamples.length === 0) return null;

    const [[south, west], [north, east]] = bbox;

    // Create a denser 30x30 grid for a smoother visual blend
    const DENSE_GRID = 30;
    const cellLatH = (north - south) / DENSE_GRID / 2;
    const cellLonH = (east - west) / DENSE_GRID / 2;

    const rects = [];
    for (let row = 0; row < DENSE_GRID; row++) {
        for (let col = 0; col < DENSE_GRID; col++) {
            const lat = south + (north - south) * (row + 0.5) / DENSE_GRID;
            const lon = west + (east - west) * (col + 0.5) / DENSE_GRID;

            const elev = interpolateElevation(lat, lon, elevationSamples);
            const bounds = [
                [lat - cellLatH, lon - cellLonH],
                [lat + cellLatH, lon + cellLonH],
            ];

            rects.push(
                <Rectangle
                    key={`${row}-${col}`}
                    bounds={bounds}
                    pathOptions={{
                        fillColor: elevationToColor(elev),
                        fillOpacity: 0.35,  // Semi-transparent to blend smoothly
                        color: 'transparent', // No borders between cells
                        weight: 0,
                    }}
                />
            );
        }
    }

    return <>{rects}</>;
}

// ── Info Panel: shown at bottom-right of map after a click ────────────────────
function InfoPanel({ info, onClose }) {
    if (!info) return null;
    return (
        <div className="absolute bottom-7 right-4 z-[1000] glass-strong rounded-xl p-4 min-w-[240px] font-inter border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <MapPin size={14} className="text-brand-indigo" /> Location Info
                </span>
                <button onClick={onClose} className="bg-none border-none cursor-pointer text-xl text-slate-400 hover:text-slate-600 transition-colors">×</button>
            </div>
            <table className="text-xs w-full border-collapse">
                <tbody>
                    <tr>
                        <td className="text-slate-500 pb-1">Latitude</td>
                        <td className="font-semibold text-right">{info.lat.toFixed(6)}°</td>
                    </tr>
                    <tr>
                        <td className="text-slate-500 pb-1">Longitude</td>
                        <td className="font-semibold text-right">{info.lng.toFixed(6)}°</td>
                    </tr>
                    <tr>
                        <td className="text-slate-500 pb-1">Elevation</td>
                        <td className="font-bold text-right text-brand-indigo">
                            {info.elevation !== null ? elevationLabel(info.elevation) : 'Loading…'}
                        </td>
                    </tr>
                    {info.elevation !== null && (
                        <tr>
                            <td colSpan={2} className="pt-2">
                                <div 
                                    className="inline-block px-3 py-1 rounded-full text-[0.65rem] text-slate-900 font-bold"
                                    style={{ background: elevationToColor(info.elevation) }}
                                >
                                    Elevation tier
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ── POI Icon Factory ────────────────────────────────────────────────────────
const createSvgIcon = (IconComponent, color, bgColor) => {
    // Render the React Lucide component to static SVG markup
    const svgString = renderToString(
        <div style={{
            backgroundColor: bgColor,
            border: `2px solid #fff`,
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}>
            <IconComponent size={16} color={color} strokeWidth={2.5} />
        </div>
    );

    return L.divIcon({
        html: svgString,
        className: 'custom-poi-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16]
    });
};

// Pre-create the distinct Zomato-style icons
const ICON_HOSPITAL = createSvgIcon(Hospital, '#ffffff', '#e11d48');   // Red
const ICON_POLICE = createSvgIcon(ShieldAlert, '#ffffff', '#0284c7'); // Blue
const ICON_FIRE = createSvgIcon(Flame, '#ffffff', '#ea580c');      // Orange
const ICON_SCHOOL = createSvgIcon(School, '#ffffff', '#16a34a');      // Green
const ICON_DEFAULT = createSvgIcon(Hospital, '#ffffff', '#64748b');    // Slate

const getPoiIcon = (type) => {
    if (type === 'hospital') return ICON_HOSPITAL;
    if (type === 'emergency') return ICON_POLICE; // Simplified mapping; in future separate police/fire
    if (type === 'fire_station') return ICON_FIRE;
    if (type === 'school') return ICON_SCHOOL;
    return ICON_DEFAULT;
};

// Alert Icon Factory
const ICON_ALERT = createSvgIcon(AlertTriangle, '#ffffff', '#ef4444');
const ICON_ACCIDENT = createSvgIcon(Car, '#ffffff', '#dc2626');
const ICON_FLOOD = createSvgIcon(CloudRain, '#ffffff', '#2563eb');

const getAlertIcon = (type) => {
    if (type === 'accident') return ICON_ACCIDENT;
    if (type === 'flood') return ICON_FLOOD;
    return ICON_ALERT;
};

// ── Main Map Engine ───────────────────────────────────────────────────────────
const CityTwinEngine = ({ data, elevationSamples, showElevation, showBuildings, sensorData, activeAlerts = [], selectedArea, setSelectedArea }) => {
    const center = [data.center[1], data.center[0]];
    const bbox = data.bbox;

    const [clickInfo, setClickInfo] = useState(null);

    const majorTypes = useMemo(() => new Set(['motorway', 'trunk', 'primary', 'secondary']), []);
    const midTypes = useMemo(() => new Set(['tertiary', 'tertiary_link', 'unclassified']), []);

    const poiColor = (type) => {
        if (type === 'hospital') return '#e11d48';
        if (type === 'emergency') return '#0d9488';
        if (type === 'school') return '#16a34a';
        return '#64748b';
    };

    const pois = useMemo(() => data.nodes.filter(n => n.type !== 'intersection'), [data.nodes]);
    const intersections = useMemo(() => data.nodes.filter(n => n.type === 'intersection').slice(0, 4000), [data.nodes]);

    const congestedEdges = useMemo(() => {
        if (!sensorData?.traffic) return new Map();
        return new Map(sensorData.traffic.map(t => [t.edgeId, t.level]));
    }, [sensorData]);

    const handleMapClick = useCallback((info) => setClickInfo(info), []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <MapContainer
                center={center}
                zoom={15}
                minZoom={12}
                maxBoundsViscosity={1.0}
                style={{ width: '100%', height: '100%' }}
                preferCanvas={true}
            >
                <BoundsManager center={center} bbox={bbox} />
                <ClickHandler elevationSamples={elevationSamples} onMapClick={handleMapClick} />
                <SelectionHandler onSelect={setSelectedArea} />

                {/* Selected Area Highlight */}
                {selectedArea && (
                    <Rectangle 
                        bounds={selectedArea} 
                        pathOptions={{ color: 'var(--accent-blue)', weight: 2, fillOpacity: 0.1, dashArray: '5, 10' }}
                    />
                )}

                {/* Carto Light (Zomato/Uber minimalist style without labels/clutter) */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">Carto</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                    maxZoom={20}
                />

                {/* Terrain elevation layer — smooth high-density grid */}
                {showElevation && elevationSamples && (
                    <ElevationLayer elevationSamples={elevationSamples} bbox={bbox} />
                )}

                {/* Building Footprints (toggleable) */}
                {showBuildings && data.buildings && data.buildings.map((polygon, i) => (
                    <Polygon
                        key={`bldg_${i}`}
                        positions={polygon}
                        pathOptions={{
                            color: '#cbd5e1', // slate-300 border
                            weight: 1,
                            fillColor: '#e2e8f0', // slate-200 fill
                            fillOpacity: 0.8
                        }}
                    />
                ))}

                {/* Roads — Zomato/Swiggy Bright Style */}
                {data.edges.map((edge, i) => {
                    const isMajor = majorTypes.has(edge.roadType);
                    const isMid = midTypes.has(edge.roadType);
                    const congestion = congestedEdges.get(edge.id);
                    
                    return (
                        <Polyline
                            key={i}
                            positions={[[edge.source.lat, edge.source.lon], [edge.target.lat, edge.target.lon]]}
                            pathOptions={{
                                // Bright contrasting colors for roads, override if congested
                                color: congestion === 'heavy' ? '#7f1d1d' : congestion === 'moderate' ? '#b91c1c' : isMajor ? '#ff5200' : isMid ? '#fde047' : '#94a3b8',
                                weight: congestion ? (isMajor ? 7 : 6) : isMajor ? 5 : isMid ? 4 : 2,
                                opacity: isMajor || congestion ? 1 : isMid ? 0.9 : 0.6,
                            }}
                        />
                    );
                })}

                {/* POI facilities — Zomato style SVG icons */}
                {pois.map((node) => (
                    <Marker
                        key={node.id + '_poi'}
                        position={[node.lat, node.lon]}
                        icon={getPoiIcon(node.type)}
                    >
                        <Popup>
                            <div className="font-sans">
                                <strong className="capitalize">{node.type.replace('_', ' ')}</strong>
                                {node.tags?.name ? <><br /><span className="text-slate-500">{node.tags.name}</span></> : ''}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Agent Alerts Markers */}
                {activeAlerts.map((alert) => (
                    <Marker
                        key={alert.id}
                        position={[alert.lat, alert.lon]}
                        icon={getAlertIcon(alert.type)}
                    >
                        <Popup>
                            <div className="p-0.5 font-sans">
                                <div className={`text-[0.7rem] font-bold uppercase mb-1 flex items-center gap-1 ${alert.severity === 'high' ? 'text-red-500' : 'text-brand-indigo'}`}>
                                    <AlertTriangle size={12} /> {alert.type} Alert
                                </div>
                                <div className="text-sm font-semibold text-slate-900">{alert.message}</div>
                                <div className="text-[0.65rem] text-slate-500 mt-1 font-medium italic">Detected by CityMonitorAgent</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Elevation badge — loading indicator */}
            {showElevation && !elevationSamples && (
                <div className="absolute top-3 right-3 z-[1000] glass-strong rounded-lg px-3 py-1 text-xs text-slate-500 shadow-sm border border-slate-200">
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-indigo animate-pulse" />
                        Loading terrain data…
                    </span>
                </div>
            )}

            {/* Click info panel */}
            <InfoPanel info={clickInfo} onClose={() => setClickInfo(null)} />
        </div>
    );
};

export default CityTwinEngine;
