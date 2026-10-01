/**
 * Core Type Definitions for 01–80 Number Draw Platform
 */

export type UserRole = 'PLAYER' | 'ADMIN' | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface IUser {
  _id: string;
  id?: string;
  name: string;
  phone?: string;
  email: string;
  telegramUserId?: string;
  role: UserRole;
  status: UserStatus;
  language?: 'am' | 'en';
  createdAt: string;
  updatedAt: string;
}

export type DrawStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'DRAWING' | 'COMPLETED' | 'CANCELLED';

export interface IDraw {
  _id: string;
  id?: string;
  drawNumber: number; // e.g. 1, 2, 3...
  title: string;
  status: DrawStatus;
  numberFrom: number; // 1
  numberTo: number;   // 80
  pricePerNumber: number; // e.g. 50 (ETB)
  maxSelectionsPerPlayer: number; // e.g. 10
  startAt: string;
  closeAt: string;
  winnerNumber?: number;
  resultPublishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type NumberState = 
  | 'AVAILABLE' 
  | 'SELECTED' 
  | 'RESERVED' 
  | 'PAYMENT_PENDING' 
  | 'CONFIRMED' 
  | 'WINNER' 
  | 'DISABLED';

export interface IDrawNumber {
  _id: string;
  drawId: string;
  number: number; // 1 to 80
  status: NumberState;
  selectedBy?: {
    id: string;
    name: string;
  };
  reservationExpiresAt?: string;
  confirmedAt?: string;
}

export type SelectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface ISelection {
  _id: string;
  drawId: string;
  playerId: string;
  numbers: number[];
  totalAmount: number;
  status: SelectionStatus;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'TELEBIRR' | 'CBE_BIRR' | 'BOA' | 'CBE_BANK' | 'CASH_DIRECT';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IPayment {
  _id: string;
  id?: string;
  playerId: string;
  playerName?: string;
  playerPhone?: string;
  drawId: string;
  drawTitle?: string;
  selectionId: string;
  numbers: number[];
  amount: number;
  method: PaymentMethod;
  transactionReference: string;
  screenshotUrl?: string;
  status: PaymentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWinner {
  _id: string;
  drawId: string;
  drawTitle: string;
  drawNumber: number;
  number: number;
  playerId: string;
  playerName: string;
  playerPhone?: string;
  prizeAmount: number;
  status: 'CLAIMED' | 'UNCLAIMED' | 'PAID';
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: 'DRAW' | 'PAYMENT' | 'USER' | 'SYSTEM';
  entityId: string;
  metadata?: Record<string, any>;
  ip?: string;
  createdAt: string;
}

export interface OperatorAccountInfo {
  method: PaymentMethod;
  providerName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
}
