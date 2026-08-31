'use server';

import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';

export interface OnboardingData {
  zipCode: string;
  homeType: 'Apartment' | 'Townhouse' | 'Detached';
  gasCommute: number;
  transitCommute: number;
  email?: string;
  name?: string;
}

/**
 * Retrieves or initializes user state.
 * Falls back gracefully if DB is unavailable.
 */
export async function getOrCreateUser(email: string, name: string) {
  const db = await dbConnect();
  if (!db) {
    // Return a synthetic user in demo mode
    return { email, name, zipCode: '11201', homeType: 'Apartment', baselineFootprint: 3600, currentScore: 84 };
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      name,
      zipCode: '11201',
      homeType: 'Apartment',
      baselineFootprint: 3600,
      currentScore: 84
    });
  }

  return JSON.parse(JSON.stringify(user));
}

/**
 * Saves onboarding questionnaire data and outputs the initial score.
 * Works in demo mode without DB.
 */
export async function saveOnboarding(data: OnboardingData) {
  // Calculate carbon footprint baseline (kg CO2/year)
  let baseline = 3200;
  if (data.homeType === 'Townhouse') baseline += 1200;
  if (data.homeType === 'Detached') baseline += 2400;
  baseline += Math.round(data.gasCommute * 220 + data.transitCommute * 45);

  // Calculate dynamic starting score (0-100)
  let score = 84;
  if (data.homeType === 'Townhouse') score -= 5;
  if (data.homeType === 'Detached') score -= 12;
  score -= Math.round(data.gasCommute * 0.4);
  const finalScore = Math.max(40, Math.min(100, score));

  const syntheticUser = {
    email: data.email || 'demo@aura.org',
    name: data.name || 'Demo User',
    zipCode: data.zipCode,
    homeType: data.homeType,
    baselineFootprint: baseline,
    currentScore: finalScore
  };

  const db = await dbConnect();
  if (!db) {
    // Demo mode — just return calculated profile without saving
    return syntheticUser;
  }

  let userEmail = data.email || 'demo@aura.org';
  let userName = data.name || 'Demo User';

  // If authenticated, use active session details
  const session = await auth();
  if (session?.user?.email) {
    userEmail = session.user.email;
    userName = session.user.name || userName;
  }

  // Upsert user config
  const user = await User.findOneAndUpdate(
    { email: userEmail },
    {
      email: userEmail,
      name: userName,
      zipCode: data.zipCode,
      homeType: data.homeType,
      baselineFootprint: baseline,
      currentScore: finalScore
    },
    { upsert: true, new: true }
  );

  return JSON.parse(JSON.stringify(user));
}
