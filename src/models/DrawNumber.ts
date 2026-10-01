import mongoose, { Schema, Document } from 'mongoose';
import { IDrawNumber } from '../types/index.js';

export interface IDrawNumberDocument extends Omit<IDrawNumber, '_id'>, Document {}

const DrawNumberSchema: Schema = new Schema(
  {
    drawId: { type: Schema.Types.ObjectId, ref: 'Draw', required: true },
    number: { type: Number, required: true, min: 1, max: 80 },
    status: { 
      type: String, 
      enum: ['AVAILABLE', 'SELECTED', 'RESERVED', 'PAYMENT_PENDING', 'CONFIRMED', 'WINNER', 'DISABLED'], 
      default: 'AVAILABLE' 
    },
    selectedBy: {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String }
    },
    reservationExpiresAt: { type: Date },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

// Unique constraint on drawId + number to prevent double assignment
DrawNumberSchema.index({ drawId: 1, number: 1 }, { unique: true });

export const DrawNumberModel = mongoose.models.DrawNumber || mongoose.model<IDrawNumberDocument>('DrawNumber', DrawNumberSchema);
