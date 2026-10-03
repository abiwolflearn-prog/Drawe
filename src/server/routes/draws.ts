import { Router, Request, Response } from 'express';
import { generateSeedCommitment, verifyServerSeedCommitment, calculateWinningNumber } from '../utils/cryptoDraw.js';
import { defaultDraw, defaultNumbersMap, memoryWinners } from '../store.js';

const router = Router();

// GET /api/draws
router.get('/', (req: Request, res: Response) => {
  return res.json({ draws: [defaultDraw] });
});

// GET /api/draws/results/history
router.get('/results/history', (req: Request, res: Response) => {
  return res.json({ winners: memoryWinners });
});

// GET /api/draws/:id/verify — Cryptographic Provably Fair Verification Endpoint
router.get('/:id/verify', (req: Request, res: Response) => {
  const isCompleted = defaultDraw.status === 'COMPLETED';
  const revealedSeed = isCompleted ? defaultDraw.serverSeed : null;

  const verificationResult = isCompleted && revealedSeed
    ? {
        isMatch: verifyServerSeedCommitment(revealedSeed, defaultDraw.serverSeedHash),
        calculatedNumber: calculateWinningNumber(revealedSeed, defaultDraw._id),
      }
    : null;

  return res.json({
    drawId: defaultDraw._id,
    title: defaultDraw.title,
    status: defaultDraw.status,
    serverSeedHash: defaultDraw.serverSeedHash,
    revealedSeed,
    winningNumber: defaultDraw.winnerNumber,
    verification: verificationResult,
  });
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
