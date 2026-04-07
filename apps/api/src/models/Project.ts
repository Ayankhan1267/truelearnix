import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  techStack: string[];
  liveUrl: string;
  repoUrl: string;
  thumbnail: string;
  likes: mongoose.Types.ObjectId[];
  views: number;
  status: 'draft' | 'published';
  category: string;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  techStack: [{ type: String }],
  liveUrl: { type: String, default: '' },
  repoUrl: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  category: { type: String, default: 'General' },
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
