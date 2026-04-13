import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformSettings extends Document {
  tdsRate: number;
  gstRate: number;
  minWithdrawalAmount: number;
  webinarLink?: string;
  webinarTitle?: string;
  webinarDate?: string;
  presentationVideoLink?: string;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>({
  tdsRate: { type: Number, default: 2 },
  gstRate: { type: Number, default: 18 },
  minWithdrawalAmount: { type: Number, default: 500 },
  webinarLink: { type: String, default: '' },
  webinarTitle: { type: String, default: '' },
  webinarDate: { type: String, default: '' },
  presentationVideoLink: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);
