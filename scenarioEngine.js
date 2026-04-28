/* ============================================================
   scenarioEngine.js — AURIX Rescue OS
   REAL: Loading structured emergency contexts into live system state.
   SIMULATED: Pre-defined incident coordinates and timelines.
   ============================================================ */
'use strict';

const SCENARIOS = {
  flood: {
    name: 'Urban Flood Crisis',
    dataset: [
      { id: 'zone_1', type: 'flood', name: 'Flood NW', severity: 0.85, growth_rate: 0.3, affected_population: 1247, coordinates: [12.9716, 77.5946], status: 'critical' },
      { id: 'zone_2', type: 'flood', name: 'Flood SE', severity: 0.40, growth_rate: 0.1, affected_population: 842, coordinates: [12.9516, 77.6246], status: 'warning' }
    ],
    timeline: [
      { t: 0, msg: 'Initial breach: Flow rate 0.42m/s in Sector NW' },
      { t: 10000, msg: 'Telemetry: Sector SE water level +0.52m | Surge probability 88%' },
      { t: 20000, msg: 'Grid failure: Mesh redundancy activated in flooded sectors' }
    ]
  },
  crowd: {
    name: 'Mass Crowd Surge',
    dataset: [
      { id: 'zone_crowd_1', type: 'crowd', name: 'Main Stadium Exit', severity: 0.92, growth_rate: 0.4, affected_population: 5000, coordinates: [12.9716, 77.5946], status: 'critical' }
    ],
    timeline: [
      { t: 0, msg: 'Density threshold: 4.8 persons/sqm at Gate 4' },
      { t: 5000, msg: 'Predictive model: Localized surge expected in T-12:30' }
    ]
  },
  cardiac: {
    name: 'Worker Cardiac Emergency',
    dataset: [
      { id: 'zone_worker_1', type: 'medical', name: 'Construction Site B', severity: 1.0, growth_rate: 0, affected_population: 1, coordinates: [12.9716, 77.5946], status: 'critical' }
    ],
    timeline: [
      { t: 0, msg: 'VITAL-SHIELD Alert: HR 142 BPM | O2 88.4%' },
      { t: 2000, msg: 'Dispatch: Medical unit M2 deployed | ETA: 3.8 min' }
    ]
  }
};

window.loadScenario = async (id) => {
  const scenario = SCENARIOS[id];
  if (!scenario) return;

  if (window.AURIX_DATA) {
    const newIncidents = scenario.dataset.map(inc => ({
      ...inc,
      start_time: Date.now()
    }));
    
    // Log to UI
    if (window.addLine) window.addLine(`[SCENARIO] Activating: ${scenario.name}`, 'var(--a)');
    
    // Task 3: Write to Firebase to ensure persistence across syncs
    if (window.fbWrite) {
      for (const inc of newIncidents) {
        await window.fbWrite('incidents', inc, inc.id);
      }
      window.fbLog('SCENARIO_ACTIVATED', { scenario: id });
    }

    // Handle timeline
    scenario.timeline.forEach(step => {
      setTimeout(() => {
        if (window.addLine) window.addLine(`[TIMELINE] ${step.msg}`, 'var(--c)');
      }, step.t);
    });

    // Local update (will be confirmed by sync)
    window.AURIX_DATA.incidents = newIncidents;
    if (window.updateMaps) window.updateMaps(window.AURIX_DATA.incidents, window.AURIX_DATA.rescueUnits);
  }
};
