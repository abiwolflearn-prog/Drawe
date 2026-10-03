import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { defaultNumbersMap, defaultDraw } from '../store.js';
import { broadcastNumberUpdate } from '../socket.js';

const router = Router();

// Memory store for payments
export const memoryPayments: any[] = [
  {
    _id: 'pay_1001',
    id: 'pay_1001',
    playerId: 'usr_player_01',
    playerName: 'Sample Player',
    playerPhone: '+251911002233',
    tenantId: 'tenant_addis',
    drawId: 'draw_round_001',
    drawTitle: 'Round #001 — Addis Community Draw',
    selectionId: 'sel_1001',
    numbers: [19, 54],
    unitPrice: 50, // Price snapshot
    amount: 100, // 2 * 50
    method: 'TELEBIRR',
    transactionReference: 'TXN-984720192',
    screenshotUrl: '',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  }
];

// POST /api/payments - Submit direct operator payment
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { drawId, numbers, method, transactionReference, screenshotUrl } = req.body;

    if (!drawId || !numbers || !Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({ error: 'Valid numbers array is required' });
    }

    if (!transactionReference || transactionReference.trim().length < 4) {
      return res.status(400).json({ error: 'Valid transaction reference number is required' });
    }

    // Server-Side Authoritative Price Recalculation
    const unitPrice = defaultDraw.pricePerNumber || 50;
    const recalculatedTotal = numbers.length * unitPrice; // Never trust total sent from client!

    // Check if any requested number is already taken
    for (const num of numbers) {
      const existing = defaultNumbersMap.get(num);
      if (existing && (existing.status === 'CONFIRMED' || existing.status === 'WINNER')) {
        return res.status(400).json({ error: `Number ${num} is already taken by another player` });
      }
    }

    const newPayment = {
      _id: 'pay_' + Date.now(),
      id: 'pay_' + Date.now(),
      playerId: req.user?.id || 'usr_player_01',
      playerName: req.user?.name || 'Player',
      playerPhone: '+251900000000',
      tenantId: defaultDraw.tenantId || 'tenant_addis',
      drawId: defaultDraw._id,
      drawTitle: defaultDraw.title,
      selectionId: 'sel_' + Date.now(),
      numbers,
      unitPrice, // Price snapshot at time of selection
      amount: recalculatedTotal, // Server recalculated total
      method: method || 'TELEBIRR',
      transactionReference: transactionReference.trim(),
      screenshotUrl: screenshotUrl || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mark numbers as PAYMENT_PENDING
    for (const num of numbers) {
      const cell = defaultNumbersMap.get(num);
      if (cell) {
        cell.status = 'PAYMENT_PENDING';
        cell.selectedBy = { id: req.user?.id, name: req.user?.name };
        broadcastNumberUpdate(defaultDraw._id, num, 'PAYMENT_PENDING', cell.selectedBy);
      }
    }

    memoryPayments.unshift(newPayment);

    return res.status(201).json({
      message: 'Payment reference submitted successfully. Awaiting admin verification.',
      payment: newPayment,
    });
  } catch (error: any) {
    console.error('Submit payment error:', error);
    return res.status(500).json({ error: 'Failed to submit payment reference' });
  }
});

// GET /api/payments/my - View current user's submitted payments
router.get('/my', requireAuth, (req: AuthRequest, res: Response) => {
  const userPayments = memoryPayments.filter(p => p.playerId === req.user?.id);
  return res.json({ payments: userPayments });
});

export default router;
