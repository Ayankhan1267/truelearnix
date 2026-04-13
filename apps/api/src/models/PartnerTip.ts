import mongoose, { Schema, Document } from 'mongoose';

export interface IPartnerTip extends Document {
  manager: mongoose.Types.ObjectId;
  partner: mongoose.Types.ObjectId;
  message: string;
  category: 'tip' | 'feedback' | 'motivation' | 'warning' | 'update';
  isRead: boolean;
  createdAt: Date;
}

const PartnerTipSchema = new Schema<IPartnerTip>({
  manager:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  partner:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message:  { type: String, required: true },
  category: { type: String, enum: ['tip', 'feedback', 'motivation', 'warning', 'update'], default: 'tip' },
  isRead:   { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IPartnerTip>('PartnerTip', PartnerTipSchema);
