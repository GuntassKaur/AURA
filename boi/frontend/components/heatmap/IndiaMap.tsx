import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Hotspot {
  name: string;
  lat: number;
  lng: number;
  intensity: number;
  cases: number;
}

interface IndiaMapProps {
  hotspots: Hotspot[];
}

const IndiaMap: React.FC<IndiaMapProps> = ({ hotspots }) => {
  const center: [number, number] = [22.9734, 78.6569]; // Center of India

  return (
    <div className="w-full h-full relative" style={{ background: '#020617' }}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ width: '100%', height: '100%', background: '#020617' }}
        zoomControl={false}
        attributionControl={false}
      >
        {/* CartoDB Dark Matter tiles for military cyber-style dark maps */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {hotspots.map((spot, idx) => {
          const color = spot.intensity > 0.8 ? '#ef4444' : (spot.intensity > 0.6 ? '#f97316' : '#3b82f6');
          
          return (
            <CircleMarker
              key={idx}
              center={[spot.lat, spot.lng]}
              radius={8 + spot.intensity * 12}
              fillColor={color}
              color={color}
              weight={1}
              opacity={0.8}
              fillOpacity={0.35}
            >
              <Popup className="cyber-popup">
                <div className="font-mono text-xs text-white p-1">
                  <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-cyber-cyan">
                    {spot.name}
                  </div>
                  <div>INTENSITY: <span className="font-bold text-white">{Math.round(spot.intensity * 100)}%</span></div>
                  <div>ACTIVE CASES: <span className="font-bold text-white">{spot.cases}</span></div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default IndiaMap;
