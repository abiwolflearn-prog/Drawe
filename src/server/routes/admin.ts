import { Router, Response } from 'express';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';
import { paymentService, memoryPayments } from '../services/paymentService.js';
import { generateSeedCommitment, selectMultipleWinners } from '../utils/cryptoDraw.js';
import { defaultDraw, defaultNumbersMap, buildNumbersMapForCapacity, memoryWinners, memoryAuditLogs } from '../store.js';
import { broadcastNumberUpdate, broadcastDrawStateChange } from '../socket.js';
import { IPrizeConfig, formatEntryNumber } from '../../types/index.js';

const router = Router();

// GET /api/admin/dashboard — Real database metrics
router.get('/dashboard', requireAdmin, (req: AuthRequest, res: Response) => {
  const pendingPayments = memoryPayments.filter(p => p.status === 'PENDING');
  const approvedPayments = memoryPayments.filter(p => p.status === 'APPROVED');
  
  const totalCollected = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Count taken numbers
  let confirmedNumbersCount = 0;
  let pendingNumbersCount = 0;
  for (const cell of defaultNumbersMap.values()) {
    if (cell.status === 'CONFIRMED') confirmedNumbersCount++;
    if (cell.status === 'PAYMENT_PENDING') pendingNumbersCount++;
  }

  const capacity = defaultDraw.capacity || 100;

  return res.json({
    metrics: {
      activeRoundsCount: defaultDraw.status === 'OPEN' ? 1 : 0,
      totalEntries: capacity,
      confirmedEntries: confirmedNumbersCount,
      pendingPaymentsCount: pendingPayments.length,
      availableEntries: capacity - confirmedNumbersCount - pendingNumbersCount,
      totalCollectedAmount: totalCollected,
    },
    activeDraw: defaultDraw,
  });
});

// POST /api/admin/draws — Create New Admin Draw
router.post('/draws', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, description, capacity, pricePerNumber, prizes, currency, maxSelectionsPerPlayer } = req.body;

    // Server-Side Validation Rules
    const parsedCapacity = Number(capacity);
    if (isNaN(parsedCapacity) || parsedCapacity < 1 || parsedCapacity > 1000) {
      return res.status(400).json({ error: 'Draw capacity must be an integer between 1 and 1000' });
    }

    const parsedPrice = Number(pricePerNumber);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Price per number must be greater than 0 ETB' });
    }

    if (!prizes || !Array.isArray(prizes) || prizes.length === 0) {
      return res.status(400).json({ error: 'At least one winner prize configuration is required' });
    }

    // Validate prize configurations
    for (const prize of prizes) {
      if (typeof prize.amount !== 'number' || prize.amount < 0) {
        return res.status(400).json({ error: `Invalid prize amount for position ${prize.position}` });
      }
    }

    const seeds = generateSeedCommitment();

    // Mutate default active draw in memory
    defaultDraw._id = 'draw_' + Date.now();
    defaultDraw.id = defaultDraw._id;
    defaultDraw.tenantId = req.user?.tenantId || 'tenant_addis';
    defaultDraw.name = name || `Round #${Date.now().toString().slice(-3)} Draw`;
    defaultDraw.title = defaultDraw.name;
    defaultDraw.description = description || '';
    defaultDraw.capacity = parsedCapacity;
    defaultDraw.pricePerNumber = parsedPrice;
    defaultDraw.currency = currency || 'ETB';
    defaultDraw.status = 'OPEN';
    defaultDraw.prizes = prizes;
    defaultDraw.numberFrom = 1;
    defaultDraw.numberTo = parsedCapacity;
    defaultDraw.maxSelectionsPerPlayer = maxSelectionsPerPlayer || 10;
    defaultDraw.serverSeedHash = seeds.serverSeedHash;
    defaultDraw.serverSeed = seeds.serverSeed;
    defaultDraw.winnerNumber = null;
    defaultDraw.winnerNumbers = undefined;
    defaultDraw.createdBy = req.user?.id || 'admin';
    defaultDraw.createdAt = new Date().toISOString();
    defaultDraw.updatedAt = new Date().toISOString();

    // Rebuild dynamic numbers map for new capacity
    const freshMap = buildNumbersMapForCapacity(defaultDraw._id, defaultDraw.tenantId, parsedCapacity);
    defaultNumbersMap.clear();
    for (const [key, val] of freshMap.entries()) {
      defaultNumbersMap.set(key, val);
    }

    broadcastDrawStateChange(defaultDraw._id, 'OPEN');

    memoryAuditLogs.unshift({
      _id: 'audit_' + Date.now(),
      tenantId: defaultDraw.tenantId,
      actorId: req.user?.id || 'admin',
      actorName: req.user?.name || 'Admin',
      action: 'CREATE_DRAW',
      entityType: 'DRAW',
      entityId: defaultDraw._id,
      metadata: {
        name: defaultDraw.name,
        capacity: parsedCapacity,
        pricePerNumber: parsedPrice,
        prizesCount: prizes.length,
        serverSeedHash: seeds.serverSeedHash,
      },
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      message: `Draw created successfully with ${parsedCapacity} entries at ${parsedPrice} ETB per entry.`,
      draw: defaultDraw,
    });
  } catch (err: any) {
    console.error('Create draw error:', err);
    return res.status(500).json({ error: 'Failed to create draw' });
  }
});

// POST /api/admin/draws/:id/open
router.post('/draws/:id/open', requireAdmin, (req: AuthRequest, res: Response) => {
  defaultDraw.status = 'OPEN';
  broadcastDrawStateChange(defaultDraw._id, 'OPEN');

  memoryAuditLogs.unshift({
    _id: 'audit_' + Date.now(),
    tenantId: req.user?.tenantId || 'tenant_addis',
    actorId: req.user?.id || 'admin',
    actorName: req.user?.name || 'Admin',
    action: 'OPEN_DRAW',
    entityType: 'DRAW',
    entityId: defaultDraw._id,
    metadata: { title: defaultDraw.title },
    createdAt: new Date().toISOString(),
  });

  return res.json({ message: 'Draw round opened for selections', draw: defaultDraw });
});

// POST /api/admin/draws/:id/close — Lock draw state
router.post('/draws/:id/close', requireAdmin, (req: AuthRequest, res: Response) => {
  defaultDraw.status = 'CLOSED';
  broadcastDrawStateChange(defaultDraw._id, 'CLOSED');

  memoryAuditLogs.unshift({
    _id: 'audit_' + Date.now(),
    tenantId: req.user?.tenantId || 'tenant_addis',
    actorId: req.user?.id || 'admin',
    actorName: req.user?.name || 'Admin',
    action: 'CLOSE_DRAW',
    entityType: 'DRAW',
    entityId: defaultDraw._id,
    metadata: { title: defaultDraw.title },
    createdAt: new Date().toISOString(),
  });

  return res.json({ message: 'Draw round closed/locked for selections', draw: defaultDraw });
});

// POST /api/admin/draws/:id/execute — Execute Cryptographic Draw for all Configured Winner Positions
router.post('/draws/:id/execute', requireAdmin, (req: AuthRequest, res: Response) => {
  if (defaultDraw.status === 'COMPLETED') {
    return res.status(400).json({ error: 'Draw round is already completed' });
  }

  defaultDraw.status = 'DRAWING';

  // Find all confirmed entry numbers
  const confirmedEntries: number[] = [];
  for (const [num, cell] of defaultNumbersMap.entries()) {
    if (cell.status === 'CONFIRMED') {
      confirmedEntries.push(num);
    }
  }

  const prizes = defaultDraw.prizes && defaultDraw.prizes.length > 0
    ? defaultDraw.prizes
    : [{ position: 1, label: '1st Winner', amount: 2500, currency: 'ETB' }];

  // Select winning numbers using server seed
  const winningNumbers = selectMultipleWinners(
    defaultDraw.serverSeed,
    defaultDraw._id,
    defaultDraw.capacity,
    prizes.length,
    confirmedEntries
  );

  const winnerResults: any[] = [];
  const winnerSummary: { position: number; number: number; prizeAmount: number }[] = [];

  prizes.forEach((prizeConfig, idx) => {
    const winningNum = winningNumbers[idx] || (idx + 1);
    const cell = defaultNumbersMap.get(winningNum);

    if (cell) {
      cell.status = 'WINNER';
      broadcastNumberUpdate(defaultDraw._id, winningNum, 'WINNER', cell.selectedBy);
    }

    const winnerPlayer = cell?.selectedBy || { id: 'usr_player_01', name: 'Confirmed Winner' };

    const formattedNum = formatEntryNumber(winningNum, defaultDraw.capacity);

    const newWinnerRecord = {
      _id: `win_${Date.now()}_pos_${prizeConfig.position}`,
      tenantId: req.user?.tenantId || 'tenant_addis',
      drawId: defaultDraw._id,
      drawTitle: defaultDraw.title,
      drawNumber: defaultDraw.drawNumber,
      position: prizeConfig.position,
      label: prizeConfig.label || `${prizeConfig.position}st Winner`,
      number: winningNum,
      formattedNumber: formattedNum,
      playerId: winnerPlayer.id,
      playerName: winnerPlayer.name,
      playerPhone: '091****890',
      prizeAmount: prizeConfig.amount,
      currency: prizeConfig.currency || 'ETB',
      status: 'CLAIMED',
      drawnAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    memoryWinners.unshift(newWinnerRecord);
    winnerResults.push(newWinnerRecord);
    winnerSummary.push({
      position: prizeConfig.position,
      number: winningNum,
      prizeAmount: prizeConfig.amount,
    });
  });

  defaultDraw.status = 'COMPLETED';
  defaultDraw.winnerNumber = winningNumbers[0];
  defaultDraw.winnerNumbers = winnerSummary;
  defaultDraw.drawAt = new Date().toISOString();

  broadcastDrawStateChange(defaultDraw._id, 'COMPLETED', winningNumbers[0]);

  memoryAuditLogs.unshift({
    _id: 'audit_' + Date.now(),
    tenantId: req.user?.tenantId || 'tenant_addis',
    actorId: req.user?.id || 'admin',
    actorName: req.user?.name || 'Admin',
    action: 'DRAW_EXECUTED',
    entityType: 'DRAW',
    entityId: defaultDraw._id,
    metadata: {
      winningNumbers: winnerSummary,
      serverSeedHash: defaultDraw.serverSeedHash,
      revealedSeed: defaultDraw.serverSeed,
      prizesCount: prizes.length,
    },
    createdAt: new Date().toISOString(),
  });

  return res.json({
    message: `Cryptographic Draw executed successfully! Generated ${winnerResults.length} winner positions.`,
    winners: winnerResults,
    revealedSeed: defaultDraw.serverSeed,
    serverSeedHash: defaultDraw.serverSeedHash,
    draw: defaultDraw,
  });
});

// GET /api/admin/payments
router.get('/payments', requireAdmin, (req: AuthRequest, res: Response) => {
  const { status } = req.query;
  let filtered = memoryPayments;
  if (status) {
    filtered = memoryPayments.filter(p => p.status === (status as string).toUpperCase());
  }
  return res.json({ payments: filtered });
});

// POST /api/admin/payments/:id/approve
router.post('/payments/:id/approve', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.approvePayment(id, req.user);
    return res.json({ message: 'Payment approved successfully. Numbers confirmed.', payment });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to approve payment' });
  }
});

// POST /api/admin/payments/:id/reject
router.post('/payments/:id/reject', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const payment = await paymentService.rejectPayment(id, reason, req.user);
    return res.json({ message: 'Payment rejected. Numbers released back to Available.', payment });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to reject payment' });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ auditLogs: memoryAuditLogs });
});

export default router;
