import { generateSeedCommitment } from './utils/cryptoDraw.js';
import { IDraw, IPrizeConfig, formatEntryNumber } from '../types/index.js';

// Seed initial draw commitment
const initialSeeds = generateSeedCommitment();

// Configurable Admin Default Draw
export const defaultDraw: IDraw = {
  _id: 'draw_round_001',
  id: 'draw_round_001',
  tenantId: 'tenant_addis',
  name: 'Round #001 — Addis Community Draw',
  title: 'Round #001 — Addis Community Draw',
  description: 'Admin-configured community draw with 100 entries and 3 prize positions',
  drawNumber: 1,
  capacity: 100, // Admin configured capacity (1-1000)
  pricePerNumber: 50, // Admin configured price (50 ETB)
  currency: 'ETB',
  status: 'OPEN',
  prizes: [
    { position: 1, label: '1st Winner (🥇 1ኛ አሸናፊ)', amount: 2500, currency: 'ETB' },
    { position: 2, label: '2nd Winner (🥈 2ኛ አሸናፊ)', amount: 1000, currency: 'ETB' },
    { position: 3, label: '3rd Winner (🥉 3ኛ አሸናፊ)', amount: 500, currency: 'ETB' },
  ],
  numberFrom: 1,
  numberTo: 100,
  maxSelectionsPerPlayer: 10,
  startAt: new Date(Date.now() - 3600000).toISOString(),
  closeAt: new Date(Date.now() + 86400000 * 2).toISOString(),
  serverSeedHash: initialSeeds.serverSeedHash,
  serverSeed: initialSeeds.serverSeed,
  createdBy: 'usr_admin_01',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Dynamic helper to construct numbers map for a given draw capacity
export function buildNumbersMapForCapacity(drawId: string, tenantId: string, capacity: number) {
  const map = new Map<number, any>();
  for (let i = 1; i <= capacity; i++) {
    let status: string = 'AVAILABLE';
    let selectedBy = undefined;

    if ([5, 12, 33, 42, 78].includes(i) && i <= capacity) {
      status = 'CONFIRMED';
      selectedBy = { id: 'usr_other', name: 'Verified Player' };
    } else if ([19, 54].includes(i) && i <= capacity) {
      status = 'PAYMENT_PENDING';
      selectedBy = { id: 'usr_demo', name: 'Pending Review' };
    }

    map.set(i, {
      _id: `num_${i}`,
      tenantId,
      drawId,
      number: i,
      formattedNumber: formatEntryNumber(i, capacity),
      status,
      selectedBy,
    });
  }
  return map;
}

// Shared memory map for current draw numbers board
export const defaultNumbersMap = buildNumbersMapForCapacity(
  defaultDraw._id,
  defaultDraw.tenantId,
  defaultDraw.capacity
);

// Shared memory store for player memberships
export const memoryPlayerMemberships: any[] = [
  {
    _id: 'mem_01',
    playerId: 'usr_player_01',
    tenantId: 'tenant_addis',
    status: 'ACTIVE',
    assignedBy: 'usr_admin_01',
    joinedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Shared memory store for winners
export const memoryWinners: any[] = [
  {
    _id: 'win_000',
    tenantId: 'tenant_addis',
    drawId: 'draw_round_000',
    drawTitle: 'Round #000 — Addis Launch Draw',
    drawNumber: 0,
    position: 1,
    label: '1st Winner',
    number: 42,
    formattedNumber: '042',
    playerId: 'usr_player_01',
    playerName: 'Sample Player',
    playerPhone: '091****890',
    prizeAmount: 2500,
    currency: 'ETB',
    status: 'PAID',
    drawnAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

// Shared memory store for audit logs
export const memoryAuditLogs: any[] = [
  {
    _id: 'audit_01',
    tenantId: 'tenant_addis',
    actorId: 'usr_admin_01',
    actorName: 'Platform Operator',
    action: 'CREATE_ROUND',
    entityType: 'DRAW',
    entityId: 'draw_round_001',
    metadata: {
      title: defaultDraw.title,
      capacity: defaultDraw.capacity,
      pricePerNumber: defaultDraw.pricePerNumber,
      serverSeedHash: defaultDraw.serverSeedHash,
    },
    createdAt: new Date().toISOString(),
  }
];
