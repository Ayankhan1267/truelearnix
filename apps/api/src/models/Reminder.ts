import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  title: string;
  message: string;
  scheduledAt: Date;
  targetType: 'all' | 'role' | 'tier' | 'user';
  targetValue: string;
  channel: 'email' | 'push' | 'both';
  status: 'pending' | 'sent' | 'failed';
  createdBy: mongoose.Types.ObjectId;
  isRecurring: boolean;
  recurringInterval: 'daily' | 'weekly' | 'monthly' | '';
}

const ReminderSchema = new Schema<IReminder>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  targetType: { type: String, enum: ['all', 'role', 'tier', 'user'], default: 'all' },
  targetValue: { type: String, default: '' },
  channel: { type: String, enum: ['email', 'push', 'both'], default: 'both' },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isRecurring: { type: Boolean, default: false },
  recurringInterval: { type: String, enum: ['daily', 'weekly', 'monthly', ''], default: '' },
}, { timestamps: true });

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
