import mongoose, { Schema, Document } from 'mongoose';

export interface IKeyResult {
  title: string;
  target: number;
  current: number;
  unit: string;
}

export interface IGoal extends Document {
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  type: 'company' | 'team' | 'personal';
  quarter: string;
  year: number;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  progress: number;
  keyResults: IKeyResult[];
  dueDate: Date;
}

const KeyResultSchema = new Schema<IKeyResult>({
  title: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  unit: { type: String, default: '%' },
});

const GoalSchema = new Schema<IGoal>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['company', 'team', 'personal'], default: 'company' },
  quarter: { type: String, default: 'Q1' },
  year: { type: Number, default: new Date().getFullYear() },
  status: { type: String, enum: ['on-track', 'at-risk', 'behind', 'completed'], default: 'on-track' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  keyResults: [KeyResultSchema],
  dueDate: { type: Date },
}, { timestamps: true });

export default mongoose.model<IGoal>('Goal', GoalSchema);
