import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnomaly extends Document {
  userId: mongoose.Types.ObjectId;
  metricSource: 'electricity' | 'gas' | 'water';
  deviationPercentage: number;
  explanation: string;
  resolved: boolean;
  detectedAt: Date;
}

const AnomalySchema = new Schema<IAnomaly>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  metricSource: { type: String, enum: ['electricity', 'gas', 'water'], required: true },
  deviationPercentage: { type: Number, required: true },
  explanation: { type: String, required: true },
  resolved: { type: Boolean, required: true, default: false },
  detectedAt: { type: Date, default: Date.now }
});

export const Anomaly: Model<IAnomaly> = mongoose.models.Anomaly || mongoose.model<IAnomaly>('Anomaly', AnomalySchema);
