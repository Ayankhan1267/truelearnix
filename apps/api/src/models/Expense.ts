import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  category: 'server' | 'marketing' | 'salary' | 'tools' | 'office' | 'refund' | 'legal' | 'other';
  amount: number;
  gstPaid?: number;
  vendor?: string;
  invoiceNumber?: string;
  date: Date;
  notes?: string;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  title: { type: String, required: true, trim: true },
  category: { type: String, enum: ['server', 'marketing', 'salary', 'tools', 'office', 'refund', 'legal', 'other'], required: true },
  amount: { type: Number, required: true },
  gstPaid: { type: Number, default: 0 },
  vendor: String,
  invoiceNumber: String,
  date: { type: Date, required: true, default: Date.now },
  notes: String,
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
