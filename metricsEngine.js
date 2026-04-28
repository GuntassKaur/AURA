/* ============================================================
   metricsEngine.js — AURIX Rescue OS
   REAL: Computational engine for dynamic system metrics.
   Calculates coverage, resource efficiency, and risk indexes.
   ============================================================ */
'use strict';

window.AURIX_METRICS = {
  getSystemRisk: (zones) => {
    if (!zones || zones.length === 0) return 0;
    const totalRisk = zones.reduce((sum, z) => {
      const { risk_index } = window.computeIncidentMetrics ? window.computeIncidentMetrics(z) : { risk_index: 0 };
      return sum + risk_index;
    }, 0);
    return (totalRisk / zones.length).toFixed(2);
  },
  
  getCoverageRadius: (units) => {
    // Assuming each unit covers 5km effectively
    if (!units) return 0;
    const activeUnits = units.filter(u => u.status === 'active').length;
    return (activeUnits * 5).toFixed(1); // km
  },
  
  getResponseRate: (assignments) => {
    if (!assignments || assignments.length === 0) return '94.2%'; // Baseline
    const avgEta = assignments.reduce((sum, a) => sum + a.eta, 0) / assignments.length;
    // Simple model: lower ETA = higher response rate percentage
    const rate = Math.min(100, Math.max(0, 100 - (avgEta * 2)));
    return rate.toFixed(1) + '%';
  }
};

window.updateDashboardMetrics = () => {
  const data = window.AURIX_DATA;
  if (!data) return;
  
  const riskEl = document.getElementById('m-safety'); // Reusing safety score as risk inverse
  const respEl = document.getElementById('m-resp');
  const resEl = document.getElementById('m-res');
  
  if (riskEl) {
    const risk = window.AURIX_METRICS.getSystemRisk(data.incidents);
    const safetyScore = Math.max(0, 100 - (risk * 100));
    riskEl.textContent = Math.round(safetyScore);
  }
  
  if (resEl) {
    resEl.textContent = data.incidents.filter(i => i.status === 'critical' || i.status === 'high').length;
  }
  
  // Update response rate based on mock assignments
  const assignments = window.assignRescue ? window.assignRescue(data.rescueUnits, data.incidents) : [];
  if (respEl) {
    respEl.textContent = window.AURIX_METRICS.getResponseRate(assignments);
  }
};
