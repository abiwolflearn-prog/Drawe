import { Router, Request, Response } from 'express';
import { isFallbackStore } from '../../db/connect.js';

const router = Router();

// In-memory initial draw state for sandbox/fallback
const defaultDraw = {
  _id: 'draw_round_001',
  id: 'draw_round_001',
  drawNumber: 1,
  title: 'Round #001 — Standard 01–80 Draw',
  status: 'OPEN',
  numberFrom: 1,
  numberTo: 80,
  pricePerNumber: 50, // 50 ETB per number
  maxSelectionsPerPlayer: 10,
  startAt: new Date(Date.now() - 3600000).toISOString(),
  closeAt: new Date(Date.now() + 86400000 * 2).toISOString(), // Closes in 2 days
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Initial numbers state for Round #001
const defaultNumbersMap = new Map<number, any>();
for (let i = 1; i <= 80; i++) {
  // Demo taken numbers to demonstrate visual states
  let status: string = 'AVAILABLE';
  let selectedBy = undefined;

  if ([5, 12, 33, 42, 78].includes(i)) {
    status = 'CONFIRMED';
    selectedBy = { id: 'usr_other', name: 'Verified Player' };
  } else if ([19, 54].includes(i)) {
    status = 'PAYMENT_PENDING';
    selectedBy = { id: 'usr_demo', name: 'Pending Review' };
  }

  defaultNumbersMap.set(i, {
    _id: `num_${i}`,
    drawId: 'draw_round_001',
    number: i,
    status,
    selectedBy,
  });
}

// GET /api/draws
router.get('/', (req: Request, res: Response) => {
  return res.json({ draws: [defaultDraw] });
});

// GET /api/draws/:id
router.get('/:id', (req: Request, res: Response) => {
  return res.json({ draw: defaultDraw });
});

// GET /api/draws/:id/numbers
router.get('/:id/numbers', (req: Request, res: Response) => {
  const numbersArray = Array.from(defaultNumbersMap.values());
  return res.json({ numbers: numbersArray });
});

export { defaultNumbersMap, defaultDraw };
export default router;
