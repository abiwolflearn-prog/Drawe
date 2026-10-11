import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { paymentService, memoryPayments } from '../services/paymentService.js';

const router = Router();

// Re-export memoryPayments for backward compatibility with admin route
export { memoryPayments };

// POST /api/payments - Submit direct operator payment through shared service
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { drawId, numbers, method, transactionReference, screenshotUrl } = req.body;

    const playerId = req.user?.id;
    if (!playerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const tenantId = req.user?.tenantId || 'tenant_addis';

    const result = await paymentService.submitPayment({
      playerId,
      tenantId,
      drawId,
      numbers,
      method,
      transactionReference,
      screenshotUrl,
    });

    return res.status(201).json({
      message: 'Payment reference submitted successfully. Awaiting admin verification.',
      payment: result.payment,
      recalculatedTotal: result.amount,
      unitPrice: result.unitPrice,
    });
  } catch (error: any) {
    console.error('Submit payment error:', error);
    return res.status(400).json({ error: error.message || 'Failed to submit payment reference' });
  }
});

// GET /api/payments/my - View current user's submitted payments
router.get('/my', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const playerId = req.user?.id;
    if (!playerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPayments = await paymentService.getPlayerPayments(playerId, req.user?.tenantId);
    return res.json({ payments: userPayments });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve payments' });
  }
});

export default router;
