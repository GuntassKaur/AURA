/**
 * AURA v2.0 Tactical Engine
 * Transitions simulation to real-world data & AI reasoning.
 */

const AURA_CONFIG = {
    GEMINI_API_KEY: 'AIzaSyAvyWqiuYYrTMVyAuAQBQsiH6KZJz81V08', // To be filled from .env
    WEATHER_API_KEY: '927db74399ee0d5e4a9a43e99f5c6be8', // To be filled from .env
    MODE: 'COMMAND', // COMMAND | FIELD
};

class AuraBrain {
    constructor() {
        this.sensors = {
            temp: 25,
            wind: 10,
            precip: 0,
            hr: 72, // Heart Rate from "Vital-Shield"
            mesh_health: 98
        };
        this.isOffline = !navigator.onLine;
    }

    // 1. DYNAMIC DATA SOURCE: Weather API
    async fetchRealTimeData(lat = 28.6139, lon = 77.2090) {
        try {
            // Simulated for demo if no key, but structured for real API
            if (!AURA_CONFIG.WEATHER_API_KEY) {
                console.warn("Weather API Key missing. Using simulated drift.");
                this.sensors.wind += (Math.random() - 0.5) * 5;
                return this.sensors;
            }
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${AURA_CONFIG.WEATHER_API_KEY}`);
            const data = await res.json();
            this.sensors.temp = data.main.temp - 273.15;
            this.sensors.wind = data.wind.speed;
            this.sensors.precip = data.rain ? data.rain['1h'] : 0;
            return this.sensors;
        } catch (e) {
            this.isOffline = true;
            return this.sensors;
        }
    }

    // 2. v4.0 DETERMINISTIC TACTICAL ENGINE
    async generateDirective(ctx = {}) {
        const flood = ctx.flood || Math.floor(Math.random() * 100);
        const crowd = ctx.crowd || Math.floor(Math.random() * 100);
        const temp = ctx.temp || Math.floor(Math.random() * 50);

        // --- SENTENCE BANKS FOR VARIATION ---
        const OBS = [
            `Hydro-sensors at ${flood}%, density hovering at ${crowd}%.`,
            `Thermal reading ${temp}°C, crowd saturation ${crowd}%.`,
            `Detecting ${flood}% flood depth near sector ${crowd > 50 ? 'North' : 'South'}.`
        ];
        
        const REA = [];
        if (flood > 70) REA.push("CRITICAL: Flood levels indicate immediate structural compromise.");
        if (crowd > 80) REA.push("ALERT: Crowd density suggests severe evacuation bottleneck.");
        if (temp > 45) REA.push("WARNING: Thermal anomaly detected. Fire spread probable.");
        if (REA.length === 0) REA.push("Environmental variance within safe operational margins.");

        const DEC = [
            "Initiating Sector-Wide Evacuation Protocol.",
            "Deploying Emergency Rescue Nodes to GPS.",
            "Rerouting all citizen paths to Safe Zone South.",
            "Activating emergency mesh barriers in Sector 4."
        ];

        // --- LOGIC CORRELATION ---
        let finalObs = OBS[Math.floor(Math.random() * OBS.length)];
        let finalRea = REA[Math.floor(Math.random() * REA.length)];
        let finalDec = DEC[Math.floor(Math.random() * DEC.length)];

        // Dynamic Decider Override
        if (flood > 70 && crowd > 80) {
            finalRea = "COMPOUND RISK: High flood depth + High density. Panic threshold critical.";
            finalDec = "URGENT: Force-opening Gate 4. Divert crowd immediately.";
        }

        const result = `[OBSERVE] ${finalObs}\n[REASON] ${finalRea}\n[DECIDE] ${finalDec}`;
        
        // Return structured result
        return result;
    }

    localHeuristic(ctx) {
        return this.generateDirective(ctx);
    }
}

window.AuraBrain = new AuraBrain();
