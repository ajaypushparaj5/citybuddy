import React from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, LineLayer } from '@deck.gl/layers';

const CityTwinEngine = ({ data }) => {
    // We use the center coordinates retrieved from OSM
    const initialViewState = {
        longitude: data.center[0],
        latitude: data.center[1],
        zoom: 13.5,
        pitch: 45,
        bearing: 0
    };

    // Build high performance WebGL visual layers for Phase 1 

    // 1. Edges / Roads layer
    const edgesLayer = new LineLayer({
        id: 'road-edges-layer',
        data: data.edges,
        getSourcePosition: d => [d.source.lon, d.source.lat],
        getTargetPosition: d => [d.target.lon, d.target.lat],
        getColor: d => {
            // Differentiate road styles: main roads blue, residential gray
            if (['motorway', 'primary', 'secondary'].includes(d.roadType)) {
                return [37, 99, 235, 200]; // Accent-blue
            }
            return [148, 163, 184, 150]; // Light gray Slate-400
        },
        getWidth: d => {
            if (['motorway', 'primary', 'secondary'].includes(d.roadType)) return 3;
            return 1;
        },
        pickable: true
    });

    // 2. Nodes / Intersections + Infrastructure layer
    const nodesLayer = new ScatterplotLayer({
        id: 'infrastructure-nodes-layer',
        data: data.nodes,
        getPosition: d => [d.lon, d.lat],
        getFillColor: d => {
            if (d.type === 'hospital') return [220, 38, 38, 255]; // Red
            if (d.type === 'emergency') return [13, 148, 136, 255]; // Teal
            return [100, 116, 139, 100]; // Slate-500 nodes for generic intersections
        },
        getRadius: d => {
            if (d.type === 'hospital' || d.type === 'emergency') return 20;
            return 3;
        },
        radiusMinPixels: 2,
        pickable: true
    });

    const getTooltip = ({ object }) => {
        if (!object) return null;

        // For nodes
        if (object.lat && object.lon) {
            return `Type: ${object.type} \n ID: ${object.id}`;
        }
        // For edges
        if (object.roadType) {
            return `Road: ${object.roadType}`;
        }
        return null;
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <DeckGL
                initialViewState={initialViewState}
                controller={true}
                layers={[edgesLayer, nodesLayer]}
                getTooltip={getTooltip}
                // Very subtle off-white background to match the clean light theme
                style={{ backgroundColor: '#f1f5f9' }}
            />
        </div>
    );
};

export default CityTwinEngine;
