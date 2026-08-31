'use server';

import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Anomaly } from '@/models/Anomaly';
import { User } from '@/models/User';
import { chatWithCoach, generateAnomalyExplanation, generateLinkedInPost } from '@/lib/gemini';
import { z } from 'zod';

const chatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string()
  })),
  query: z.string(),
  userEmail: z.string().optional()
});

/**
 * Sends a message context to the Gemini AI Coach model.
 */
export async function sendMessageToCoach(rawInput: unknown) {
  const input = chatInputSchema.parse(rawInput);
  const response = await chatWithCoach(input.history, input.query);
  return { response };
}

/**
 * Runs an anomaly sweep. Returns a simulated anomaly if DB is unavailable.
 */
export async function triggerAnomalySweep(userEmail?: string) {
  const db = await dbConnect();

  // If no DB, return a simulated anomaly for demo purposes
  if (!db) {
    const explanation = await generateAnomalyExplanation({
      metric: 'Electricity Usage',
      expected: 1.8,
      actual: 4.2,
      temperature: 92
    });
    return {
      _id: 'demo-anomaly-001',
      metricSource: 'electricity',
      deviationPercentage: 115,
      explanation,
      resolved: false,
      detectedAt: new Date().toISOString()
    };
  }

  let email = userEmail || 'demo@aura.org';
  const session = await auth();
  if (session?.user?.email) {
    email = session.user.email;
  }

  // Find or create demo user if not found
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      name: 'Demo User',
      zipCode: '11201',
      homeType: 'Apartment',
      baselineFootprint: 3600,
      currentScore: 84
    });
  }

  // Check if an anomaly already exists for electricity
  let anomaly = await Anomaly.findOne({ userId: user._id, metricSource: 'electricity', resolved: false });

  if (!anomaly) {
    const explanation = await generateAnomalyExplanation({
      metric: 'Electricity Usage',
      expected: 1.8,
      actual: 4.2,
      temperature: 92
    });

    anomaly = await Anomaly.create({
      userId: user._id,
      metricSource: 'electricity',
      deviationPercentage: 115,
      explanation,
      resolved: false
    });
  }

  return JSON.parse(JSON.stringify(anomaly));
}

/**
 * Dismisses / Resolves an active anomaly record.
 */
export async function resolveAnomaly(anomalyId: string) {
  // Demo anomaly — just resolve client-side
  if (anomalyId === 'demo-anomaly-001') {
    return { success: true };
  }

  const db = await dbConnect();
  if (!db) return { success: true };

  await Anomaly.findByIdAndUpdate(anomalyId, { resolved: true });
  return { success: true };
}

/**
 * Calls Gemini to format copy-pasteable LinkedIn posts.
 */
export async function fetchLinkedInPost(pctSaved: number, tonsSaved: number, tone: 'professional' | 'celebratory' | 'analytical') {
  const post = await generateLinkedInPost(pctSaved, tonsSaved, tone);
  return { post };
}
