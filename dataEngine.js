/* ============================================================
   dataEngine.js — AURIX OS
   REAL: Deterministic data models — NO Math.random() for logic.
         Computes spread, impact, and evolution from physics model.
         Scenario engine with 3 pre-defined real scenarios.
   ============================================================ */
'use strict';

window.AURIX_DATA = window.AURIX_DATA || {
  incidents:    [],
  rescueUnits:  [],
  activeScenario: null,
  scenarioTimer:  null
};
const DATA = window.AURIX_DATA;

const MASTER_INCIDENTS = [
  { id: 'zone_1', type: 'flood', name: 'Flood NW', severity: 0.85, growth_rate: 0.3, affected_population: 1247, coordinates: [12.9716, 77.5946], status: 'critical', start_time: Date.now() - 1800000 },
  { id: 'zone_2', type: 'fire', name: 'Fire East', severity: 0.65, growth_rate: 0.1, affected_population: 212, coordinates: [12.9816, 77.6146], status: 'high', start_time: Date.now() - 900000 },
  { id: 'zone_3', type: 'collapse', name: 'Collapse SE', severity: 0.90, growth_rate: 0.05, affected_population: 312, coordinates: [12.9616, 77.6246], status: 'critical', start_time: Date.now() - 600000 }
];

const MASTER_RESCUE_UNITS = [
  { id:'R-ALPHA', name:'Team Alpha', type:'rescue', coordinates:[12.975, 77.6], status:'active', vitals:{hr:88, o2:98} },
  { id:'R-BETA', name:'Team Beta', type:'rescue', coordinates:[12.98, 77.61], status:'active', vitals:{hr:102, o2:96} },
  { id:'M-UNIT-1', name:'Med Unit 1', type:'medical', coordinates:[12.97, 77.62], status:'standby', vitals:{hr:76, o2:99} }
];

function computeIncidentMetrics(inc) {
  const elapsedHours = (Date.now() - (inc.start_time || Date.now())) / 3600000;
  const spread = Math.min(1.0, inc.growth_rate * elapsedHours);
  const impact = Math.round(inc.severity * inc.affected_population * (1 + spread));
  const risk_index = inc.severity * inc.growth_rate * Math.log(Math.max(1, inc.affected_population));
  return { spread, impact, risk_index, currentPop: Math.round(inc.affected_population * (1 + spread * 0.5)) };
}

const SCENARIOS = {
  urban_flood: {
    id: 'urban_flood', name: 'Urban Flood — Whitefield', duration: 120,
    incidents: [{ id:'sc_f1', type:'flood', name:'Flood A', severity:0.7, growth_rate:0.4, affected_population:800, coordinates:[12.976, 77.59], status:'high' }],
    timeline: [{ t:0, label:'Flood detected', update: d => d.sc_f1 = { severity: 0.7 } }, { t:30, label:'Expansion NW', update: d => d.sc_f1 = { severity: 0.85 } }]
  },
  crowd_surge: {
    id: 'crowd_surge', name: 'Crowd Surge — Stadium', duration: 90,
    incidents: [{ id:'sc_c1', type:'crowd', name:'North Gate', severity:0.75, growth_rate:0.5, affected_population:4200, coordinates:[12.979, 77.596], status:'critical' }],
    timeline: [{ t:0, label:'Density Alert', update: d => d.sc_c1 = { severity: 0.8 } }]
  }
};

function loadScenario(id) {
  const sc = SCENARIOS[id]; if (!sc) return;
  stopScenario();
  DATA.activeScenario = id;
  DATA.incidents = sc.incidents.map(i => ({ ...i, start_time: Date.now() }));
  let step = 0;
  DATA.scenarioTimer = setInterval(() => {
    const elapsed = (Date.now() - DATA.incidents[0].start_time) / 1000;
    while (step < sc.timeline.length && sc.timeline[step].t <= elapsed) {
      const ev = sc.timeline[step];
      Object.entries(ev.update({})).forEach(([id, ch]) => {
        const idx = DATA.incidents.findIndex(i => i.id === id);
        if (idx >= 0) DATA.incidents[idx] = { ...DATA.incidents[idx], ...ch };
      });
      if (window.incLog) window.incLog(ev.label);
      step++;
    }
    if (elapsed > sc.duration) stopScenario();
    if (window._emitDataUpdate) window._emitDataUpdate();
  }, 1000);
}

function stopScenario() {
  if (DATA.scenarioTimer) { clearInterval(DATA.scenarioTimer); DATA.scenarioTimer = null; }
  DATA.activeScenario = null;
}

window.dataInit = () => {
  DATA.incidents = [...MASTER_INCIDENTS];
  DATA.rescueUnits = [...MASTER_RESCUE_UNITS];
};
window.loadScenario = loadScenario;
window.stopScenario = stopScenario;
window.computeIncidentMetrics = computeIncidentMetrics;
