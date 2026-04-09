import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  type: 'email' | 'whatsapp';
  templateId?: mongoose.Types.ObjectId;
  subject?: string;
  body: string;
  targetFilter: {
    roles?: string[];
    packageTiers?: string[];
    isAffiliate?: boolean;
    customPhones?: string[];
    customEmails?: string[];
  };
  status: 'draft' | 'sending' | 'sent' | 'failed' | 'scheduled';
  scheduledAt?: Date;
  sentAt?: Date;
  sentCount: number;
  failedCount: number;
  totalTargeted: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  type: { type: String, enum: ['email', 'whatsapp'], required: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'MarketingTemplate' },
  subject: String,
  body: { type: String, required: true },
  targetFilter: {
    roles: [String],
    packageTiers: [String],
    isAffiliate: Boolean,
    customPhones: [String],
    customEmails: [String],
  },
  status: { type: String, enum: ['draft', 'sending', 'sent', 'failed', 'scheduled'], default: 'draft' },
  scheduledAt: Date,
  sentAt: Date,
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  totalTargeted: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

CampaignSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
