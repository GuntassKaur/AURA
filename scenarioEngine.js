/* ============================================================
   scenarioEngine.js — AURIX OS
   Handles structured scenario loading and timeline execution.
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
      { t: 0, msg: 'Initial breach detected in Sector NW' },
      { t: 10000, msg: 'Water levels rising +0.5m in Sector SE' },
      { t: 20000, msg: 'Grid failure in flooded zones — mesh active' }
    ]
  },
  crowd: {
    name: 'Mass Crowd Surge',
    dataset: [
      { id: 'zone_crowd_1', type: 'crowd', name: 'Main Stadium Exit', severity: 0.92, growth_rate: 0.4, affected_population: 5000, coordinates: [12.9716, 77.5946], status: 'critical' }
    ],
    timeline: [
      { t: 0, msg: 'Density threshold exceeded at Gate 4' },
      { t: 5000, msg: 'AI predicting surge in 12 mins' }
    ]
  },
  cardiac: {
    name: 'Worker Cardiac Emergency',
    dataset: [
      { id: 'zone_worker_1', type: 'medical', name: 'Construction Site B', severity: 1.0, growth_rate: 0, affected_population: 1, coordinates: [12.9716, 77.5946], status: 'critical' }
    ],
    timeline: [
      { t: 0, msg: 'VITAL-SHIELD Alert: HR 142 / O2 88%' },
      { t: 2000, msg: 'Medical unit M2 dispatched — ETA 4 mins' }
    ]
  }
};

window.loadScenario = (id) => {
  const scenario = SCENARIOS[id];
  if (!scenario) return;

  if (window.AURIX_DATA) {
    window.AURIX_DATA.incidents = scenario.dataset.map(inc => ({
      ...inc,
      start_time: Date.now()
    }));
    
    // Log to UI
    if (window.addLine) window.addLine(`[SCENARIO] Loaded: ${scenario.name}`, 'var(--a)');
    
    // Log to Firebase
    if (window.fbLog) window.fbLog('SCENARIO_LOADED', { scenario: id });

    // Handle timeline
    scenario.timeline.forEach(step => {
      setTimeout(() => {
        if (window.addLine) window.addLine(`[TIMELINE] ${step.msg}`, 'var(--c)');
      }, step.t);
    });

    // Update Maps
    if (window.updateMaps) window.updateMaps(window.AURIX_DATA.incidents, window.AURIX_DATA.rescueUnits);
  }
};
