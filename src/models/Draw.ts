import mongoose, { Schema, Document } from 'mongoose';
import { IDraw } from '../types/index.js';

export interface IDrawDocument extends Omit<IDraw, '_id'>, Document {}

const DrawSchema: Schema = new Schema(
  {
    drawNumber: { type: Number, required: true, unique: true },
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
    winnerNumber: { type: Number, default: null },
    resultPublishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const DrawModel = mongoose.models.Draw || mongoose.model<IDrawDocument>('Draw', DrawSchema);
