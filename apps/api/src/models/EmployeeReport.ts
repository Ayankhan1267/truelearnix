import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeReport extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date; // normalised to YYYY-MM-DD (midnight IST)
  reportText: string;
  tasksCompleted: number;
  tasksTotal: number;
  accomplishments: string;
  blockers: string;
  tomorrowPlan: string;
  status: 'pending' | 'submitted';
  reportedAt?: Date;
  aiSummary?: string;
  performanceScore?: number; // 1-10, AI-generated
  sentBriefing: boolean; // morning briefing sent?
  sentEodReminder: boolean; // EOD reminder sent?
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeReportSchema = new Schema<IEmployeeReport>({
  employee:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date:           { type: Date, required: true },
  reportText:     { type: String, default: '' },
  tasksCompleted: { type: Number, default: 0 },
  tasksTotal:     { type: Number, default: 0 },
  accomplishments: { type: String, default: '' },
  blockers:        { type: String, default: '' },
  tomorrowPlan:    { type: String, default: '' },
  status:          { type: String, enum: ['pending', 'submitted'], default: 'pending' },
  reportedAt:      Date,
  aiSummary:       String,
  performanceScore: Number,
  sentBriefing:    { type: Boolean, default: false },
  sentEodReminder: { type: Boolean, default: false },
}, { timestamps: true });

EmployeeReportSchema.index({ employee: 1, date: 1 }, { unique: true });
EmployeeReportSchema.index({ date: -1 });

export default mongoose.model<IEmployeeReport>('EmployeeReport', EmployeeReportSchema);
