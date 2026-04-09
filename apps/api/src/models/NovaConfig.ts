import mongoose, { Schema, Document } from 'mongoose';

export interface INovaConfig extends Document {
  founderPhone: string;
  founderName: string;
  morningBriefing: { enabled: boolean; time: string };
  eodReminder: { enabled: boolean; time: string };
  weeklyReport: { enabled: boolean; day: number; time: string };
  newSaleAlert: boolean;
  newLearnerAlert: boolean;
  classReminder: { enabled: boolean; minutesBefore: number };
  lowAttendanceAlert: boolean;
  autoOnboarding: boolean;
  employeeReminders: boolean;
  conversationHistory: { role: 'user' | 'assistant'; content: string; ts: Date }[];
  actionLog: { action: string; detail: string; ts: Date }[];
}

const NovaConfigSchema = new Schema<INovaConfig>({
  founderPhone:    { type: String, default: '' },
  founderName:     { type: String, default: 'Founder' },
  morningBriefing: { enabled: { type: Boolean, default: false }, time: { type: String, default: '09:00' } },
  eodReminder:     { enabled: { type: Boolean, default: false }, time: { type: String, default: '18:00' } },
  weeklyReport:    { enabled: { type: Boolean, default: false }, day: { type: Number, default: 0 }, time: { type: String, default: '10:00' } },
  newSaleAlert:       { type: Boolean, default: false },
  newLearnerAlert:    { type: Boolean, default: false },
  classReminder:   { enabled: { type: Boolean, default: false }, minutesBefore: { type: Number, default: 60 } },
  lowAttendanceAlert: { type: Boolean, default: false },
  autoOnboarding:    { type: Boolean, default: false },
  employeeReminders: { type: Boolean, default: false },
  conversationHistory: [{
    role:    { type: String, enum: ['user', 'assistant'] },
    content: String,
    ts:      { type: Date, default: Date.now },
  }],
  actionLog: [{
    action: String,
    detail: String,
    ts:     { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.model<INovaConfig>('NovaConfig', NovaConfigSchema);
