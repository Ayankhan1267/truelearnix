import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketingTemplate extends Document {
  name: string;
  type: 'email' | 'whatsapp';
  category: 'promotional' | 'welcome' | 'followup' | 'reminder' | 'announcement' | 'custom';
  subject?: string; // email only
  body: string;
  variables: string[]; // e.g. ['{{name}}', '{{course}}']
  previewText?: string;
  isActive: boolean;
  usageCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingTemplateSchema = new Schema<IMarketingTemplate>({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['email', 'whatsapp'], required: true },
  category: { type: String, enum: ['promotional', 'welcome', 'followup', 'reminder', 'announcement', 'custom'], default: 'custom' },
  subject: String,
  body: { type: String, required: true },
  variables: [String],
  previewText: String,
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

MarketingTemplateSchema.index({ type: 1, isActive: 1 });

export default mongoose.model<IMarketingTemplate>('MarketingTemplate', MarketingTemplateSchema);
