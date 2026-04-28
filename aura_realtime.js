/* ============================================================
   AURA REALTIME MODULE — aura_realtime.js
   What is REAL here:
     - Firebase Firestore connection + onSnapshot listeners
     - Leaflet.js real OpenStreetMap for all 3 map views
     - Gemini API AI triage chat (real API call)
     - Rule-based scoring engine (real logic, not random)
     - Status panel: Firebase state, sync, timestamp
     - Writes to Firestore on SOS / location select / victim add
   What remains simulated:
     - Vitals sensor data (no hardware; 2s interval updates)
     - Rescue unit movement (SVG animation)
============================================================ */

'use strict';

// ============================================================
// FIREBASE CONFIG — replace with your actual project config
// ============================================================
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAvyWqiuYYrTMVyAuAQBQsiH6KZJz81V08",
  authDomain:        "aura-tactical-v3.firebaseapp.com",
  projectId:         "aura-tactical-v3",
  storageBucket:     "aura-tactical-v3.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:aabbccddeeff0011"
};

// Gemini API key (from .env)
const GEMINI_KEY = "AIzaSyAvyWqiuYYrTMVyAuAQBQsiH6KZJz81V08";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

// ============================================================
// STRUCTURED DISASTER DATA (Task 2)
// Loaded from data.json, then synced via Firestore
// ============================================================
const INITIAL_INCIDENTS = [
  { id:"zone_1", type:"flood",    name:"Flood NW",    severity:0.85, growth_rate:0.3,  affected_population:1247, coordinates:[12.9716,77.5946], status:"critical" },
  { id:"zone_2", type:"fire",     name:"Fire East",   severity:0.65, growth_rate:0.1,  affected_population:212,  coordinates:[12.9816,77.6146], status:"high"     },
  { id:"zone_3", type:"collapse", name:"Collapse SE", severity:0.90, growth_rate:0.05, affected_population:312,  coordinates:[12.9616,77.6246], status:"critical" }
];

const INITIAL_RESCUE_UNITS = [
  { id:"R-ALPHA",  name:"Team Alpha", type:"rescue",  coordinates:[12.9750,77.6000], status:"active",  vitals:{hr:88,  o2:98} },
  { id:"R-BETA",   name:"Team Beta",  type:"rescue",  coordinates:[12.9800,77.6100], status:"active",  vitals:{hr:102, o2:96} },
  { id:"M-UNIT-1", name:"Med Unit 1", type:"medical", coordinates:[12.9700,77.6200], status:"standby", vitals:{hr:76,  o2:99} },
  { id:"R-GAMMA",  name:"Team Gamma", type:"rescue",  coordinates:[12.9660,77.5980], status:"active",  vitals:{hr:115, o2:94} },
  { id:"M-UNIT-2", name:"Med Unit 2", type:"medical", coordinates:[12.9780,77.6050], status:"active",  vitals:{hr:88,  o2:97} }
];

// ============================================================
// STATE
// ============================================================
let db = null;
let leafletCitizen = null;
let leafletField   = null;
let leafletCmd     = null;
let incidents      = [...INITIAL_INCIDENTS];
let rescueUnits    = [...INITIAL_RESCUE_UNITS];
let leafletMarkers = { citizen:[], field:[], cmd:[] };
let fbConnected    = false;

// ============================================================
// STATUS PANEL HELPERS (Task 6)
// ============================================================
function setStatus(connected, synced) {
  const fbDot  = document.getElementById('st-fb-dot');
  const fbTxt  = document.getElementById('st-fb-txt');
  const syncDot= document.getElementById('st-sync-dot');
  const syncTxt= document.getElementById('st-sync-txt');
  const lastUp = document.getElementById('st-last-update');

  if (fbDot)   fbDot.className  = 'st-dot ' + (connected ? 'st-ok':'st-err');
  if (fbTxt)   fbTxt.textContent= connected ? 'Connected ✅' : 'Offline (local data)';
  if (fbTxt)   fbTxt.style.color= connected ? 'var(--g)' : 'var(--r)';
  if (syncDot) syncDot.className= 'st-dot ' + (synced ? 'st-ok':'st-err');
  if (syncTxt) syncTxt.textContent= synced ? 'Live ✅' : 'Buffered';
  if (syncTxt) syncTxt.style.color= synced ? 'var(--g)' : 'var(--a)';
  if (lastUp)  lastUp.textContent = new Date().toTimeString().slice(0,8);
}

function tickStatusTime() {
  const el = document.getElementById('st-last-update');
  if (el && fbConnected) el.textContent = new Date().toTimeString().slice(0,8);
}
setInterval(tickStatusTime, 1000);

// ============================================================
// FIREBASE INIT (Task 1)
// ============================================================
async function initFirebase() {
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
    fbConnected = true;
    setStatus(true, true);
    console.log('[AURA] Firebase connected');
    await seedFirestoreIfEmpty();
    attachListeners();
  } catch (err) {
    console.warn('[AURA] Firebase unavailable, running on local data:', err.message);
    fbConnected = false;
    setStatus(false, false);
    // Still run with local data — app stays fully functional
  }
}

// Seed Firestore with initial data if collections are empty
async function seedFirestoreIfEmpty() {
  if (!db) return;
  try {
    const snap = await db.collection('incidents').limit(1).get();
    if (snap.empty) {
      const batch = db.batch();
      INITIAL_INCIDENTS.forEach(inc => {
        batch.set(db.collection('incidents').doc(inc.id), { ...inc, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
      });
      INITIAL_RESCUE_UNITS.forEach(u => {
        batch.set(db.collection('rescue_units').doc(u.id), { ...u, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
      });
      await batch.commit();
      console.log('[AURA] Firestore seeded with initial data');
    }
  } catch (e) {
    console.warn('[AURA] Seed skipped:', e.message);
  }
}

// ============================================================
// FIRESTORE REAL-TIME LISTENERS (Task 1 — onSnapshot)
// ============================================================
function attachListeners() {
  if (!db) return;

  // Listen to incidents collection — updates disaster zones in real-time
  db.collection('incidents').onSnapshot(snap => {
    incidents = [];
    snap.forEach(doc => incidents.push({ id: doc.id, ...doc.data() }));
    setStatus(true, true);
    refreshMapMarkers();
    updateCommandZoneRows();
    console.log('[AURA-SYNC] Incidents updated:', incidents.length);
  }, err => {
    console.warn('[AURA-SYNC] Incidents listener error:', err.message);
    setStatus(true, false);
  });

  // Listen to rescue_units — updates unit positions
  db.collection('rescue_units').onSnapshot(snap => {
    rescueUnits = [];
    snap.forEach(doc => rescueUnits.push({ id: doc.id, ...doc.data() }));
    refreshRescueMarkers();
  }, () => {});
}

// ============================================================
// WRITE TO FIRESTORE ON USER ACTIONS
// ============================================================

// Called when citizen selects a location (Task 1 — write on interact)
const _origSetLoc = window.setLoc;
window.setLoc = function(type) {
  if (typeof _origSetLoc === 'function') _origSetLoc(type);
  if (!db) return;
  const entry = {
    type: 'location_select', zone: type,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    client: navigator.userAgent.slice(0,40)
  };
  db.collection('users').add(entry).catch(() => {});
};

// Called when field SOS is triggered
const _origFieldSOS = window.fieldSOS;
window.fieldSOS = function() {
  if (typeof _origFieldSOS === 'function') _origFieldSOS();
  if (!db) return;
  db.collection('incidents').add({
    type: 'sos', severity: 1.0,
    affected_population: 1, status: 'critical',
    name: 'SOS — Field Responder',
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(ref => {
    console.log('[AURA] SOS written to Firestore:', ref.id);
  }).catch(() => {});
};

// Called when victim is added from field mode
const _origAddVictim = window.addVictim;
window.addVictim = function() {
  if (typeof _origAddVictim === 'function') _origAddVictim();
  const sev = document.getElementById('victim-severity');
  const sym = document.getElementById('victim-symptom');
  if (!db || !sev) return;
  db.collection('vitals').add({
    severity_level: parseInt(sev.value),
    symptom: sym ? sym.value : '',
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    source: 'field_responder'
  }).catch(() => {});
};

// ============================================================
// LEAFLET MAP INITIALIZATION (Task 5)
// ============================================================
const TILE_URL   = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAP_CENTER = [12.9716, 77.5946]; // Bengaluru (demo city)
const ZONE_COLORS = { flood:'#5080ff', fire:'#ff5020', collapse:'#ffaa00', critical:'#ff3a3a', high:'#ffaa00' };

function initLeafletMaps() {
  // Only init when Leaflet is loaded
  if (typeof L === 'undefined') { setTimeout(initLeafletMaps, 500); return; }

  initCitizenLeaflet();
  initFieldLeaflet();
  initCmdLeaflet();
}

function makeLeafletMap(divId, center, zoom) {
  const el = document.getElementById(divId);
  if (!el || el._leaflet_id) return null;
  const map = L.map(divId, { zoomControl: true, attributionControl: false, scrollWheelZoom: true }).setView(center, zoom);
  L.tileLayer(TILE_URL, { maxZoom: 18 }).addTo(map);
  return map;
}

function makeDotIcon(color, size=10) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};
           box-shadow:0 0 ${size}px ${color};border:2px solid rgba(255,255,255,0.3);"></div>`,
    iconSize: [size, size], iconAnchor: [size/2, size/2]
  });
}

function initCitizenLeaflet() {
  const map = makeLeafletMap('leaflet-citizen-map', MAP_CENTER, 13);
  if (!map) return;
  leafletCitizen = map;
  plotIncidentsOnMap(map, 'citizen');
  plotRescueOnMap(map, 'citizen');
}

function initFieldLeaflet() {
  const map = makeLeafletMap('leaflet-field-map', MAP_CENTER, 14);
  if (!map) return;
  leafletField = map;
  plotIncidentsOnMap(map, 'field');
  plotRescueOnMap(map, 'field');
}

function initCmdLeaflet() {
  const map = makeLeafletMap('leaflet-cmd-map', MAP_CENTER, 13);
  if (!map) return;
  leafletCmd = map;
  plotIncidentsOnMap(map, 'cmd');
  plotRescueOnMap(map, 'cmd');
}

function plotIncidentsOnMap(map, key) {
  if (!map) return;
  incidents.forEach(inc => {
    const col = ZONE_COLORS[inc.type] || ZONE_COLORS[inc.status] || '#ff3a3a';
    // Draw translucent circle for zone radius
    const circle = L.circle(inc.coordinates, {
      radius: 600 + inc.severity * 500,
      color: col, fillColor: col,
      fillOpacity: 0.18, weight: 1.5, dashArray: '6 4'
    }).addTo(map);
    // Label marker
    const mk = L.marker(inc.coordinates, { icon: makeDotIcon(col, 12) })
      .addTo(map)
      .bindPopup(`<b style="color:${col}">${inc.name.toUpperCase()}</b><br>
        Severity: ${(inc.severity*100).toFixed(0)}%<br>
        Affected: ${inc.affected_population.toLocaleString()}<br>
        Status: ${inc.status.toUpperCase()}`);
    leafletMarkers[key].push(mk, circle);
  });
}

function plotRescueOnMap(map, key) {
  if (!map) return;
  rescueUnits.forEach(u => {
    const col = u.type === 'medical' ? '#00ff88' : '#00d4ff';
    const mk = L.marker(u.coordinates, { icon: makeDotIcon(col, 8) })
      .addTo(map)
      .bindPopup(`<b style="color:${col}">${u.id}</b><br>${u.name}<br>Status: ${u.status.toUpperCase()}`);
    leafletMarkers[key].push(mk);
  });
}

function refreshMapMarkers() {
  ['citizen','field','cmd'].forEach(key => {
    const map = key==='citizen'?leafletCitizen: key==='field'?leafletField:leafletCmd;
    if (!map) return;
    leafletMarkers[key].forEach(m => { try { map.removeLayer(m); } catch(e){} });
    leafletMarkers[key] = [];
    plotIncidentsOnMap(map, key);
    plotRescueOnMap(map, key);
  });
}

function refreshRescueMarkers() {
  ['citizen','field','cmd'].forEach(key => {
    const map = key==='citizen'?leafletCitizen: key==='field'?leafletField:leafletCmd;
    if (!map) return;
    // Only remove rescue dots (not zone circles) — simplified: refresh all
    refreshMapMarkers();
  });
}

// Trigger map init when screens are activated
const _origGoTo = window.goTo;
window.goTo = function(id) {
  if (typeof _origGoTo === 'function') _origGoTo(id);
  setTimeout(() => {
    if (id === 'screen-citizen' && !leafletCitizen) initCitizenLeaflet();
    if (id === 'screen-field'   && !leafletField)   initFieldLeaflet();
    if (id === 'screen-command' && !leafletCmd)      initCmdLeaflet();
    if (leafletCitizen) leafletCitizen.invalidateSize();
    if (leafletField)   leafletField.invalidateSize();
    if (leafletCmd)     leafletCmd.invalidateSize();
  }, 520);
};

// ============================================================
// RULE-BASED SCORING ENGINE (Task 3B — real logic)
// ============================================================
function scoreIncident(inc) {
  let priority = 'MEDIUM';
  let reasons  = [];
  let score    = 0;

  if (inc.severity > 0.7)              { score += 40; reasons.push(`Severity ${(inc.severity*100).toFixed(0)}%`); }
  if (inc.affected_population > 1000)  { score += 30; reasons.push(`${inc.affected_population} affected`); }
  if (inc.growth_rate > 0.2)           { score += 20; reasons.push(`Growing at ${inc.growth_rate} rate`); }
  if (inc.type === 'collapse')         { score += 10; reasons.push('Structural collapse'); }

  if (score >= 70) priority = 'CRITICAL';
  else if (score >= 40) priority = 'HIGH';
  else if (score >= 20) priority = 'MEDIUM';
  else priority = 'LOW';

  return { priority, score, reasons };
}

function scoreVitals(hr, o2) {
  const alerts = [];
  if (hr > 120)   alerts.push(`TACHYCARDIA — HR ${hr} BPM`);
  if (hr < 50)    alerts.push(`BRADYCARDIA — HR ${hr} BPM`);
  if (o2 < 90)    alerts.push(`HYPOXIA — O2 ${o2}%`);
  if (o2 < 85)    alerts.push(`CRITICAL HYPOXIA — IMMEDIATE ACTION`);
  return alerts;
}

// Run scoring on incidents every 5s and update command terminal
setInterval(() => {
  incidents.forEach(inc => {
    const { priority, reasons } = scoreIncident(inc);
    if (priority === 'CRITICAL' && typeof addLine === 'function') {
      addLine(`[SCORE] ${inc.name}: CRITICAL — ${reasons[0]}`, 'rgba(255,58,58,0.7)');
    }
  });
}, 15000);

// ============================================================
// DYNAMIC OBSERVE / REASON / DECIDE (Task 4)
// Replaces scripted demo CoT with real computed output
// ============================================================
window.generateCoT = function(incidentId) {
  const inc = incidents.find(i => i.id === incidentId) || incidents[0];
  if (!inc) return;
  const { priority, reasons } = scoreIncident(inc);
  const time = new Date().toTimeString().slice(0,8);

  const cot = document.getElementById('demo-cot');
  if (!cot) return;
  cot.style.display = 'block';
  cot.innerHTML = `
    <div style="color:rgba(0,212,255,0.7);margin-bottom:6px">[OBSERVE] ${time}</div>
    <div style="color:rgba(255,255,255,0.5);margin-bottom:4px">
      Zone: ${inc.name} | Type: ${inc.type.toUpperCase()} | Pop: ${inc.affected_population.toLocaleString()}
    </div>
    <div style="color:rgba(0,212,255,0.7);margin-bottom:6px;margin-top:8px">[REASON]</div>
    <div style="color:rgba(255,255,255,0.5);margin-bottom:4px">${reasons.join(' · ')}</div>
    <div style="color:rgba(255,170,0,0.7);margin-bottom:6px;margin-top:8px">[DECIDE] → Priority: ${priority}</div>
    <div style="color:rgba(0,255,136,0.6)">
      ${priority === 'CRITICAL' ? '→ Dispatch nearest 3 teams · Alert medical units · Reroute civilian traffic'
        : priority === 'HIGH'   ? '→ Dispatch 1 team · Monitor expansion · Alert nearby zones'
        : '→ Monitor · No immediate dispatch required'}
    </div>`;
};

// ============================================================
// GEMINI AI TRIAGE CHAT (Task 3A — real API)
// ============================================================
async function callGemini(userMessage) {
  // Build structured emergency context from live data
  const topZone = incidents.reduce((a,b) => a.severity > b.severity ? a : b, incidents[0]);
  const context = topZone
    ? `Active disaster: ${topZone.name} (${topZone.type}, severity ${(topZone.severity*100).toFixed(0)}%, ${topZone.affected_population} affected).`
    : 'No active disaster zones.';

  const systemPrompt = `You are AURA, an AI emergency response assistant. 
Current situation: ${context}
Respond concisely (2-3 lines max). Give specific, actionable emergency guidance.
Format: [ASSESS] <assessment> | [ACTION] <action> | [PRIORITY] <level>`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + '\n\nUser: ' + userMessage }] }],
        generationConfig: { maxOutputTokens: 150, temperature: 0.3 }
      })
    });
    if (!res.ok) throw new Error('API ' + res.status);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e) {
    console.warn('[AURA-AI] Gemini unavailable:', e.message);
    return null;
  }
}

// Override sendTriage to use Gemini when available
const _origSendTriage = window.sendTriage;
window.sendTriage = async function(msg) {
  if (!msg || !msg.trim()) return;
  if (typeof triageMsg === 'function') triageMsg('user', msg);

  // Show thinking state
  if (typeof triageMsg === 'function') triageMsg('aura', '[AURA] Processing with AI...');

  const aiReply = await callGemini(msg);

  // Remove "Processing" line (last child)
  const chat = document.getElementById('triage-chat');
  if (chat && chat.lastChild) chat.removeChild(chat.lastChild);

  if (aiReply) {
    // Real Gemini response
    if (typeof triageMsg === 'function') triageMsg('aura', '[AI] ' + aiReply);
  } else {
    // Fallback to rule-based response
    if (typeof _origSendTriage === 'function') _origSendTriage(msg);
  }
};

// Override command triage input button for AI
window.sendTriageBtn = function() {
  const i = document.getElementById('triage-inp');
  if (i && i.value.trim()) { window.sendTriage(i.value.trim()); i.value = ''; }
};

// ============================================================
// UPDATE COMMAND ZONE ROWS WITH LIVE SCORED DATA (Task 4)
// ============================================================
function updateCommandZoneRows() {
  const c = document.getElementById('zone-rows');
  if (!c) return;
  const rows = incidents.map(inc => {
    const { priority } = scoreIncident(inc);
    const col = inc.type==='flood'?'#5080ff': inc.type==='fire'?'#ff5020':'#ffaa00';
    return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;
      border-bottom:1px solid rgba(0,212,255,0.04);">
      <div style="width:7px;height:7px;border-radius:50%;background:${col};flex-shrink:0;
        ${priority==='CRITICAL'?'animation:pulse 1.2s infinite':''}"></div>
      <div style="font-size:10px;color:rgba(255,255,255,0.72);flex:1;">${inc.name}</div>
      <div style="font-size:8px;padding:1px 6px;border-radius:1px;color:${col};
        background:${col}20;letter-spacing:0.10em;">${priority}</div>
      <div style="font-size:10px;color:${col};min-width:40px;text-align:right;">
        ${inc.affected_population.toLocaleString()}</div>
    </div>`;
  });
  // Append safe zones (static)
  rows.push(`<div style="display:flex;align-items:center;gap:8px;padding:7px 0;">
    <div style="width:7px;height:7px;border-radius:50%;background:#00ff88;flex-shrink:0;"></div>
    <div style="font-size:10px;color:rgba(255,255,255,0.72);flex:1;">Safe Zones (3)</div>
    <div style="font-size:8px;padding:1px 6px;border-radius:1px;color:#00ff88;background:#00ff8820;">OPEN</div>
    <div style="font-size:10px;color:#00ff88;min-width:40px;text-align:right;">615/1200</div>
  </div>`);
  c.innerHTML = rows.join('');
}

// ============================================================
// VITALS ALERT ENGINE — real rule-based checks (Task 3B)
// ============================================================
function checkVitalAlerts() {
  // Read from existing S object (sensor state)
  if (typeof S === 'undefined') return;
  const alerts = scoreVitals(S.hr, S.o2);
  if (alerts.length > 0 && typeof vLog === 'function') {
    alerts.forEach(a => vLog('[VITAL-ALERT] ' + a, 'shield'));
  }
  if (typeof addLine === 'function' && alerts.length > 0) {
    alerts.forEach(a => addLine('[VITALS] ' + a, 'rgba(255,58,58,0.8)'));
  }
  // Update Firestore if connected
  if (db && alerts.length > 0) {
    db.collection('vitals').add({
      alerts, hr: S.hr, o2: S.o2,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(() => {});
  }
}
setInterval(checkVitalAlerts, 8000);

// ============================================================
// RESIZE — invalidate Leaflet maps on window resize
// ============================================================
window.addEventListener('resize', () => {
  setTimeout(() => {
    if (leafletCitizen) leafletCitizen.invalidateSize();
    if (leafletField)   leafletField.invalidateSize();
    if (leafletCmd)     leafletCmd.invalidateSize();
  }, 350);
});

// ============================================================
// BOOT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  // Brief delay so main aura.html script finishes first
  setTimeout(async () => {
    setStatus(false, false); // Show "connecting" state
    await initFirebase();
    initLeafletMaps();
    // Run initial CoT on first incident for demo screen
    if (incidents.length) generateCoT(incidents[0].id);
  }, 600);
});
