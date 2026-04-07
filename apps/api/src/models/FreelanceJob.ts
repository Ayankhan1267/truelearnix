import mongoose, { Schema, Document } from 'mongoose';

export interface IFreelanceJob extends Document {
  title: string;
  description: string;
  postedBy: mongoose.Types.ObjectId;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  skills: string[];
  duration: string;
  status: 'open' | 'in-progress' | 'closed';
  applicants: mongoose.Types.ObjectId[];
  category: string;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
}

const FreelanceJobSchema = new Schema<IFreelanceJob>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  budget: { type: Number, required: true },
  budgetType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
  skills: [{ type: String }],
  duration: { type: String, default: '1 month' },
  status: { type: String, enum: ['open', 'in-progress', 'closed'], default: 'open' },
  applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  category: { type: String, default: 'Development' },
  experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'intermediate' },
}, { timestamps: true });

export default mongoose.model<IFreelanceJob>('FreelanceJob', FreelanceJobSchema);
