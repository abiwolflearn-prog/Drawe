import { Router, Request, Response } from 'express';
import { defaultDraw, defaultNumbersMap, memoryWinners } from '../store.js';

const router = Router();

export const BOT_CONFIG = {
  botUsername: 'AdeyDrawBot',
  botName: 'አደይ ዕጣ ቦት',
  miniAppUrl: 'https://ais-dev-i3ft6howwcgixhergnn24k-529287111346.europe-west1.run.app',
};

// GET /api/telegram/config — Return Telegram Bot config for Mini App links
router.get('/config', (req: Request, res: Response) => {
  return res.json({
    config: BOT_CONFIG,
    activeDraw: defaultDraw,
  });
});

// POST /api/telegram/auth — Auto-authenticate Telegram Mini App user
router.post('/auth', (req: Request, res: Response) => {
  const { user } = req.body;

  if (!user || !user.id) {
    return res.status(400).json({ error: 'Invalid Telegram user payload' });
  }

  // Generate session payload for Telegram user
  const tgUser = {
    id: `tg_${user.id}`,
    name: `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`,
    phone: 'Telegram User',
    role: 'PLAYER',
    tenantId: 'tenant_addis',
    telegramUsername: user.username ? `@${user.username}` : undefined,
  };

  return res.json({
    message: 'Telegram Mini App authenticated successfully',
    user: tgUser,
    token: `tg_token_${user.id}_${Date.now()}`,
  });
});

// POST /api/telegram/webhook — Telegram Bot Webhook handler
router.post('/webhook', (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || !message.text) {
    return res.status(200).send('OK');
  }

  const chatId = message.chat.id;
  const text = message.text.trim();

  let replyText = '';
  let inlineKeyboard: any = null;

  if (text.startsWith('/start')) {
    replyText = `ሰላም ${message.from?.first_name || 'ወዳጅ'}! 👋\nእንኳን ወደ አደይ ዕጣ ፕላትፎርም በሰላም መጡ።\n\n🎯 **የአሁኑ ዕጣ:** ${defaultDraw.title}\n💰 **የአንዱ ቁጥር ዋጋ:** ${defaultDraw.pricePerNumber} ETB\n\nከታች ያለውን አዝራር በመጫን የዕጣ ሰሌዳውን በመክፈት ቁጥሮችዎን ይምረጡ!`;
    
    inlineKeyboard = [
      [{ text: '🎯 የዕጣ ሰሌዳ ክፈት (Mini App)', web_app: { url: BOT_CONFIG.miniAppUrl } }],
      [
        { text: '📊 የዕጣ ውጤቶች', callback_data: 'cmd_results' },
        { text: '🏢 የተረጋገጡ አዘጋጆች', callback_data: 'cmd_operators' },
      ],
    ];
  } else if (text.startsWith('/board')) {
    replyText = `🎯 **${defaultDraw.title}**\n\nየዕጣ ሰሌዳውን በ Mini App ለመክፈት ከታች ያለውን አዝራር ይጫኑ:`;
    inlineKeyboard = [
      [{ text: '🎲 ቁጥር ለመምረጥ ቦርድ ክፈት', web_app: { url: BOT_CONFIG.miniAppUrl } }],
    ];
  } else if (text.startsWith('/results')) {
    const latest = memoryWinners[0];
    replyText = `🏆 **የቅርብ ጊዜ የዕጣ ውጤት:**\n\nRound: ${latest?.drawTitle || 'Round #000'}\nአሸናፊ ቁጥር: #${latest?.number}\nአሸናፊ: ${latest?.playerName}\nየሽልማት መጠን: ${latest?.prizeAmount} ETB`;
    inlineKeyboard = [
      [{ text: '🔍 የ SHA-256 ማረጋገጫ ተመልከት', web_app: { url: `${BOT_CONFIG.miniAppUrl}/results` } }],
    ];
  } else if (text.startsWith('/operators')) {
    replyText = `🏢 **የዕጣ አዘጋጆች ማህበረሰብ directory:**\n\nበፕላትፎርሙ ላይ የተመዘገቡ ህጋዊ የ SaaS አዘጋጆችን እና የቴሌግራም ቻናሎቻቸውን ይጎብኙ።`;
    inlineKeyboard = [
      [{ text: '🏢 Directory ተመልከት', web_app: { url: `${BOT_CONFIG.miniAppUrl}/operators` } }],
    ];
  } else {
    replyText = `🤖 **01–80 Bot ትእዛዞች:**\n\n/start - ቦቱን ለመጀመር\n/board - የቁጥር ሰሌዳ ለመክፈት\n/results - ያለፉ የዕጣ ውጤቶች\n/operators - የተረጋገጡ አዘጋጆች`;
    inlineKeyboard = [
      [{ text: '🚀 Mini App ክፈት', web_app: { url: BOT_CONFIG.miniAppUrl } }],
    ];
  }

  // Returns structured webhook JSON response
  return res.json({
    method: 'sendMessage',
    chat_id: chatId,
    text: replyText,
    parse_mode: 'Markdown',
    reply_markup: inlineKeyboard ? { inline_keyboard: inlineKeyboard } : undefined,
  });
});

export default router;
