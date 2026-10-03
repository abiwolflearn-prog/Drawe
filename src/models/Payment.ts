import mongoose, { Schema, Document } from 'mongoose';
import { IPayment } from '../types/index.js';

export interface IPaymentDocument extends Omit<IPayment, '_id'>, Document {}

const PaymentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    playerName: { type: String },
    playerPhone: { type: String },
    drawId: { type: Schema.Types.ObjectId, ref: 'Draw', required: true },
    drawTitle: { type: String },
    selectionId: { type: Schema.Types.ObjectId, ref: 'Selection', required: true },
    numbers: [{ type: Number, required: true }],
    amount: { type: Number, required: true },
    method: { 
      type: String, 
      enum: ['TELEBIRR', 'CBE_BIRR', 'BOA', 'CBE_BANK', 'CASH_DIRECT'], 
      required: true 
    },
    transactionReference: { type: String, required: true, trim: true },
    screenshotUrl: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['PENDING', 'APPROVED', 'REJECTED'], 
      default: 'PENDING' 
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.models.Payment || mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
