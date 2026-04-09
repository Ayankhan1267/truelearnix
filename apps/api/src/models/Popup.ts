import mongoose, { Document, Schema } from 'mongoose';

export type PopupType = 'earnings_toast' | 'event' | 'presentation' | 'announcement';
export type PopupTrigger = 'on_load' | 'on_scroll' | 'on_exit';

export interface IPopup extends Document {
  type: PopupType;
  title: string;
  description?: string;
  image?: string;
  videoUrl?: string;
  videoThumb?: string;
  ctaText?: string;
  ctaLink?: string;
  trigger: PopupTrigger;
  triggerDelay: number;      // seconds after page load
  triggerScroll: number;     // scroll % (0-100)
  showOnce: boolean;         // localStorage: don't show again
  isActive: boolean;
  priority: number;          // higher = shown first
  startDate?: Date;
  endDate?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PopupSchema = new Schema<IPopup>({
  type:         { type: String, enum: ['earnings_toast','event','presentation','announcement'], required: true },
  title:        { type: String, required: true },
  description:  { type: String },
  image:        { type: String },
  videoUrl:     { type: String },
  videoThumb:   { type: String },
  ctaText:      { type: String },
  ctaLink:      { type: String },
  trigger:      { type: String, enum: ['on_load','on_scroll','on_exit'], default: 'on_load' },
  triggerDelay: { type: Number, default: 5 },
  triggerScroll:{ type: Number, default: 50 },
  showOnce:     { type: Boolean, default: true },
  isActive:     { type: Boolean, default: true },
  priority:     { type: Number, default: 0 },
  startDate:    { type: Date },
  endDate:      { type: Date },
  createdBy:    { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

PopupSchema.index({ isActive: 1, priority: -1 });

export default mongoose.model<IPopup>('Popup', PopupSchema);
