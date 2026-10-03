import mongoose, { Schema, Document } from 'mongoose';

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'HIDDEN';

export interface ITenant {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  ownerAdminId: string;
  ownerName?: string;
  ownerEmail?: string;
  status: TenantStatus;
  
  // Public Profile & Discovery Fields
  logo?: string;
  description?: string;
  location?: string;
  telegramUsername?: string;
  telegramCommunityUrl?: string;
  telegramChannelUrl?: string;
  telegramBotUsername?: string;
  telegramMemberCount?: number;
  
  isVerified?: boolean;
  isPublic?: boolean;
  isFeatured?: boolean;
  
  // Real Measured Metrics
  completedRounds?: number;
  activeRounds?: number;
  totalParticipants?: number;
  performanceScore?: number; // e.g. 92 (%)
  
  settings?: {
    defaultPricePerNumber?: number;
    currency?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ITenantDocument extends Omit<ITenant, '_id'>, Document {}

const TenantSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerAdminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'HIDDEN'], default: 'ACTIVE' },
    
    // Discovery fields
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    location: { type: String, default: 'Addis Ababa, Ethiopia' },
    telegramUsername: { type: String, default: '' },
    telegramCommunityUrl: { type: String, default: '' },
    telegramChannelUrl: { type: String, default: '' },
    telegramBotUsername: { type: String, default: '' },
    telegramMemberCount: { type: Number, default: 0 },
    
    isVerified: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    
    completedRounds: { type: Number, default: 0 },
    activeRounds: { type: Number, default: 1 },
    totalParticipants: { type: Number, default: 0 },
    performanceScore: { type: Number, default: 85 },
    
    settings: {
      defaultPricePerNumber: { type: Number, default: 50 },
      currency: { type: String, default: 'ETB' },
    },
  },
  { timestamps: true }
);

export const TenantModel = mongoose.models.Tenant || mongoose.model<ITenantDocument>('Tenant', TenantSchema);
