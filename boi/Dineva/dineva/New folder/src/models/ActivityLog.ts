import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  weekNumber: number;
  electricityKwh: number;
  gasTherms: number;
  carMiles: number;
  evMiles: number;
  composted: boolean;
  loggedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weekNumber: { type: Number, required: true },
  electricityKwh: { type: Number, required: true },
  gasTherms: { type: Number, required: true },
  carMiles: { type: Number, required: true },
  evMiles: { type: Number, required: true },
  composted: { type: Boolean, required: true, default: false },
  loggedAt: { type: Date, default: Date.now }
});

// Enforce unique log entries per user per week
ActivityLogSchema.index({ userId: 1, weekNumber: 1 }, { unique: true });

export const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
