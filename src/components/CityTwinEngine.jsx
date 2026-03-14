import React, { useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Helper: fly to new city center whenever data changes
function FlyTo({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 15, { duration: 1.2 });
    }, [center, map]);
    return null;
}

const CityTwinEngine = ({ data }) => {
    const center = [data.center[1], data.center[0]]; // [lat, lng]

    const majorTypes = useMemo(() => new Set(['motorway', 'trunk', 'primary', 'secondary']), []);

    const poiColor = (type) => {
        if (type === 'hospital') return '#dc2626';
        if (type === 'emergency') return '#0d9488';
        if (type === 'school') return '#f59e0b';
        return '#64748b';
    };

    const pois = useMemo(() => data.nodes.filter(n => n.type !== 'intersection'), [data.nodes]);
    const intersections = useMemo(() => data.nodes.filter(n => n.type === 'intersection').slice(0, 4000), [data.nodes]);

    return (
        <MapContainer
            center={center}
            zoom={14}
            style={{ width: '100%', height: '100%' }}
            preferCanvas={true}
        >
            <FlyTo center={center} />

            {/* Clean light CartoDB basemap */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={20}
            />

            {/* Road Edges */}
            {data.edges.map((edge, i) => {
                const isMajor = majorTypes.has(edge.roadType);
                return (
                    <Polyline
                        key={i}
                        positions={[[edge.source.lat, edge.source.lon], [edge.target.lat, edge.target.lon]]}
                        pathOptions={{
                            color: isMajor ? '#2563eb' : '#cbd5e1',
                            weight: isMajor ? 3.5 : 1.5,
                            opacity: isMajor ? 0.85 : 0.7,
                        }}
                    >
                        <Popup>{edge.roadType}</Popup>
                    </Polyline>
                );
            })}

            {/* Intersection nodes */}
            {intersections.map((node) => (
                <CircleMarker
                    key={node.id}
                    center={[node.lat, node.lon]}
                    radius={2}
                    pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.5, weight: 0 }}
                />
            ))}

            {/* POI markers with popups */}
            {pois.map((node) => (
                <CircleMarker
                    key={node.id + '_poi'}
                    center={[node.lat, node.lon]}
                    radius={8}
                    pathOptions={{
                        color: '#fff',
                        fillColor: poiColor(node.type),
                        fillOpacity: 1,
                        weight: 2,
                    }}
                >
                    <Popup>
                        <strong>{node.type.toUpperCase()}</strong><br />
                        {node.tags?.name || 'No name available'}
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
};

export default CityTwinEngine;
