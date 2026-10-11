import crypto from 'crypto';
import { tenantService } from './tenantService.js';
import { playerService } from './playerService.js';
import { drawService } from './drawService.js';
import { paymentService } from './paymentService.js';
import { winnerService } from './winnerService.js';

// Configuration from environment variables
export const TELEGRAM_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  botUsername: process.env.TELEGRAM_BOT_USERNAME || 'DraweBot',
  webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
  miniAppUrl: (process.env.TELEGRAM_MINI_APP_URL || process.env.APP_URL || 'https://drawe-sigma.vercel.app').replace(/\/$/, ''),
  apiUrl: (process.env.API_URL || 'https://drawe.onrender.com').replace(/\/$/, ''),
  // Backwards-compatibility alias
  get appUrl() {
    return this.miniAppUrl;
  },
};

// State cache for chat user tenant context and pending payment reference states
const chatTenantMap = new Map<number, string>();
const chatAwaitingRefMap = new Map<number, { tenantId: string; drawId: string }>();

// Deduplication cache for Telegram update IDs (prevents duplicate execution on webhook retries)
const processedUpdateIds = new Map<number, number>();
const DEDUPLICATION_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Localized strings dictionary for Telegram bot (Amharic Default, English secondary)
const BOT_I18N: Record<string, Record<string, string>> = {
  am: {
    welcome: 'ሰላም {name}! 👋\nእንኳን ወደ Drawe (አደይ ዕጣ) ፕላትፎርም በሰላም መጡ።\n\nበይነተገናኝ የቁጥር ሰሌዳ ላይ ቁጥሮችዎን ይምረጡ፣ ለአዘጋጁ በቀጥታ ይክፈሉ እና በግልጽ የ SHA-256 ዕጣዎች ይሳተፉ።',
    currentOperator: '🏢 **የተመረጠው አዘጋጅ:** {name} ({location})\n\nከታች ያሉትን አዝራሮች በመጠቀም አገልግሎቶችን ያግኙ:',
    operatorsTitle: '🏢 **የተረጋገጡ የዕጣ አዘጋጆች (Operators):**\n\nለመሳተፍ የሚፈልጉትን ማህበረሰብ ይምረጡ:',
    operatorSelected: '✅ አዘጋጅ ተመርጧል: **{name}**\n\nአሁን የዚህን አዘጋጅ ንቁ ዕጣ ማየት ወይም በሰሌዳው ላይ መሳተፍ ይችላሉ።',
    noActiveDraw: '⚠️ በአሁኑ ሰዓት ለዚህ አዘጋጅ ክፍት የሆነ ንቁ ዕጣ የለም። እባክዎ ጥቂት ቆይተው እንደገና ይሞክሩ ወይም ሌላ አዘጋጅ ይምረጡ።',
    activeDrawTitle: '🎯 **የአሁኑ ንቁ ዕጣ:**\n\n**ስም:** {title}\n**አጠቃላይ ቁጥሮች:** {capacity}\n**የአንዱ ቁጥር ዋጋ:** {price} ETB\n**ሁኔታ:** {status}\n**የሚዘጋበት ጊዜ:** {closeAt}\n\n🏆 **ሽልማቶች:**\n{prizes}',
    boardPrompt: '🎲 በይነተገናኝ ሰሌዳ ላይ ቁጥሮችዎን ለመምረጥ ከታች ያለውን የ Mini App አዝራር ይጫኑ:',
    paymentInstructions: '💳 **የቀጥታ ክፍያ መመሪያ ({operator}):**\n\nየተደገፉ የክፍያ አማራጮች:\n• ቴሌብር (Telebirr)\n• የኢትዮጵያ ንግድ ባንክ (CBE / CBE Birr)\n• አቢሲኒያ ባንክ (Bank of Abyssinia)\n\nክፍያ ከፈጸሙ በኋላ የማጣቀሻ ቁጥሩን (Transaction Ref) በ Mini App ወይም በ `/payment <የማጣቀሻ ቁጥር>` ይላኩልን።\n\nምሳሌ: `/payment TXN-984720192`',
    paymentSuccess: '✅ **የክፍያ ማጣቀሻ ተቀብለናል!**\n\nየማጣቀሻ ቁጥር: `{ref}`\nየክፍያ መጠን: {amount} ETB ({quantity} ቁጥሮች)\n\nየመረጧቸው ቁጥሮች ክፍያ በማረጋገጥ ላይ (PENDING) በሚል ተይዘዋል። አድሚኑ እንደገመገመ ይረጋገጣል።',
    myNumbersEmpty: '📋 በአሁኑ ሰዓት ያስመዘገቧቸው ቁጥሮች የሉም። በቦርዱ ላይ ቁጥሮችን ይምረጡ!',
    myNumbersHeader: '📋 **የእኔ የተመዘገቡ ቁጥሮች እና ክፍያዎች:**\n\n',
    resultsHeader: '🏆 **ያለፉ የዕጣ አሸናፊዎች እና ውጤቶች:**\n\n',
    noResults: 'አሁን የሚታይ ያለፈ የዕጣ ውጤት የለም።',
    helpText: '🤖 **የ Drawe ቦት ትእዛዞች:**\n\n/start - ቦቱን ለመጀመር እና Drawe ለመክፈት\n/operators - አዘጋጆችን ለመመልከት እና ለመምረጥ\n/draw - ንቁ ዕጣ ለመመልከት\n/board - የቁጥር ሰሌዳ በ Mini App ለመክፈት\n/my_numbers - የተመረጡ ቁጥሮች ዝርዝር\n/payment - የክፍያ መመሪያ እና ማጣቀሻ መላኪያ\n/status - የክፍያ ማረጋገጫ ሁኔታ\n/results - ያለፉ አሸናፊዎች ውጤት\n/help - የእርዳታ መመሪያ',
    errorTenantNotFound: '❌ የተመረጠው አዘጋጅ አልተገኘም። እባክዎ ከ /operators ዝርዝር ይምረጡ።',
    errorGeneral: '⚠️ ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።',
  },
  en: {
    welcome: 'Hello {name}! 👋\nWelcome to Drawe Platform.\n\nSelect your numbers on the interactive board, pay operators directly, and participate in provably fair SHA-256 draws.',
    currentOperator: '🏢 **Active Operator:** {name} ({location})\n\nUse the buttons below to navigate:',
    operatorsTitle: '🏢 **Verified Draw Operators:**\n\nChoose an operator community to participate in:',
    operatorSelected: '✅ Operator selected: **{name}**\n\nYou can now view active draws and participate.',
    noActiveDraw: '⚠️ There is currently no active open draw for this operator. Please check back soon or select another operator.',
    activeDrawTitle: '🎯 **Active Draw:**\n\n**Title:** {title}\n**Capacity:** {capacity} numbers\n**Price per number:** {price} ETB\n**Status:** {status}\n**Closes At:** {closeAt}\n\n🏆 **Prizes:**\n{prizes}',
    boardPrompt: '🎲 Click the Mini App button below to open the interactive board and choose numbers:',
    paymentInstructions: '💳 **Direct Operator Payment ({operator}):**\n\nSupported payment options:\n• Telebirr\n• Commercial Bank of Ethiopia (CBE / CBE Birr)\n• Bank of Abyssinia (BOA)\n\nSubmit your transaction reference ID in the Mini App or using `/payment <reference_id>`.\n\nExample: `/payment TXN-984720192`',
    paymentSuccess: '✅ **Payment Reference Received!**\n\nReference ID: `{ref}`\nAmount: {amount} ETB ({quantity} numbers)\n\nStatus: PENDING admin review.',
    myNumbersEmpty: '📋 You have no recorded numbers or payments yet. Open the board to select numbers!',
    myNumbersHeader: '📋 **My Selections & Payments:**\n\n',
    resultsHeader: '🏆 **Recent Draw Winners & Results:**\n\n',
    noResults: 'No draw results available yet.',
    helpText: '🤖 **Drawe Bot Commands:**\n\n/start - Start the bot & Open Drawe\n/operators - Choose active operator\n/draw - View active draw\n/board - Open number board in Mini App\n/my_numbers - View my selected numbers\n/payment - Payment guide & submit reference\n/status - Payment review status\n/results - Winning numbers\n/help - Help and documentation',
    errorTenantNotFound: '❌ Selected operator not found. Please choose from /operators list.',
    errorGeneral: '⚠️ An error occurred. Please try again.',
  },
};

function t(key: string, lang: string = 'am', params: Record<string, any> = {}): string {
  const dict = BOT_I18N[lang] || BOT_I18N.am;
  let text = dict[key] || BOT_I18N.am[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return text;
}

export class TelegramService {
  /**
   * Check and record update_id to prevent duplicate processing on webhook retries
   */
  isDuplicateUpdate(updateId?: number): boolean {
    if (!updateId) return false;
    const now = Date.now();
    // Prune expired entries
    if (processedUpdateIds.size > 5000) {
      for (const [id, ts] of processedUpdateIds.entries()) {
        if (now - ts > DEDUPLICATION_TTL_MS) {
          processedUpdateIds.delete(id);
        }
      }
    }
    if (processedUpdateIds.has(updateId)) {
      return true;
    }
    processedUpdateIds.set(updateId, now);
    return false;
  }

  /**
   * Cryptographically verifies Telegram WebApp initData string using Bot Token
   * Algorithm according to Telegram Mini App specification:
   * secret_key = HMAC_SHA256("WebAppData", bot_token)
   * hash = HMAC_SHA256(secret_key, data_check_string)
   */
  verifyInitData(initDataString: string, botToken: string = TELEGRAM_CONFIG.botToken): { isValid: boolean; user?: any } {
    if (!initDataString) return { isValid: false };

    try {
      const urlParams = new URLSearchParams(initDataString);
      const hash = urlParams.get('hash');
      if (!hash) return { isValid: false };

      urlParams.delete('hash');

      // Sort alphabetically by key
      const keys = Array.from(urlParams.keys()).sort();
      const dataCheckString = keys.map(k => `${k}=${urlParams.get(k)}`).join('\n');

      // Calculate HMAC
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
      const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      const isValid = calculatedHash === hash;
      if (!isValid) return { isValid: false };

      // Validate auth_date freshness (Telegram standard: max 24 hours TTL)
      const authDate = urlParams.get('auth_date');
      if (authDate) {
        const authTimestamp = parseInt(authDate, 10);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (currentTimestamp - authTimestamp > 86400 || authTimestamp - currentTimestamp > 300) {
          return { isValid: false };
        }
      }

      const userStr = urlParams.get('user');
      const user = userStr ? JSON.parse(userStr) : undefined;

      return { isValid: true, user };
    } catch (err) {
      // Avoid logging sensitive query string contents
      console.error('[TelegramService] initData verification failed');
      return { isValid: false };
    }
  }

  /**
   * Timing-safe verification of Webhook Secret Token header
   */
  verifyWebhookSecret(tokenHeader?: string): boolean {
    if (!TELEGRAM_CONFIG.webhookSecret) {
      // In production, unconfigured webhook secret is rejected
      return process.env.NODE_ENV !== 'production';
    }
    if (!tokenHeader) return false;
    try {
      const a = Buffer.from(tokenHeader);
      const b = Buffer.from(TELEGRAM_CONFIG.webhookSecret);
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return tokenHeader === TELEGRAM_CONFIG.webhookSecret;
    }
  }

  /**
   * Send outbound message via Telegram Bot API
   */
  async sendTelegramMessage(chatId: number | string, text: string, options: any = {}): Promise<any> {
    if (!TELEGRAM_CONFIG.botToken) {
      console.warn('[TelegramService] TELEGRAM_BOT_TOKEN not configured. Skipping outbound message.');
      return null;
    }

    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          ...options,
        }),
      });

      return await res.json();
    } catch (err) {
      console.error('[TelegramService] Failed to send Telegram message');
      return null;
    }
  }

  /**
   * Answer a callback query to acknowledge user button tap
   */
  async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<any> {
    if (!TELEGRAM_CONFIG.botToken) return null;
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
        }),
      });
    } catch (err) {
      // Ignore transient errors
    }
  }

  /**
   * Build standard navigation inline keyboard
   */
  getNavigationKeyboard(tenantId: string, lang: string = 'am') {
    const miniAppUrl = `${TELEGRAM_CONFIG.miniAppUrl}?tenant=${tenantId}`;
    return [
      [
        { text: '🎮 Open Drawe', web_app: { url: miniAppUrl } },
        { text: '🎯 Active Draw', callback_data: `cmd_draw:${tenantId}` },
      ],
      [
        { text: '🔢 Select Numbers', web_app: { url: miniAppUrl } },
        { text: '📋 My Numbers', callback_data: `cmd_my:${tenantId}` },
      ],
      [
        { text: '📊 Payment Status', callback_data: `cmd_status:${tenantId}` },
        { text: '💳 Payment Guide', callback_data: `cmd_payment:${tenantId}` },
      ],
      [
        { text: '🏆 Results', callback_data: `cmd_results:${tenantId}` },
        { text: '🏢 Operators', callback_data: 'cmd_operators' },
      ],
      [
        { text: '🌐 Open Drawe Website', url: TELEGRAM_CONFIG.miniAppUrl },
      ],
    ];
  }

  /**
   * Main incoming update dispatcher
   */
  async handleUpdate(update: any): Promise<any> {
    // Check update deduplication to handle Telegram retries safely
    if (update.update_id && this.isDuplicateUpdate(update.update_id)) {
      return { status: 'duplicate_ignored', update_id: update.update_id };
    }

    if (update.callback_query) {
      return await this.handleCallbackQuery(update.callback_query);
    }

    if (update.message) {
      return await this.handleMessage(update.message);
    }

    return null;
  }

  /**
   * Handle text messages and commands
   */
  private async handleMessage(message: any): Promise<any> {
    const chatId = message.chat.id;
    const from = message.from;
    const text = (message.text || '').trim();
    const lang = from?.language_code === 'en' ? 'en' : 'am';

    // 1. Map and persist Telegram user in shared player service
    let currentTenantId = chatTenantMap.get(chatId) || 'tenant_addis';
    const playerAuth = await playerService.findOrCreateTelegramUser(from, currentTenantId);
    currentTenantId = playerAuth.activeTenantId;
    chatTenantMap.set(chatId, currentTenantId);

    // Command: /start [payload]
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length > 1) {
        const payload = parts[1].trim();
        if (payload.startsWith('op_')) {
          const slug = payload.replace('op_', '');
          const tenant = await tenantService.getTenantBySlug(slug);
          if (tenant) {
            currentTenantId = tenant._id || tenant.id;
            chatTenantMap.set(chatId, currentTenantId);
            await playerService.joinTenant(playerAuth.user.id, currentTenantId);
          }
        }
      }

      const activeTenant = await tenantService.getTenantById(currentTenantId);
      const welcomeMsg = `${t('welcome', lang, { name: from.first_name || 'ወዳጅ' })}\n\n${t('currentOperator', lang, {
        name: activeTenant?.name || 'Addis Community',
        location: activeTenant?.location || 'Addis Ababa',
      })}`;

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: welcomeMsg,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: this.getNavigationKeyboard(currentTenantId, lang),
        },
      };
    }

    // Command: /operators
    if (text.startsWith('/operators')) {
      const tenants = await tenantService.getAllTenants();
      const keyboard = tenants.map(t => [
        {
          text: `🏢 ${t.name} (${t.location || 'Ethiopia'})`,
          callback_data: `select_tenant:${t._id || t.id}`,
        },
      ]);

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: t('operatorsTitle', lang),
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard },
      };
    }

    // Command: /draw — Show available draws and allow player to choose operator/draw
    if (text.startsWith('/draw')) {
      const draw = await drawService.getActiveDraw(currentTenantId);
      if (!draw) {
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: t('noActiveDraw', lang),
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🏢 Select Another Operator', callback_data: 'cmd_operators' }]],
          },
        };
      }

      const prizesText = (draw.prizes || [])
        .map((p: any) => `• ${p.label || `${p.position} Winner`}: ${p.amount} ETB`)
        .join('\n');

      const drawText = `${t('activeDrawTitle', lang, {
        title: draw.title,
        capacity: draw.capacity || 100,
        price: draw.pricePerNumber || 50,
        status: draw.status,
        closeAt: new Date(draw.closeAt).toLocaleString(),
        prizes: prizesText || 'Prizes configured by operator',
      })}\n\n${t('boardPrompt', lang)}`;

      const miniAppUrl = `${TELEGRAM_CONFIG.miniAppUrl}?tenant=${currentTenantId}&draw=${draw._id || draw.id}`;

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: drawText,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔢 Select Numbers (Mini App)', web_app: { url: miniAppUrl } }],
            [{ text: '🏢 Choose Operator', callback_data: 'cmd_operators' }],
            [{ text: '📋 My Numbers', callback_data: `cmd_my:${currentTenantId}` }],
            [{ text: '💳 Payment Guide', callback_data: `cmd_payment:${currentTenantId}` }],
          ],
        },
      };
    }

    // Command: /board — Open the correct draw's number board in the Mini App
    if (text.startsWith('/board')) {
      const draw = await drawService.getActiveDraw(currentTenantId);
      const drawId = draw ? (draw._id || draw.id) : '';
      const miniAppUrl = drawId
        ? `${TELEGRAM_CONFIG.miniAppUrl}?tenant=${currentTenantId}&draw=${drawId}`
        : `${TELEGRAM_CONFIG.miniAppUrl}?tenant=${currentTenantId}`;

      const boardText = lang === 'en'
        ? `🎲 **Interactive Number Board**\n\nOperator: ${draw?.title || 'Active Draw'}\nCapacity: ${draw?.capacity || 100} entries\nPrice: ${draw?.pricePerNumber || 50} ETB per number\n\nTap below to open the board in the Drawe Mini App:`
        : `🎲 **የቁጥር መምረጫ ሰሌዳ (Mini App)**\n\nአዘጋጅ: ${draw?.title || 'ንቁ ዕጣ'}\nአጠቃላይ ቁጥሮች: ${draw?.capacity || 100}\nየአንዱ ዋጋ: ${draw?.pricePerNumber || 50} ETB\n\nቁጥሮችን ለመምረጥ ከታች ያለውን አዝራር ይጫኑ:`;

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: boardText,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔢 Open Number Board (Mini App)', web_app: { url: miniAppUrl } }],
            [{ text: '🎯 Draw Details', callback_data: `cmd_draw:${currentTenantId}` }],
            [{ text: '🏢 Change Operator', callback_data: 'cmd_operators' }],
          ],
        },
      };
    }

    // Command: /my_numbers
    if (text.startsWith('/my_numbers') || text.startsWith('/my')) {
      const payments = await paymentService.getPlayerPayments(playerAuth.user.id, currentTenantId);
      if (!payments || payments.length === 0) {
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: t('myNumbersEmpty', lang),
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: this.getNavigationKeyboard(currentTenantId, lang),
          },
        };
      }

      let summary = t('myNumbersHeader', lang);
      for (const p of payments) {
        summary += `• **Ref:** \`${p.transactionReference}\` | **Numbers:** [${p.numbers.join(', ')}] | **Amount:** ${p.amount} ETB | **Status:** ${p.status}\n`;
      }

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: summary,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: this.getNavigationKeyboard(currentTenantId, lang),
        },
      };
    }

    // Command: /status
    if (text.startsWith('/status')) {
      const payments = await paymentService.getPlayerPayments(playerAuth.user.id, currentTenantId);
      let statusText = `📊 **Payment Status Overview:**\n\n`;
      if (!payments || payments.length === 0) {
        statusText += t('myNumbersEmpty', lang);
      } else {
        const pending = payments.filter(p => p.status === 'PENDING').length;
        const approved = payments.filter(p => p.status === 'APPROVED').length;
        const rejected = payments.filter(p => p.status === 'REJECTED').length;
        statusText += `• ⏳ Pending Review: **${pending}**\n• ✅ Confirmed: **${approved}**\n• ❌ Rejected: **${rejected}**\n\n`;
        for (const p of payments.slice(0, 5)) {
          statusText += `• Ref \`${p.transactionReference}\`: **${p.status}** (${p.numbers.length} numbers)\n`;
        }
      }

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: statusText,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: this.getNavigationKeyboard(currentTenantId, lang),
        },
      };
    }

    // Command: /results
    if (text.startsWith('/results')) {
      const winners = await winnerService.getPublicWinners(currentTenantId, 5);
      let resultsText = t('resultsHeader', lang);
      if (!winners || winners.length === 0) {
        resultsText += t('noResults', lang);
      } else {
        for (const w of winners) {
          resultsText += `🏆 **${w.drawTitle}**\n• Position: ${w.label} (Number: #${w.formattedNumber})\n• Winner: ${w.playerName}\n• Prize: ${w.prizeAmount} ${w.currency}\n\n`;
        }
      }

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: resultsText,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: this.getNavigationKeyboard(currentTenantId, lang),
        },
      };
    }

    // Command: /payment [reference]
    if (text.startsWith('/payment')) {
      const parts = text.split(' ');
      if (parts.length > 1) {
        const ref = parts[1].trim();
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: `ℹ️ To link reference \`${ref}\` to numbers, please select your numbers using the Mini App first. Selected numbers will be paired with this transaction reference.`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔢 Open Board to Select Numbers', web_app: { url: `${TELEGRAM_CONFIG.miniAppUrl}?tenant=${currentTenantId}` } }],
            ],
          },
        };
      }

      const tenant = await tenantService.getTenantById(currentTenantId);
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: t('paymentInstructions', lang, { operator: tenant?.name || 'Operator' }),
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: this.getNavigationKeyboard(currentTenantId, lang),
        },
      };
    }

    // Command: /help
    return {
      method: 'sendMessage',
      chat_id: chatId,
      text: t('helpText', lang),
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: this.getNavigationKeyboard(currentTenantId, lang),
      },
    };
  }

  /**
   * Handle inline keyboard callback queries
   */
  private async handleCallbackQuery(cq: any): Promise<any> {
    const data = cq.data || '';
    const chatId = cq.message?.chat?.id;
    const lang = cq.from?.language_code === 'en' ? 'en' : 'am';

    await this.answerCallbackQuery(cq.id);

    if (data.startsWith('select_tenant:')) {
      const tenantId = data.replace('select_tenant:', '');
      const tenant = await tenantService.getTenantById(tenantId);
      if (tenant) {
        chatTenantMap.set(chatId, tenantId);
        const playerAuth = await playerService.findOrCreateTelegramUser(cq.from, tenantId);
        await playerService.joinTenant(playerAuth.user.id, tenantId);

        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: t('operatorSelected', lang, { name: tenant.name }),
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: this.getNavigationKeyboard(tenantId, lang),
          },
        };
      }
    }

    if (data.startsWith('cmd_draw:')) {
      const tenantId = data.replace('cmd_draw:', '') || chatTenantMap.get(chatId) || 'tenant_addis';
      const draw = await drawService.getActiveDraw(tenantId);
      if (!draw) {
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: t('noActiveDraw', lang),
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🏢 Select Another Operator', callback_data: 'cmd_operators' }]],
          },
        };
      }

      const miniAppUrl = `${TELEGRAM_CONFIG.miniAppUrl}?tenant=${tenantId}&draw=${draw._id || draw.id}`;
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: `${t('activeDrawTitle', lang, {
          title: draw.title,
          capacity: draw.capacity || 100,
          price: draw.pricePerNumber || 50,
          status: draw.status,
          closeAt: new Date(draw.closeAt).toLocaleString(),
          prizes: (draw.prizes || []).map((p: any) => `• ${p.label}: ${p.amount} ETB`).join('\n') || 'Prizes configured by operator',
        })}\n\n${t('boardPrompt', lang)}`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔢 Select Numbers (Mini App)', web_app: { url: miniAppUrl } }],
            [{ text: '🏢 Operators', callback_data: 'cmd_operators' }],
          ],
        },
      };
    }

    if (data === 'cmd_operators') {
      const tenants = await tenantService.getAllTenants();
      const keyboard = tenants.map(t => [
        {
          text: `🏢 ${t.name} (${t.location || 'Ethiopia'})`,
          callback_data: `select_tenant:${t._id || t.id}`,
        },
      ]);

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: t('operatorsTitle', lang),
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard },
      };
    }

    if (data.startsWith('cmd_my:')) {
      const tenantId = data.replace('cmd_my:', '') || chatTenantMap.get(chatId) || 'tenant_addis';
      const playerAuth = await playerService.findOrCreateTelegramUser(cq.from, tenantId);
      const payments = await paymentService.getPlayerPayments(playerAuth.user.id, tenantId);

      let text = t('myNumbersHeader', lang);
      if (!payments || payments.length === 0) {
        text = t('myNumbersEmpty', lang);
      } else {
        for (const p of payments) {
          summary: text += `• Ref: \`${p.transactionReference}\` | Numbers: [${p.numbers.join(', ')}] | Amount: ${p.amount} ETB | Status: ${p.status}\n`;
        }
      }

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: this.getNavigationKeyboard(tenantId, lang),
        },
      };
    }

    if (data.startsWith('cmd_status:')) {
      const tenantId = data.replace('cmd_status:', '') || chatTenantMap.get(chatId) || 'tenant_addis';
      const playerAuth = await playerService.findOrCreateTelegramUser(cq.from, tenantId);
      const payments = await paymentService.getPlayerPayments(playerAuth.user.id, tenantId);

      let text = `📊 **Payment Status Review:**\n\n`;
      if (!payments || payments.length === 0) {
        text += t('myNumbersEmpty', lang);
      } else {
        for (const p of payments.slice(0, 5)) {
          text += `• Ref \`${p.transactionReference}\`: **${p.status}** (${p.numbers.length} numbers - ${p.amount} ETB)\n`;
        }
      }

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: this.getNavigationKeyboard(tenantId, lang),
        },
      };
    }

    if (data.startsWith('cmd_results:')) {
      const tenantId = data.replace('cmd_results:', '') || chatTenantMap.get(chatId) || 'tenant_addis';
      const winners = await winnerService.getPublicWinners(tenantId, 5);
      let text = t('resultsHeader', lang);
      if (!winners || winners.length === 0) {
        text += t('noResults', lang);
      } else {
        for (const w of winners) {
          text += `🏆 **${w.drawTitle}**\n• Position: ${w.label} (Number: #${w.formattedNumber})\n• Winner: ${w.playerName}\n• Prize: ${w.prizeAmount} ${w.currency}\n\n`;
        }
      }

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: this.getNavigationKeyboard(tenantId, lang),
        },
      };
    }

    if (data.startsWith('cmd_payment:')) {
      const tenantId = data.replace('cmd_payment:', '') || chatTenantMap.get(chatId) || 'tenant_addis';
      const tenant = await tenantService.getTenantById(tenantId);
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: t('paymentInstructions', lang, { operator: tenant?.name || 'Operator' }),
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: this.getNavigationKeyboard(tenantId, lang),
        },
      };
    }

    // Secure Admin Approval Callback: adm_appr:<paymentId>
    if (data.startsWith('adm_appr:')) {
      const paymentId = data.replace('adm_appr:', '').trim();
      const tgUserId = String(cq.from?.id);

      // Security Check 1: Find mapped platform user
      const adminUser = await playerService.findUserByTelegramId(tgUserId);
      if (!adminUser) {
        await this.answerCallbackQuery(cq.id, '⛔ ስህተት: የቴሌግራም መለያዎ ከአድሚን አካውንት ጋር አልተገናኘም።');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: '⛔ **ያልተፈቀደ እርምጃ (Unauthorized):**\n\nየእርስዎ የቴሌግራም አካውንት ከአድሚን መለያ ጋር አልተገናኘም።',
          parse_mode: 'Markdown',
        };
      }

      // Security Check 2: Verify ADMIN or SUPER_ADMIN role
      if (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
        await this.answerCallbackQuery(cq.id, '⛔ ስህተት: የአድሚን ፈቃድ የለዎትም።');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: '⛔ **የተከለከለ እርምጃ (Access Denied):**\n\nክፍያዎችን ለማጽደቅ የአድሚን ሚና (ADMIN role) ያስፈልጋል።',
          parse_mode: 'Markdown',
        };
      }

      // Retrieve target payment
      const payment = await paymentService.getPaymentById(paymentId);
      if (!payment) {
        await this.answerCallbackQuery(cq.id, '❌ የክፍያ መረጃው አልተገኘም።');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: '❌ **ስህተት:** የክፍያ መረጃው በሲስተሙ ውስጥ አልተገኘም።',
          parse_mode: 'Markdown',
        };
      }

      if (payment.status === 'APPROVED') {
        await this.answerCallbackQuery(cq.id, 'ℹ️ ይህ ክፍያ ቀደም ሲል ጸድቋል።');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: `ℹ️ ይህ ክፍያ (Ref: \`${payment.transactionReference}\`) ቀደም ሲል ጸድቋል።`,
          parse_mode: 'Markdown',
        };
      }

      // Security Check 3: Tenant Isolation (Admin A must NEVER approve Tenant B payment)
      if (adminUser.role !== 'SUPER_ADMIN' && adminUser.tenantId !== payment.tenantId) {
        await this.answerCallbackQuery(cq.id, '⛔ ስህተት: የሌላ አዘጋጅ ክፍያ ማጽደቅ አይችሉም!');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: `⛔ **የማህበረሰብ ገደብ ጥሰት (Tenant Isolation):**\n\nየእርስዎ አድሚን ፍቃድ ለ ${adminUser.tenantId} ብቻ ነው። የሌላ አዘጋጅ (${payment.tenantId}) ክፍያ ማጽደቅ በጥብቅ የተከለከለ ነው።`,
          parse_mode: 'Markdown',
        };
      }

      try {
        const approved = await paymentService.approvePayment(paymentId, adminUser);
        await this.answerCallbackQuery(cq.id, '✅ ክፍያው በተሳካ ሁኔታ ጸድቋል!');

        return {
          method: 'sendMessage',
          chat_id: chatId,
          text:
            `✅ **የክፍያ ማረጋገጫ ጸድቋል!**\n\n` +
            `**ተጫዋች:** ${approved.playerName}\n` +
            `**የተረጋገጡ ቁጥሮች:** [${approved.numbers.join(', ')}]\n` +
            `**መጠን:** ${approved.amount} ETB\n` +
            `**ማጣቀሻ:** \`${approved.transactionReference}\`\n` +
            `**አጽዳቂ አድሚን:** ${adminUser.name}\n` +
            `**ሁኔታ:** ✅ CONFIRMED\n\n` +
            `ተጫዋቹ በቴሌግራም ማሳወቂያ ደርሶታል፤ ቁጥሮቹ በሲስተሙ ተረጋግጠዋል።`,
          parse_mode: 'Markdown',
        };
      } catch (err: any) {
        await this.answerCallbackQuery(cq.id, '⚠️ ስህተት ተከስቷል።');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: `⚠️ **ክፍያውን ማጽደቅ አልተቻለም:** ${err.message}`,
          parse_mode: 'Markdown',
        };
      }
    }

    // Secure Admin Rejection Callback: adm_rejc:<paymentId>
    if (data.startsWith('adm_rejc:')) {
      const paymentId = data.replace('adm_rejc:', '').trim();
      const tgUserId = String(cq.from?.id);

      // Security Check 1: Find mapped platform user
      const adminUser = await playerService.findUserByTelegramId(tgUserId);
      if (!adminUser) {
        await this.answerCallbackQuery(cq.id, '⛔ ስህተት: የቴሌግራም መለያዎ ከአድሚን አካውንት ጋር አልተገናኘም።');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: '⛔ **ያልተፈቀደ እርምጃ:** የእርስዎ ቴሌግራም ከአድሚን አካውንት ጋር አልተገናኘም።',
          parse_mode: 'Markdown',
        };
      }

      // Security Check 2: Verify ADMIN or SUPER_ADMIN role
      if (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
        await this.answerCallbackQuery(cq.id, '⛔ ስህተት: የአድሚን ፈቃድ የለዎትም።');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: '⛔ **የተከለከለ እርምጃ:** የአድሚን ፈቃድ ያስፈልጋል።',
          parse_mode: 'Markdown',
        };
      }

      const payment = await paymentService.getPaymentById(paymentId);
      if (!payment) {
        await this.answerCallbackQuery(cq.id, '❌ የክፍያ መረጃው አልተገኘም።');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: '❌ **ስህተት:** የክፍያ መረጃው አልተገኘም።',
          parse_mode: 'Markdown',
        };
      }

      if (payment.status === 'REJECTED') {
        await this.answerCallbackQuery(cq.id, 'ℹ️ ይህ ክፍያ ቀደም ሲል ውድቅ ተደርጓል።');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: `ℹ️ ይህ ክፍያ (Ref: \`${payment.transactionReference}\`) ቀደም ሲል ውድቅ ተደርጓል።`,
          parse_mode: 'Markdown',
        };
      }

      // Security Check 3: Tenant Isolation (Admin A must NEVER reject Tenant B payment)
      if (adminUser.role !== 'SUPER_ADMIN' && adminUser.tenantId !== payment.tenantId) {
        await this.answerCallbackQuery(cq.id, '⛔ ስህተት: የሌላ አዘጋጅ ክፍያ ውድቅ ማድረግ አይችሉም!');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: `⛔ **የማህበረሰብ ገደብ ጥሰት (Tenant Isolation):**\n\nየእርስዎ አድሚን ፍቃድ ለ ${adminUser.tenantId} ብቻ ነው። የሌላ አዘጋጅ (${payment.tenantId}) ክፍያ ውድቅ ማድረግ አይችሉም።`,
          parse_mode: 'Markdown',
        };
      }

      try {
        const rejected = await paymentService.rejectPayment(
          paymentId,
          'የማጣቀሻ ማረጋገጫ አልተሳካም (በአድሚን ውድቅ ተደርጓል)',
          adminUser
        );
        await this.answerCallbackQuery(cq.id, '❌ ክፍያው ውድቅ ተደርጓል!');

        return {
          method: 'sendMessage',
          chat_id: chatId,
          text:
            `❌ **የክፍያ ማረጋገጫ ውድቅ ተደርጓል!**\n\n` +
            `**ተጫዋች:** ${rejected.playerName}\n` +
            `**የተለቀቁ ቁጥሮች:** [${rejected.numbers.join(', ')}]\n` +
            `**ማጣቀሻ:** \`${rejected.transactionReference}\`\n` +
            `**ውድቅ ያደረገው አድሚን:** ${adminUser.name}\n` +
            `**ሁኔታ:** ❌ REJECTED\n\n` +
            `ቁጥሮቹ ወደ ነበሩበት (AVAILABLE) ተመልሰዋል፤ ለተጫዋቹ ማሳወቂያ ተልኳል።`,
          parse_mode: 'Markdown',
        };
      } catch (err: any) {
        await this.answerCallbackQuery(cq.id, '⚠️ ስህተት ተከስቷል።');
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: `⚠️ **ክፍያውን ውድቅ ማድረግ አልተቻለም:** ${err.message}`,
          parse_mode: 'Markdown',
        };
      }
    }

    return null;
  }
}

export const telegramService = new TelegramService();
