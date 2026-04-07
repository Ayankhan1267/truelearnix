import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  images?: string[];
  type: 'post' | 'question' | 'achievement' | 'resource';
  group?: string;
  likes: mongoose.Types.ObjectId[];
  comments: {
    _id?: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    likes: mongoose.Types.ObjectId[];
    createdAt: Date;
  }[];
  tags: string[];
  isPinned: boolean;
  isApproved: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityPostSchema = new Schema<ICommunityPost>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  images: [String],
  type: { type: String, enum: ['post', 'question', 'achievement', 'resource'], default: 'post' },
  group: String,
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    content: String,
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [String],
  isPinned: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

CommunityPostSchema.index({ createdAt: -1 });
CommunityPostSchema.index({ author: 1 });
CommunityPostSchema.index({ type: 1 });

export default mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);
