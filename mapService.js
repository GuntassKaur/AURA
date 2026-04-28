/* ============================================================
   mapService.js — AURA OS
   REAL: Leaflet.js map integration without disturbing UI.
         Plots incidents (circles) and rescue units (markers).
   ============================================================ */
'use strict';

const MAP_CENTER = [12.9716, 77.5946];
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

window.AURIX_MAPS = {
  citizen: null,
  field: null,
  command: null,
  markers: { citizen: [], field: [], command: [] }
};

function initMap(id, containerId) {
  if (window.AURIX_MAPS[id]) return;
  const el = document.getElementById(containerId);
  if (!el) return;
  
  const map = L.map(containerId, { zoomControl: false, attributionControl: false }).setView(MAP_CENTER, 13);
  L.tileLayer(TILE_URL, {
    maxZoom: 18,
    className: 'map-tiles' // For CSS filtering
  }).addTo(map);
  
  window.AURIX_MAPS[id] = map;
}

function plotData(id, incidents, units) {
  const map = window.AURIX_MAPS[id];
  if (!map) return;

  // Clear old markers
  window.AURIX_MAPS.markers[id].forEach(m => map.removeLayer(m));
  window.AURIX_MAPS.markers[id] = [];

  // Plot Incidents
  incidents.forEach(inc => {
    const col = inc.type === 'flood' ? '#0088ff' : inc.type === 'fire' ? '#ff4400' : '#ffaa00';
    const circle = L.circle(inc.coordinates, {
      radius: 500 + inc.severity * 500,
      color: col,
      fillColor: col,
      fillOpacity: 0.2
    }).addTo(map);
    window.AURIX_MAPS.markers[id].push(circle);
  });

  // Plot Units
  units.forEach(u => {
    const col = u.type === 'medical' ? '#00ff88' : '#00d4ff';
    const marker = L.circleMarker(u.coordinates, {
      radius: 6,
      color: '#fff',
      weight: 2,
      fillColor: col,
      fillOpacity: 1
    }).addTo(map);
    marker.bindPopup(`<b>${u.name}</b><br>Status: ${u.status}`);
    window.AURIX_MAPS.markers[id].push(marker);
  });
}

function updateMaps(incidents, units) {
  ['citizen', 'field', 'command'].forEach(id => plotData(id, incidents, units));
}

window.initAllMaps = () => {
  initMap('citizen', 'leaflet-citizen-map');
  initMap('field', 'leaflet-field-map');
  initMap('command', 'leaflet-cmd-map');
};
window.updateMaps = updateMaps;
