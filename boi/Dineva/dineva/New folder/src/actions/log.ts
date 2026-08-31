'use server';

import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { ActivityLog } from '@/models/ActivityLog';
import { User } from '@/models/User';
import { z } from 'zod';

const logInputSchema = z.object({
  weekNumber: z.number().min(1).max(52),
  electricityKwh: z.number().min(0),
  gasTherms: z.number().min(0),
  carMiles: z.number().min(0),
  evMiles: z.number().min(0),
  composted: z.boolean(),
  userEmail: z.string().optional()
});

/**
 * Saves a weekly log entry and recalculates the user score.
 * Falls back to pure score calculation if DB unavailable.
 */
export async function submitWeeklyLog(rawInput: unknown) {
  const input = logInputSchema.parse(rawInput);

  // Score engine calculation (always runs, even without DB)
  let score = 84;
  const homeType = 'Apartment'; // default for demo

  if (input.gasTherms > 20) score -= 8;
  else if (input.gasTherms < 8) score += 4;

  if (input.carMiles > 100) score -= 10;
  else if (input.carMiles < 20) score += 4;

  if (input.composted) score += 5;

  const finalScore = Math.max(10, Math.min(100, score));

  // Build a simulated log item for immediate UI feedback
  const simulatedLog = {
    _id: `local-${Date.now()}`,
    weekNumber: input.weekNumber,
    electricityKwh: input.electricityKwh,
    gasTherms: input.gasTherms,
    carMiles: input.carMiles,
    evMiles: input.evMiles,
    composted: input.composted,
    loggedAt: new Date().toISOString()
  };

  const db = await dbConnect();

  if (!db) {
    // Offline/demo mode — return simulated result
    return {
      success: true,
      newScore: finalScore,
      log: simulatedLog,
      logsList: [simulatedLog]
    };
  }

  let email = input.userEmail || 'demo@aura.org';
  const session = await auth();
  if (session?.user?.email) {
    email = session.user.email;
  }

  // Find or create demo user
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

  // Home type adjustment
  if (user.homeType === 'Townhouse') score -= 5;
  if (user.homeType === 'Detached') score -= 12;
  const dbScore = Math.max(10, Math.min(100, score));

  const log = await ActivityLog.findOneAndUpdate(
    { userId: user._id, weekNumber: input.weekNumber },
    {
      userId: user._id,
      weekNumber: input.weekNumber,
      electricityKwh: input.electricityKwh,
      gasTherms: input.gasTherms,
      carMiles: input.carMiles,
      evMiles: input.evMiles,
      composted: input.composted,
      loggedAt: new Date()
    },
    { upsert: true, new: true }
  );

  user.currentScore = dbScore;
  await user.save();

  const logs = await ActivityLog.find({ userId: user._id }).sort({ weekNumber: -1 });

  return {
    success: true,
    newScore: dbScore,
    log: JSON.parse(JSON.stringify(log)),
    logsList: JSON.parse(JSON.stringify(logs))
  };
}

/**
 * Retrieves the history ledger logs for a user.
 * Returns empty array if DB unavailable.
 */
export async function getLogsHistory(userEmail?: string) {
  const db = await dbConnect();
  if (!db) return [];

  let email = userEmail || 'demo@aura.org';
  const session = await auth();
  if (session?.user?.email) {
    email = session.user.email;
  }

  const user = await User.findOne({ email });
  if (!user) return [];

  const logs = await ActivityLog.find({ userId: user._id }).sort({ weekNumber: -1 });
  return JSON.parse(JSON.stringify(logs));
}
