import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fly to new city center + lock bounds whenever data changes
function BoundsManager({ center, bbox }) {
    const map = useMap();
    useEffect(() => {
        if (!center || !bbox) return;
        const leafletBounds = bbox; // [[south, west], [north, east]]

        // Fly in and lock — user cannot scroll out beyond the city area
        map.flyTo(center, 15, { duration: 1.2 });
        map.setMaxBounds(leafletBounds);
        // Dynamically compute minZoom: whatever zoom level fits the whole bbox
        const boundsZoom = map.getBoundsZoom(leafletBounds);
        map.setMinZoom(boundsZoom);
    }, [center, bbox, map]);
    return null;
}

const CityTwinEngine = ({ data }) => {
    const center = [data.center[1], data.center[0]]; // [lat, lng]
    const bbox = data.bbox; // [[south, west], [north, east]]

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

    return (
        <MapContainer
            center={center}
            zoom={15}
            minZoom={12} // Conservative fallback — will be updated by BoundsManager
            maxBoundsViscosity={1.0}
            style={{ width: '100%', height: '100%' }}
            preferCanvas={true}
        >
            <BoundsManager center={center} bbox={bbox} />

            {/* OSM Standard tiles — gray buildings, green parks, blue water */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={20}
            />

            {/* Road Edges — gold for major, white/light for minor */}
            {data.edges.map((edge, i) => {
                const isMajor = majorTypes.has(edge.roadType);
                const isMid = midTypes.has(edge.roadType);
                return (
                    <Polyline
                        key={i}
                        positions={[[edge.source.lat, edge.source.lon], [edge.target.lat, edge.target.lon]]}
                        pathOptions={{
                            color: isMajor ? '#f5c518' : isMid ? '#ffffff' : '#e2e8f0',
                            weight: isMajor ? 5 : isMid ? 3 : 2,
                            opacity: isMajor ? 0.95 : isMid ? 0.85 : 0.6,
                        }}
                    >
                        <Popup><strong>{edge.roadType}</strong></Popup>
                    </Polyline>
                );
            })}

            {/* Intersection dots — green circles */}
            {intersections.map((node) => (
                <CircleMarker
                    key={node.id}
                    center={[node.lat, node.lon]}
                    radius={3}
                    pathOptions={{ color: '#4ade80', fillColor: '#22c55e', fillOpacity: 0.85, weight: 1 }}
                />
            ))}

            {/* POI facility markers — larger, distinct colors with popup */}
            {pois.map((node) => (
                <CircleMarker
                    key={node.id + '_poi'}
                    center={[node.lat, node.lon]}
                    radius={10}
                    pathOptions={{ color: '#fff', fillColor: poiColor(node.type), fillOpacity: 1, weight: 2.5 }}
                >
                    <Popup>
                        <strong style={{ textTransform: 'capitalize' }}>{node.type}</strong>
                        {node.tags?.name ? <><br />{node.tags.name}</> : ''}
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
};

export default CityTwinEngine;
