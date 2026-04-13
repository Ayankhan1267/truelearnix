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
  paymentLink?: string;
  partnerUser?: mongoose.Types.ObjectId;
  partnerCommissionAmount: number;
  partnerCommissionPaid: boolean;
  managerUser?: mongoose.Types.ObjectId;
  managerCommissionAmount: number;
  managerCommissionPaid: boolean;
  walletAmountUsed: number;
}

const EmiInstallmentSchema = new Schema<IEmiInstallment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  packagePurchase: { type: Schema.Types.ObjectId, ref: 'PackagePurchase', required: true },
  installmentNumber: { type: Number, required: true },
  totalInstallments: { type: Number, default: 4 },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidAt: Date,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'failed'], default: 'pending' },
  paymentLink: String,
  partnerUser: { type: Schema.Types.ObjectId, ref: 'User' },
  partnerCommissionAmount: { type: Number, default: 0 },
  partnerCommissionPaid: { type: Boolean, default: false },
  managerUser: { type: Schema.Types.ObjectId, ref: 'User' },
  managerCommissionAmount: { type: Number, default: 0 },
  managerCommissionPaid: { type: Boolean, default: false },
  walletAmountUsed: { type: Number, default: 0 },
}, { timestamps: true });

EmiInstallmentSchema.index({ user: 1, status: 1 });
EmiInstallmentSchema.index({ dueDate: 1, status: 1 });
EmiInstallmentSchema.index({ packagePurchase: 1 });
EmiInstallmentSchema.index({ partnerUser: 1 });

export default mongoose.model<IEmiInstallment>('EmiInstallment', EmiInstallmentSchema);
