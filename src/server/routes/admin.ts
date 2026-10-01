import { Router, Response } from 'express';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';
import { memoryPayments } from './payments.js';
import { defaultNumbersMap, defaultDraw } from './draws.js';

const router = Router();

// Memory store for audit logs
const memoryAuditLogs: any[] = [
  {
    _id: 'audit_01',
    actorId: 'usr_admin_01',
    actorName: 'Platform Operator',
    action: 'CREATE_ROUND',
    entityType: 'DRAW',
    entityId: 'draw_round_001',
    metadata: { title: defaultDraw.title },
    createdAt: new Date().toISOString(),
  }
];

// GET /api/admin/dashboard
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

  return res.json({
    metrics: {
      activeRoundsCount: defaultDraw.status === 'OPEN' ? 1 : 0,
      pendingPaymentsCount: pendingPayments.length,
      confirmedSelectionsCount: confirmedNumbersCount,
      pendingSelectionsCount: pendingNumbersCount,
      totalCollectedAmount: totalCollected,
      availableNumbersCount: 80 - confirmedNumbersCount - pendingNumbersCount,
    },
    activeDraw: defaultDraw,
  });
});

// GET /api/admin/payments?status=pending
router.get('/payments', requireAdmin, (req: AuthRequest, res: Response) => {
  const { status } = req.query;
  let filtered = memoryPayments;
  if (status) {
    filtered = memoryPayments.filter(p => p.status === (status as string).toUpperCase());
  }
  return res.json({ payments: filtered });
});

// POST /api/admin/payments/:id/approve
router.post('/payments/:id/approve', requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const payment = memoryPayments.find(p => p._id === id || p.id === id);

  if (!payment) {
    return res.status(404).json({ error: 'Payment record not found' });
  }

  payment.status = 'APPROVED';
  payment.verifiedBy = req.user?.id;
  payment.verifiedAt = new Date().toISOString();

  // Mark numbers as CONFIRMED
  for (const num of payment.numbers) {
    const cell = defaultNumbersMap.get(num);
    if (cell) {
      cell.status = 'CONFIRMED';
      cell.confirmedAt = new Date().toISOString();
    }
  }

  // Create Audit Log
  memoryAuditLogs.unshift({
    _id: 'audit_' + Date.now(),
    actorId: req.user?.id || 'admin',
    actorName: req.user?.name || 'Admin',
    action: 'APPROVE_PAYMENT',
    entityType: 'PAYMENT',
    entityId: payment._id,
    metadata: {
      numbers: payment.numbers,
      amount: payment.amount,
      ref: payment.transactionReference,
    },
    createdAt: new Date().toISOString(),
  });

  return res.json({ message: 'Payment approved successfully. Numbers confirmed.', payment });
});

// POST /api/admin/payments/:id/reject
router.post('/payments/:id/reject', requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const payment = memoryPayments.find(p => p._id === id || p.id === id);

  if (!payment) {
    return res.status(404).json({ error: 'Payment record not found' });
  }

  payment.status = 'REJECTED';
  payment.rejectionReason = reason || 'Reference verification failed';
  payment.verifiedBy = req.user?.id;
  payment.verifiedAt = new Date().toISOString();

  // Release numbers back to AVAILABLE
  for (const num of payment.numbers) {
    const cell = defaultNumbersMap.get(num);
    if (cell && cell.status === 'PAYMENT_PENDING') {
      cell.status = 'AVAILABLE';
      cell.selectedBy = undefined;
    }
  }

  // Create Audit Log
  memoryAuditLogs.unshift({
    _id: 'audit_' + Date.now(),
    actorId: req.user?.id || 'admin',
    actorName: req.user?.name || 'Admin',
    action: 'REJECT_PAYMENT',
    entityType: 'PAYMENT',
    entityId: payment._id,
    metadata: {
      numbers: payment.numbers,
      reason: payment.rejectionReason,
    },
    createdAt: new Date().toISOString(),
  });

  return res.json({ message: 'Payment rejected. Numbers released back to Available.', payment });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ auditLogs: memoryAuditLogs });
});

export default router;
