import mongoose, { Schema, Document } from 'mongoose';
import { ISelection } from '../types/index.js';

export interface ISelectionDocument extends Omit<ISelection, '_id'>, Document {}

const SelectionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    drawId: { type: Schema.Types.ObjectId, ref: 'Draw', required: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    numbers: [{ type: Number, required: true }],
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'], 
      default: 'PENDING' 
    },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

export const SelectionModel = mongoose.models.Selection || mongoose.model<ISelectionDocument>('Selection', SelectionSchema);
