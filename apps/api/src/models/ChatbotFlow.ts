import mongoose, { Document, Schema } from 'mongoose';

export interface IChatbotFlow extends Document {
  name: string;
  trigger: string;
  isActive: boolean;
  steps: {
    order: number;
    message: string;
    delaySeconds?: number;
    waitForReply?: boolean;
    options?: { label: string; nextStepOrder: number }[];
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatbotFlowSchema = new Schema<IChatbotFlow>({
  name: { type: String, required: true },
  trigger: { type: String, required: true, lowercase: true, trim: true },
  isActive: { type: Boolean, default: true },
  steps: [{
    order: { type: Number, required: true },
    message: { type: String, required: true },
    delaySeconds: { type: Number, default: 0 },
    waitForReply: { type: Boolean, default: false },
    options: [{ label: String, nextStepOrder: Number }],
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

ChatbotFlowSchema.index({ trigger: 1, isActive: 1 });

export default mongoose.model<IChatbotFlow>('ChatbotFlow', ChatbotFlowSchema);
