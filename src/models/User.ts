import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/index.js';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    passwordHash: { type: String, required: true },
    telegramUserId: { type: String, default: '' },
    role: { type: String, enum: ['PLAYER', 'ADMIN', 'SUPER_ADMIN'], default: 'PLAYER' },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    language: { type: String, enum: ['am', 'en'], default: 'am' },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
