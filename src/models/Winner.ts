import mongoose, { Schema, Document } from 'mongoose';
import { IWinner } from '../types/index.js';

export interface IWinnerDocument extends Omit<IWinner, '_id'>, Document {}

const WinnerSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    drawId: { type: Schema.Types.ObjectId, ref: 'Draw', required: true },
    drawTitle: { type: String, required: true },
    drawNumber: { type: Number, required: true },
    number: { type: Number, required: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    playerName: { type: String, required: true },
    playerPhone: { type: String },
    prizeAmount: { type: Number, required: true },
    status: { type: String, enum: ['CLAIMED', 'UNCLAIMED', 'PAID'], default: 'UNCLAIMED' },
  },
  { timestamps: true }
);

export const WinnerModel = mongoose.models.Winner || mongoose.model<IWinnerDocument>('Winner', WinnerSchema);
