import { Router, Request, Response } from 'express';
import { generateSeedCommitment, verifyServerSeedCommitment, calculateWinningNumber } from '../utils/cryptoDraw.js';
import { defaultDraw, defaultNumbersMap } from '../store.js';
import { drawService } from '../services/drawService.js';
import { winnerService } from '../services/winnerService.js';
import { tenantService } from '../services/tenantService.js';

const router = Router();

// GET /api/draws — Retrieve active draws with optional tenant filtering
router.get('/', async (req: Request, res: Response) => {
  const tenantQuery = (req.query.tenant as string) || undefined;
  const drawQuery = (req.query.draw as string) || undefined;

  let tenantId = tenantQuery;
  if (tenantQuery) {
    const tenantObj = await tenantService.getTenantById(tenantQuery);
    if (tenantObj) {
      tenantId = tenantObj._id || tenantObj.id;
    }
  }

  if (drawQuery) {
    const specificDraw = await drawService.getDrawById(drawQuery, tenantId);
    if (specificDraw) {
      return res.json({ draws: [specificDraw] });
    }
  }

  const active = await drawService.getActiveDraw(tenantId);
  return res.json({ draws: active ? [active] : [defaultDraw] });
});

// GET /api/draws/results/history — Retrieve public past winners
router.get('/results/history', async (req: Request, res: Response) => {
  const tenantId = (req.query.tenant as string) || undefined;
  const winners = await winnerService.getPublicWinners(tenantId, 20);
  return res.json({ winners });
});

// GET /api/draws/:id/verify — Cryptographic Provably Fair Verification Endpoint
router.get('/:id/verify', async (req: Request, res: Response) => {
  const { id } = req.params;
  const draw = (await drawService.getDrawById(id)) || defaultDraw;

  const isCompleted = draw.status === 'COMPLETED';
  const revealedSeed = isCompleted ? draw.serverSeed : null;

  const verificationResult = isCompleted && revealedSeed
    ? {
        isMatch: verifyServerSeedCommitment(revealedSeed, draw.serverSeedHash),
        calculatedNumber: calculateWinningNumber(revealedSeed, draw._id || draw.id),
      }
    : null;

  return res.json({
    drawId: draw._id || draw.id,
    title: draw.title,
    status: draw.status,
    serverSeedHash: draw.serverSeedHash,
    revealedSeed,
    winningNumber: draw.winnerNumber,
    verification: verificationResult,
  });
});

// GET /api/draws/:id — Retrieve specific draw details
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const draw = await drawService.getDrawById(id);
  if (!draw) {
    return res.status(404).json({ error: 'Draw not found' });
  }
  return res.json({ draw });
});

// GET /api/draws/:id/numbers — Retrieve number board state for capacity (1..1000)
router.get('/:id/numbers', async (req: Request, res: Response) => {
  const { id } = req.params;
  const numbersArray = await drawService.getDrawNumbers(id);
  return res.json({ numbers: numbersArray });
});

export { defaultNumbersMap, defaultDraw };
export default router;
