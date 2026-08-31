import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  zipCode: string;
  homeType: 'Apartment' | 'Townhouse' | 'Detached';
  baselineFootprint: number; // calculated in kg CO2/year
  currentScore: number; // rolling 0-100
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  zipCode: { type: String, required: true },
  homeType: { type: String, enum: ['Apartment', 'Townhouse', 'Detached'], required: true },
  baselineFootprint: { type: Number, required: true, default: 0 },
  currentScore: { type: Number, required: true, default: 84 },
  createdAt: { type: Date, default: Date.now }
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
