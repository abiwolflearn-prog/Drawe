import mongoose, { Schema, Document } from 'mongoose';
import { IDraw } from '../types/index.js';

export interface IDrawDocument extends Omit<IDraw, '_id'>, Document {}

const DrawSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    drawNumber: { type: Number, required: true },
    title: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['DRAFT', 'OPEN', 'CLOSED', 'DRAWING', 'COMPLETED', 'CANCELLED'], 
      default: 'DRAFT' 
    },
    numberFrom: { type: Number, default: 1 },
    numberTo: { type: Number, default: 80 },
    pricePerNumber: { type: Number, required: true, default: 50 },
    maxSelectionsPerPlayer: { type: Number, default: 10 },
    startAt: { type: Date, required: true },
    closeAt: { type: Date, required: true },
    serverSeedHash: { type: String, default: '' },
    serverSeed: { type: String, default: '' },
    winnerNumber: { type: Number, default: null },
    winnerPlayerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    winnerPlayerName: { type: String, default: '' },
    prizeAmount: { type: Number, default: 0 },
    drawExecutedAt: { type: Date, default: null },
    resultPublishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const DrawModel = mongoose.models.Draw || mongoose.model<IDrawDocument>('Draw', DrawSchema);
