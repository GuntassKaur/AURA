import { GoogleGenAI } from '@google/genai';

// Initialize the GenAI client using the environment variable.
// If not present, we will run in simulated fallback mode.
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log("Gemini 2.5 SDK Initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Google Gen AI SDK:", error);
  }
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined inside .env.local. Running in simulated AI mode.");
}

export interface AnomalyDetails {
  metric: string;
  expected: number;
  actual: number;
  temperature: number;
}

/**
 * Generates an explainable analysis of an environmental consumption anomaly.
 */
export async function generateAnomalyExplanation(details: AnomalyDetails): Promise<string> {
  const prompt = `
    You are the EcoSphere AI sustainability coach.
    Analyze this household resource anomaly:
    - Target Resource: ${details.metric}
    - Standard Baseline: ${details.expected}
    - Logged Actual Value: ${details.actual}
    - Local Outside Temperature: ${details.temperature} F
    
    Explain in a concise, conversational paragraph (2-3 sentences max) why this spike occurred.
    Differentiate between weather-driven impact (like AC grid load) and user behavioral offsets.
  `;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 200,
          temperature: 0.2,
        }
      });
      if (response.text) return response.text.trim();
    } catch (error) {
      console.error("Gemini API error during anomaly explanation:", error);
    }
  }

  // Simulated AI Fallback
  return `An electrical usage spike of ${Math.round(((details.actual - details.expected) / details.expected) * 100)}% was detected during peak afternoon hours. External temperatures reached ${details.temperature}°F, causing your AC compressor cycles to run continuously. Adjusting your Nest target to 74°F during high grid loads could save 4.2 kg of carbon.`;
}

/**
 * Core chat engine for the AI Coach interface.
 */
export async function chatWithCoach(chatHistory: Array<{ role: 'user' | 'model'; text: string }>, userQuery: string): Promise<string> {
  // Format history for the Gemini API call
  const formattedContents = chatHistory.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));
  
  formattedContents.push({
    role: 'user',
    parts: [{ text: userQuery }]
  });

  const systemInstruction = `
    You are the EcoSphere AI Coach, a supportive, data-driven sustainability expert.
    Answer the user's questions about energy saving, household optimization, carbon footprints, composting, and grid matching.
    Keep responses friendly, actionable, and relatively concise (under 4 sentences).
    Refer to regional targets (like Brooklyn, NY grid averages) when helpful.
  `;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userQuery, // Standard simple content or history structure
        config: {
          maxOutputTokens: 300,
          temperature: 0.7,
          systemInstruction: systemInstruction,
        }
      });
      if (response.text) return response.text.trim();
    } catch (error) {
      console.error("Gemini API error during coach chat:", error);
    }
  }

  // Simulated AI Chat Fallbacks
  const q = userQuery.toLowerCase();
  if (q.includes('spike') || q.includes('anomaly') || q.includes('june 8')) {
    return `Looking at your dashboard, your electric usage spiked to 4.2 kWh on June 8 (+115%). Temperatures peaked at 92°F, meaning your AC was running hard while the Brooklyn utility grid was relying on emergency natural gas generators. To offset this, I recommend scheduling pre-cooling in the morning when the grid is clean.`;
  }
  if (q.includes('nest') || q.includes('thermostat') || q.includes('ac')) {
    return `For AC scheduling, try setting your Nest target to 74°F when wind peaks occur. Pre-cooling your home between 10 AM and 1 PM before grid demand peaks keeps your score high and lowers your energy costs.`;
  }
  if (q.includes('compare') || q.includes('neighbor') || q.includes('brooklyn')) {
    return `You're currently in the Top 8% of townhouses in Brooklyn (Zip 11201). Your weekly grid consumption is 12% lower than the neighborhood average, mostly due to your smart-charging Tesla schedule.`;
  }

  return `Excellent question. Based on your apartment profile in Zip 11201, implementing a smart plug scheduler for your major cooling appliances is the fastest way to drop your footprint. Would you like me to map out a schedule?`;
}

/**
 * Generates custom LinkedIn posts using simulation metrics.
 */
export async function generateLinkedInPost(pctSaved: number, tonsSaved: number, tone: 'professional' | 'celebratory' | 'analytical'): Promise<string> {
  const prompt = `
    Generate a short, engaging LinkedIn post celebrating an environmental achievement.
    - Percent carbon reduction: ${pctSaved}%
    - Projected 10-Year CO2 savings: ${tonsSaved} Tons
    - Selected tone style: ${tone}
    - Include a couple of relevant hashtags.
    Keep it professional, impact-focused, and suitable for sharing.
  `;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 250,
          temperature: 0.7,
        }
      });
      if (response.text) return response.text.trim();
    } catch (error) {
      console.error("Gemini API error during LinkedIn post generation:", error);
    }
  }

  // Simulated AI Fallbacks
  if (tone === 'celebratory') {
    return `Celebration time! 🎉 I just modeled my household carbon path down ${pctSaved}% using EcoSphere AI! By shifting EV charging and AC cooling schedules, I'm projected to prevent ${tonsSaved} Tons of CO2 emissions over the decade. Small daily shifts make a massive community impact. Let's make Brooklyn greener! ☀️ #Sustainability #ClimateAction #EcoSphere`;
  }
  if (tone === 'analytical') {
    return `EcoSphere AI Simulation Metrics:\n- Baseline Carbon Output: 108.0 Tons CO2\n- Optimized Output: ${(108 * (1 - pctSaved/100)).toFixed(1)} Tons CO2\n- Footprint reduction: -${pctSaved}%\n- Key metrics: Grid-matching EV charging and pre-cooling cycles.\n- Projected 10-Year cumulative carbon savings: ${tonsSaved} Tons CO2.\n\nOptimizing resources isn't just clean, it's financially smart. #ESG #CarbonAccounting #DataAnalytics`;
  }
  return `Proud to share that I have modeled my personal carbon trajectory down ${pctSaved}% using EcoSphere AI. 🌿\n\nKey changes implemented:\n- Aligned high-load appliance use with local wind/solar grid peaks.\n- Integrated thermostat cooling offsets.\n\nTotal projected 10-Year impact: ${tonsSaved} Tons of CO2 saved. Professional change starts at home. #GreenTech #SmartHome #Sustainability`;
}
