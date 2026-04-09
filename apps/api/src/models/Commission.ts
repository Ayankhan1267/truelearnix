import mongoose, { Document, Schema } from 'mongoose';

export interface ICommission extends Document {
  // Who earned the commission
  earner: mongoose.Types.ObjectId;
  earnerTier: string;
  earnerCommissionRate: number;
  // Who made the purchase
  buyer: mongoose.Types.ObjectId;
  buyerPackageTier: string;
  // MLM level
  level: 1 | 2 | 3;
  levelRate: number; // % applied at this level
  // Amounts
  saleAmount: number;
  commissionAmount: number;
  // Reference
  packagePurchaseId: mongoose.Types.ObjectId;
  // Status
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paidAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema = new Schema<ICommission>({
  earner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  earnerTier: { type: String, required: true },
  earnerCommissionRate: { type: Number, required: true },
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  buyerPackageTier: { type: String, required: true },
  level: { type: Number, enum: [1, 2, 3], required: true },
  levelRate: { type: Number, required: true },
  saleAmount: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  packagePurchaseId: { type: Schema.Types.ObjectId, ref: 'PackagePurchase', required: true },
  status: { type: String, enum: ['pending', 'approved', 'paid', 'rejected'], default: 'approved' },
  paidAt: Date,
  rejectionReason: String,
}, { timestamps: true });

CommissionSchema.index({ earner: 1, status: 1 });
CommissionSchema.index({ earner: 1, createdAt: -1 });
CommissionSchema.index({ earner: 1, buyer: 1 });
CommissionSchema.index({ packagePurchaseId: 1 });
CommissionSchema.index({ buyer: 1 });
CommissionSchema.index({ createdAt: -1 });

export default mongoose.model<ICommission>('Commission', CommissionSchema);
