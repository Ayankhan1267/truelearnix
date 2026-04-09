import mongoose from 'mongoose';

const SiteContentSchema = new mongoose.Schema({
  section: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('SiteContent', SiteContentSchema);
