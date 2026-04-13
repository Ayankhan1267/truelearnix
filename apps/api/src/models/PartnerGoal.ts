import mongoose, { Schema, Document } from 'mongoose';

export interface IPartnerGoal extends Document {
  manager: mongoose.Types.ObjectId;
  partner: mongoose.Types.ObjectId;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;        // 'referrals' | 'earnings' | 'leads' | 'custom'
  metric: 'referrals' | 'earnings' | 'leads' | 'custom';
  dueDate?: Date;
  status: 'active' | 'completed' | 'missed' | 'cancelled';
  reward?: string;     // e.g. "₹500 bonus" or "Elite badge"
  createdAt: Date;
  updatedAt: Date;
}

const PartnerGoalSchema = new Schema<IPartnerGoal>({
  manager:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  partner:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true },
  description:  { type: String, default: '' },
  targetValue:  { type: Number, required: true, min: 1 },
  currentValue: { type: Number, default: 0 },
  unit:         { type: String, default: 'referrals' },
  metric:       { type: String, enum: ['referrals', 'earnings', 'leads', 'custom'], default: 'referrals' },
  dueDate:      { type: Date },
  status:       { type: String, enum: ['active', 'completed', 'missed', 'cancelled'], default: 'active' },
  reward:       { type: String },
}, { timestamps: true });

export default mongoose.model<IPartnerGoal>('PartnerGoal', PartnerGoalSchema);
