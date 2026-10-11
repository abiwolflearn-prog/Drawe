export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'PLAYER';

export type NumberState = 'AVAILABLE' | 'RESERVED' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'WINNER' | 'SELECTED' | 'DISABLED';

export type PaymentMethod = 'TELEBIRR' | 'CBE_BIRR' | 'BANK_TRANSFER' | 'CHAPA' | 'CASH' | 'CBE_BANK';

export interface IUser {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone: string;
  role: Role;
  tenantId?: string; // Optional context for Admin/Player
  telegramUsername?: string;
  createdAt: string;
}

export interface IPlayerMembership {
  _id: string;
  playerId: string;
  tenantId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  assignedBy?: string;
  joinedAt: string;
  updatedAt: string;
}

export interface IPrizeConfig {
  position: number;
  label: string;
  amount: number;
  currency: string;
}

export interface IDraw {
  _id: string;
  id?: string;
  tenantId: string;
  name: string;
  title: string; // Display title
  description?: string;
  drawNumber: number;
  capacity: number; // Configurable by Admin: 1 to 1000
  pricePerNumber: number; // Configured by Admin (ETB)
  currency: string; // Default 'ETB'
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'DRAWING' | 'COMPLETED';
  prizes: IPrizeConfig[];
  numberFrom: number;
  numberTo: number;
  maxSelectionsPerPlayer: number;
  startAt: string;
  closeAt: string;
  drawAt?: string;
  serverSeedHash: string;
  serverSeed: string;
  winnerNumber?: number | null;
  winnerNumbers?: { position: number; number: number; prizeAmount: number }[];
  winnerPlayerId?: string;
  winnerPlayerName?: string;
  prizeAmount?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDrawNumber {
  _id: string;
  tenantId: string;
  drawId: string;
  number: number;
  status: NumberState;
  selectedBy?: {
    id: string;
    name: string;
  };
  confirmedAt?: string;
  reservedAt?: string;
}

export interface IPayment {
  _id: string;
  id?: string;
  playerId: string;
  playerName: string;
  playerPhone: string;
  tenantId: string;
  drawId: string;
  drawTitle: string;
  selectionId: string;
  numbers: number[];
  unitPrice: number; // Price snapshot at selection time
  amount: number; // Quantity * unitPrice recalculated server-side
  method: PaymentMethod;
  transactionReference: string;
  screenshotUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISelection {
  _id: string;
  tenantId: string;
  drawId: string;
  playerId: string;
  numbers: number[];
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'RESERVED' | 'CONFIRMED' | 'EXPIRED';
  createdAt: string;
}

export interface OperatorAccountInfo {
  providerName?: string;
  method?: PaymentMethod;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
}

export interface IWinner {
  _id?: string;
  id?: string;
  tenantId: string;
  drawId: string;
  drawTitle: string;
  drawNumber: number;
  position: number; // 1st, 2nd, 3rd Winner
  label: string;
  number: number;
  formattedNumber: string;
  playerId: string;
  playerName: string;
  playerPhone: string;
  prizeAmount: number;
  currency: string;
  status: 'CLAIMED' | 'UNCLAIMED' | 'PAID';
  drawnAt: string;
  createdAt: string;
}

export interface ITenant {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  logo?: string;
  description?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  location?: string;
  completedRounds?: number;
  telegramMemberCount?: number;
  performanceScore?: number;
  totalParticipants?: number;
  telegramCommunityUrl?: string;
  branding: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    telegramChannel?: string;
    paymentInstructions: string;
  };
  metrics: {
    totalDraws: number;
    activeDraws: number;
    totalPlayers: number;
    totalRevenue: number;
  };
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  id?: string;
  tenantId?: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export function formatEntryNumber(num: number, capacity: number): string {
  if (capacity <= 1) {
    return `${num}`;
  }
  if (capacity <= 99) {
    return num < 10 ? `0${num}` : `${num}`;
  }
  if (capacity <= 999) {
    if (num < 10) return `00${num}`;
    if (num < 100) return `0${num}`;
    return `${num}`;
  }
  if (num < 10) return `000${num}`;
  if (num < 100) return `00${num}`;
  if (num < 1000) return `0${num}`;
  return `${num}`;
}
