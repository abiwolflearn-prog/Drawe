import mongoose, { Schema, Document } from 'mongoose';
import { IAuditLog } from '../types/index.js';

export interface IAuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}

const AuditLogSchema: Schema = new Schema(
  {
    actorId: { type: String, required: true },
    actorName: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ['DRAW', 'PAYMENT', 'USER', 'SYSTEM'], required: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String, default: '' },
  },
  { timestamps: true }
);

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
