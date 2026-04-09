import mongoose from 'mongoose';

const MediaFileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: String,
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
  size: Number,
  mimeType: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('MediaFile', MediaFileSchema);
