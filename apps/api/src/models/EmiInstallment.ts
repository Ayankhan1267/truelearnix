import mongoose, { Document, Schema } from 'mongoose';

export interface IEmiInstallment extends Document {
  user: mongoose.Types.ObjectId;
  packagePurchase: mongoose.Types.ObjectId;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: Date;
  paidAt?: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'paid' | 'overdue' | 'failed';
}

const EmiInstallmentSchema = new Schema<IEmiInstallment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  packagePurchase: { type: Schema.Types.ObjectId, ref: 'PackagePurchase', required: true },
  installmentNumber: { type: Number, required: true },
  totalInstallments: { type: Number, default: 3 },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidAt: Date,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'failed'], default: 'pending' },
}, { timestamps: true });

EmiInstallmentSchema.index({ user: 1, status: 1 });
EmiInstallmentSchema.index({ dueDate: 1, status: 1 });
EmiInstallmentSchema.index({ packagePurchase: 1 });

export default mongoose.model<IEmiInstallment>('EmiInstallment', EmiInstallmentSchema);
