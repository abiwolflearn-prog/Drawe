import mongoose, { Schema, Document } from 'mongoose';
import { IPlayerMembership } from '../types/index.js';

export interface IPlayerMembershipDocument extends Omit<IPlayerMembership, '_id'>, Document {}

const PlayerMembershipSchema: Schema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PlayerMembershipSchema.index({ playerId: 1, tenantId: 1 }, { unique: true });

export const PlayerMembershipModel =
  mongoose.models.PlayerMembership ||
  mongoose.model<IPlayerMembershipDocument>('PlayerMembership', PlayerMembershipSchema);
