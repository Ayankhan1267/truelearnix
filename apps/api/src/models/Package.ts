import mongoose, { Document, Schema } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  tier: 'starter' | 'pro' | 'elite' | 'supreme';
  price: number;
  commissionRate: number;
  description: string;
  features: string[];
  coursesAccess: 'limited' | 'full';
  liveClassAccess: boolean;
  aiCoachAccess: boolean;
  jobEngineAccess: boolean;
  communityAccess: boolean;
  personalBrandAccess: boolean;
  mentorSupport: boolean;
  prioritySupport: boolean;
  emiAvailable: boolean;
  emiMonths?: number;
  emiMonthlyAmount?: number;
  isActive: boolean;
  displayOrder: number;
  badge?: string;
  badgeColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>({
  name: { type: String, required: true },
  tier: { type: String, enum: ['starter', 'pro', 'elite', 'supreme'], required: true, unique: true },
  price: { type: Number, required: true },
  commissionRate: { type: Number, required: true },
  description: { type: String, required: true },
  features: [String],
  coursesAccess: { type: String, enum: ['limited', 'full'], default: 'limited' },
  liveClassAccess: { type: Boolean, default: false },
  aiCoachAccess: { type: Boolean, default: false },
  jobEngineAccess: { type: Boolean, default: false },
  communityAccess: { type: Boolean, default: true },
  personalBrandAccess: { type: Boolean, default: false },
  mentorSupport: { type: Boolean, default: false },
  prioritySupport: { type: Boolean, default: false },
  emiAvailable: { type: Boolean, default: false },
  emiMonths: Number,
  emiMonthlyAmount: Number,
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  badge: String,
  badgeColor: String,
}, { timestamps: true });

export default mongoose.model<IPackage>('Package', PackageSchema);
