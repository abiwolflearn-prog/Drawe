import { Router, Request, Response } from 'express';
import { telegramService, TELEGRAM_CONFIG } from '../services/telegramService.js';
import { playerService } from '../services/playerService.js';
import { drawService } from '../services/drawService.js';

const router = Router();

// GET /api/telegram/config — Return Telegram Bot config for Mini App links
router.get('/config', async (req: Request, res: Response) => {
  const tenantId = (req.query.tenant as string) || 'tenant_addis';
  const activeDraw = await drawService.getActiveDraw(tenantId);

  return res.json({
    config: {
      botUsername: TELEGRAM_CONFIG.botUsername,
      botName: 'Drawe Bot (አደይ ዕጣ)',
      miniAppUrl: `${TELEGRAM_CONFIG.miniAppUrl}?tenant=${tenantId}`,
      apiUrl: TELEGRAM_CONFIG.apiUrl,
    },
    activeDraw: drawService.getPublicDrawDetails(activeDraw),
  });
});

// POST /api/telegram/auth — Authenticate Telegram Mini App user using verified initData
router.post('/auth', async (req: Request, res: Response) => {
  try {
    const { initData, user: rawUser, preferredTenantId } = req.body;

    let targetUser = rawUser;

    // Cryptographic validation of initData if provided
    if (initData) {
      const verification = telegramService.verifyInitData(initData);
      if (!verification.isValid) {
        return res.status(401).json({ error: 'Invalid, forged, or expired Telegram authentication payload' });
      }
      if (verification.user) {
        targetUser = verification.user;
      }
    } else {
      // In production, unverified rawUser claims are rejected
      if (process.env.NODE_ENV === 'production' || !targetUser) {
        return res.status(401).json({ error: 'Valid Telegram initData is required for authentication' });
      }
    }

    if (!targetUser || !targetUser.id) {
      return res.status(400).json({ error: 'Valid Telegram user payload or initData is required' });
    }

    // Map through shared PlayerService and issue authoritative JWT
    const authResult = await playerService.findOrCreateTelegramUser(targetUser, preferredTenantId);

    return res.json({
      message: 'Telegram Mini App authenticated successfully',
      user: authResult.user,
      token: authResult.token,
      activeTenantId: authResult.activeTenantId,
      memberships: authResult.memberships,
    });
  } catch (error: any) {
    console.error('[TelegramRoute] Auth error occurred');
    return res.status(500).json({ error: error.message || 'Telegram authentication failed' });
  }
});

// POST /api/telegram/webhook — Telegram Bot Webhook handler
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const secretHeader = req.headers['x-telegram-bot-api-secret-token'] as string;
    if (!telegramService.verifyWebhookSecret(secretHeader)) {
      return res.status(403).json({ error: 'Invalid or missing webhook secret token' });
    }

    const update = req.body;
    if (!update) {
      return res.status(200).send('OK');
    }

    const responseAction = await telegramService.handleUpdate(update);

    if (responseAction) {
      return res.json(responseAction);
    }

    return res.status(200).send('OK');
  } catch (error: any) {
    console.error('[TelegramRoute] Webhook processing error occurred');
    return res.status(200).send('OK'); // Always ACK Telegram to prevent webhook retry storms
  }
});

export default router;
