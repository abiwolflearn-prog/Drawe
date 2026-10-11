import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { telegramService, TELEGRAM_CONFIG } from '../services/telegramService.js';
import { playerService } from '../services/playerService.js';
import { drawService } from '../services/drawService.js';
import { paymentService, memoryPayments } from '../services/paymentService.js';
import { tenantService } from '../services/tenantService.js';
import { winnerService } from '../services/winnerService.js';
import { isFallbackStore } from '../../db/connect.js';
import { formatEntryNumber } from '../../types/index.js';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export async function runTelegramBotComprehensiveTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const test = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      results.push({ name, passed: true, message: 'PASSED' });
    } catch (err: any) {
      results.push({ name, passed: false, message: err.message || 'FAILED' });
    }
  };

  const testBotToken = '987654321:AAH1BC-ComprehensiveTestToken12345';
  const testWebhookSecret = 'drawe-test-webhook-secret-token-xyz';

  // 1. Webhook Secret Header Validation
  await test('Webhook Security: validates correct secret header and rejects invalid/missing headers', () => {
    // Temporarily configure secret token for verification test
    const origSecret = TELEGRAM_CONFIG.webhookSecret;
    try {
      TELEGRAM_CONFIG.webhookSecret = testWebhookSecret;

      // Valid header matching secret
      const isValid = telegramService.verifyWebhookSecret(testWebhookSecret);
      if (!isValid) throw new Error('Expected valid webhook secret token to match');

      // Invalid header
      const isInvalid = telegramService.verifyWebhookSecret('tampered-fake-token-999');
      if (isInvalid) throw new Error('Expected tampered webhook secret token to be rejected');

      // Missing header (undefined)
      const isMissing = telegramService.verifyWebhookSecret(undefined);
      if (isMissing) throw new Error('Expected missing webhook secret header to be rejected');
    } finally {
      TELEGRAM_CONFIG.webhookSecret = origSecret;
    }
  });

  // 2. Duplicate Telegram update handling (update_id deduplication)
  await test('Update Deduplication: prevents duplicate execution on Telegram retries', async () => {
    const testUpdateId = 99912345;
    const testMessage = {
      update_id: testUpdateId,
      message: {
        chat: { id: 888123 },
        from: { id: 888123, first_name: 'DedupTester', language_code: 'am' },
        text: '/help',
      },
    };

    // First delivery should process update
    const firstResult = await telegramService.handleUpdate(testMessage);
    if (!firstResult || firstResult.method !== 'sendMessage') {
      throw new Error('First update should process normally');
    }

    // Immediate retry with the same update_id should be ignored
    const secondResult = await telegramService.handleUpdate(testMessage);
    if (!secondResult || secondResult.status !== 'duplicate_ignored') {
      throw new Error(`Second update with same update_id should return duplicate_ignored, got: ${JSON.stringify(secondResult)}`);
    }
  });

  // 3. Bot Command Dispatch: /start
  await test('Bot Command /start: returns welcome greeting and Open Drawe Mini App button', async () => {
    const res = await telegramService.handleUpdate({
      update_id: 10001,
      message: {
        chat: { id: 777101 },
        from: { id: 777101, first_name: 'Abel', language_code: 'am' },
        text: '/start',
      },
    });

    if (!res || res.method !== 'sendMessage') throw new Error('Expected sendMessage action');
    if (!res.text.includes('Drawe')) throw new Error('Welcome text must mention Drawe');
    const buttons = res.reply_markup?.inline_keyboard?.flat() || [];
    const openDraweBtn = buttons.find((b: any) => b.text.includes('Open Drawe'));
    if (!openDraweBtn || !openDraweBtn.web_app?.url) throw new Error('Missing Open Drawe WebApp button');
  });

  // 4. Bot Command Dispatch: /operators
  await test('Bot Command /operators: lists real active operators with selection callbacks', async () => {
    const res = await telegramService.handleUpdate({
      update_id: 10002,
      message: {
        chat: { id: 777102 },
        from: { id: 777102, first_name: 'Sara', language_code: 'en' },
        text: '/operators',
      },
    });

    if (!res || res.method !== 'sendMessage') throw new Error('Expected sendMessage action');
    const buttons = res.reply_markup?.inline_keyboard?.flat() || [];
    if (buttons.length === 0) throw new Error('Expected active operator buttons');
    const hasTenantSelect = buttons.some((b: any) => b.callback_data && b.callback_data.startsWith('select_tenant:'));
    if (!hasTenantSelect) throw new Error('Expected select_tenant callback in operator list');
  });

  // 5. Bot Command Dispatch: /draw
  await test('Bot Command /draw: shows active draw details and capacity/price info', async () => {
    const res = await telegramService.handleUpdate({
      update_id: 10003,
      message: {
        chat: { id: 777103 },
        from: { id: 777103, first_name: 'Dawit', language_code: 'en' },
        text: '/draw',
      },
    });

    if (!res || res.method !== 'sendMessage') throw new Error('Expected sendMessage action');
    if (!res.text.includes('Capacity:') && !res.text.includes('ዋጋ:')) {
      throw new Error('Draw response must include draw details or status');
    }
  });

  // 6. Bot Command Dispatch: /board
  await test('Bot Command /board: opens the correct draw number board in the Mini App', async () => {
    const res = await telegramService.handleUpdate({
      update_id: 10004,
      message: {
        chat: { id: 777104 },
        from: { id: 777104, first_name: 'Helen', language_code: 'am' },
        text: '/board',
      },
    });

    if (!res || res.method !== 'sendMessage') throw new Error('Expected sendMessage action');
    const buttons = res.reply_markup?.inline_keyboard?.flat() || [];
    const boardBtn = buttons.find((b: any) => b.web_app && b.web_app.url.includes('tenant='));
    if (!boardBtn) throw new Error('Expected board WebApp button preserving tenant context');
  });

  // 7. Bot Command Dispatch: /my_numbers
  await test('Bot Command /my_numbers: returns player selections or guided prompt', async () => {
    const res = await telegramService.handleUpdate({
      update_id: 10005,
      message: {
        chat: { id: 777105 },
        from: { id: 777105, first_name: 'Robel', language_code: 'am' },
        text: '/my_numbers',
      },
    });

    if (!res || res.method !== 'sendMessage') throw new Error('Expected sendMessage action');
    if (!res.text) throw new Error('Expected response text for /my_numbers');
  });

  // 8. Bot Command Dispatch: /payment
  await test('Bot Command /payment: shows supported payment methods and instructions', async () => {
    const res = await telegramService.handleUpdate({
      update_id: 10006,
      message: {
        chat: { id: 777106 },
        from: { id: 777106, first_name: 'Kalkidan', language_code: 'en' },
        text: '/payment',
      },
    });

    if (!res || res.method !== 'sendMessage') throw new Error('Expected sendMessage action');
    if (!res.text.includes('Telebirr') && !res.text.includes('CBE')) {
      throw new Error('Payment instructions should list Telebirr / CBE payment options');
    }
  });

  // 9. Bot Command Dispatch: /status
  await test('Bot Command /status: provides overview of pending and confirmed payments', async () => {
    const res = await telegramService.handleUpdate({
      update_id: 10007,
      message: {
        chat: { id: 777107 },
        from: { id: 777107, first_name: 'Yonas', language_code: 'en' },
        text: '/status',
      },
    });

    if (!res || res.method !== 'sendMessage') throw new Error('Expected sendMessage action');
    if (!res.text.includes('Status') && !res.text.includes('ሁኔታ')) {
      throw new Error('Status command should return status summary');
    }
  });

  // 10. Bot Command Dispatch: /results
  await test('Bot Command /results: displays saved results from completed draws', async () => {
    const res = await telegramService.handleUpdate({
      update_id: 10008,
      message: {
        chat: { id: 777108 },
        from: { id: 777108, first_name: 'Tigist', language_code: 'am' },
        text: '/results',
      },
    });

    if (!res || res.method !== 'sendMessage') throw new Error('Expected sendMessage action');
    if (!res.text) throw new Error('Expected results text');
  });

  // 11. Bot Command Dispatch: /help
  await test('Bot Command /help: documents all available commands', async () => {
    const res = await telegramService.handleUpdate({
      update_id: 10009,
      message: {
        chat: { id: 777109 },
        from: { id: 777109, first_name: 'Sam', language_code: 'en' },
        text: '/help',
      },
    });

    if (!res || res.method !== 'sendMessage') throw new Error('Expected sendMessage action');
    for (const cmd of ['/start', '/operators', '/draw', '/board', '/my_numbers', '/payment', '/status', '/results', '/help']) {
      if (!res.text.includes(cmd)) {
        throw new Error(`Help text missing command ${cmd}`);
      }
    }
  });

  // 12. Telegram Identity Validation (HMAC-SHA256, expired auth_date, forged signature)
  await test('Telegram Identity Validation: accepts valid initData and rejects forged or expired payloads', () => {
    const authDate = String(Math.floor(Date.now() / 1000));
    const userJson = JSON.stringify({ id: 55443322, first_name: 'LegitPlayer', username: 'legit' });
    const dataCheckString = `auth_date=${authDate}\nuser=${userJson}`;
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(testBotToken).digest();
    const validHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const validInitData = `auth_date=${encodeURIComponent(authDate)}&user=${encodeURIComponent(userJson)}&hash=${validHash}`;
    const validVerification = telegramService.verifyInitData(validInitData, testBotToken);
    if (!validVerification.isValid || validVerification.user?.id !== 55443322) {
      throw new Error('Valid initData was erroneously rejected');
    }

    // Forged signature
    const forgedInitData = `auth_date=${encodeURIComponent(authDate)}&user=${encodeURIComponent(userJson)}&hash=invalid_hash_12345`;
    const forgedVerification = telegramService.verifyInitData(forgedInitData, testBotToken);
    if (forgedVerification.isValid) {
      throw new Error('Forged initData must be rejected');
    }

    // Expired auth_date (>24 hours)
    const expiredDate = String(Math.floor(Date.now() / 1000) - (86400 * 2));
    const expiredCheck = `auth_date=${expiredDate}\nuser=${userJson}`;
    const expiredHash = crypto.createHmac('sha256', secretKey).update(expiredCheck).digest('hex');
    const expiredInitData = `auth_date=${encodeURIComponent(expiredDate)}&user=${encodeURIComponent(userJson)}&hash=${expiredHash}`;
    const expiredVerification = telegramService.verifyInitData(expiredInitData, testBotToken);
    if (expiredVerification.isValid) {
      throw new Error('Expired initData (>24 hours) must be rejected');
    }
  });

  // 13. Tenant Isolation & Payment Privacy
  await test('Payment Privacy & Tenant Isolation: player only accesses own selections within assigned tenant', async () => {
    const playerA = await playerService.findOrCreateTelegramUser({ id: 101010, first_name: 'PlayerA' }, 'tenant_addis');
    const playerB = await playerService.findOrCreateTelegramUser({ id: 202020, first_name: 'PlayerB' }, 'tenant_hawassa');

    // Create distinct test payment for player A
    const paymentA = {
      _id: 'pay_test_privacy_a',
      id: 'pay_test_privacy_a',
      playerId: playerA.user.id,
      playerName: playerA.user.name,
      playerPhone: '0911000001',
      tenantId: 'tenant_addis',
      drawId: 'draw_round_001',
      drawTitle: 'Round #001',
      selectionId: 'sel_test_a',
      numbers: [7, 8],
      amount: 100,
      unitPrice: 50,
      method: 'TELEBIRR',
      transactionReference: 'TXN-PRIV-A-001',
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryPayments.push(paymentA as any);

    // Player A query for Player A in tenant_addis -> returns paymentA
    const paymentsA = await paymentService.getPlayerPayments(playerA.user.id, 'tenant_addis');
    const foundA = paymentsA.find((p: any) => p.transactionReference === 'TXN-PRIV-A-001');
    if (!foundA) throw new Error('Player A should see their own payment');

    // Player B query in tenant_addis -> must NOT see Player A's payment
    const paymentsB = await paymentService.getPlayerPayments(playerB.user.id, 'tenant_addis');
    const leakToB = paymentsB.find((p: any) => p.transactionReference === 'TXN-PRIV-A-001');
    if (leakToB) throw new Error('Data breach: Player B can view Player A payments');

    // Player A querying another tenant (tenant_hawassa) -> must NOT see payments from another tenant
    const paymentsAInHawassa = await paymentService.getPlayerPayments(playerA.user.id, 'tenant_hawassa');
    const crossTenantLeak = paymentsAInHawassa.find((p: any) => p.transactionReference === 'TXN-PRIV-A-001');
    if (crossTenantLeak) throw new Error('Cross-tenant data breach: payment returned for different tenant');
  });

  // 14. Unauthorized Admin Access & Cross-Tenant Admin Approval
  await test('Admin Security: non-admin or cross-tenant admin cannot approve payments via Telegram callback', async () => {
    // 14.1 Non-admin player tries to approve
    const nonAdminUser = await playerService.findOrCreateTelegramUser({ id: 334455, first_name: 'RegularPlayer' });
    const callbackResult = await telegramService.handleUpdate({
      update_id: 10010,
      callback_query: {
        id: 'cq_unauth_01',
        from: { id: 334455 },
        data: 'adm_appr:pay_1001',
      },
    });

    if (!callbackResult || !callbackResult.text.includes('ያልተፈቀደ') && !callbackResult.text.includes('Unauthorized') && !callbackResult.text.includes('የተከለከለ')) {
      throw new Error('Non-admin user approval should be blocked and rejected');
    }

    // 14.2 Admin A attempts to approve payment from Tenant B
    const hawassaPayment = {
      _id: 'pay_hawassa_isolated',
      id: 'pay_hawassa_isolated',
      playerId: 'usr_player_hawassa',
      playerName: 'Hawassa Player',
      playerPhone: '0922000000',
      tenantId: 'tenant_hawassa',
      drawId: 'draw_round_hawassa_01',
      drawTitle: 'Hawassa Round 01',
      selectionId: 'sel_hawassa_01',
      numbers: [11],
      amount: 100,
      unitPrice: 100,
      method: 'CBE_BANK',
      transactionReference: 'TXN-HAW-ISOLATED',
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryPayments.push(hawassaPayment as any);

    // Addis Admin Telegram ID = 77700001 (mapped in superAdmin / tenantService)
    const crossTenantApproval = await telegramService.handleUpdate({
      update_id: 10011,
      callback_query: {
        id: 'cq_cross_tenant_01',
        from: { id: 77700001 },
        data: 'adm_appr:pay_hawassa_isolated',
      },
    });

    if (!crossTenantApproval || !crossTenantApproval.text.includes('Tenant Isolation') && !crossTenantApproval.text.includes('የማህበረሰብ ገደብ')) {
      throw new Error('Cross-tenant payment approval should be strictly blocked by Tenant Isolation check');
    }
  });

  // 15. Missing Environment Variables Handling
  await test('Resilience: handles missing bot token gracefully without crashing', async () => {
    const origToken = TELEGRAM_CONFIG.botToken;
    try {
      TELEGRAM_CONFIG.botToken = '';
      const sendResult = await telegramService.sendTelegramMessage(123456, 'Test without token');
      if (sendResult !== null) throw new Error('Expected null response when bot token is unconfigured');
    } finally {
      TELEGRAM_CONFIG.botToken = origToken;
    }
  });

  // 16. Fallback Store & Draw Engine Integrity
  await test('Draw Engine & Store: capacity bounds and formatting work consistently in fallback or MongoDB', () => {
    if (formatEntryNumber(1, 1) !== '1') throw new Error('formatEntryNumber(1, 1) failed');
    if (formatEntryNumber(80, 80) !== '80') throw new Error('formatEntryNumber(80, 80) failed');
    if (formatEntryNumber(1, 80) !== '01') throw new Error('formatEntryNumber(1, 80) failed');
    if (formatEntryNumber(5, 250) !== '005') throw new Error('formatEntryNumber(5, 250) failed');
    if (formatEntryNumber(100, 250) !== '100') throw new Error('formatEntryNumber(100, 250) failed');
    if (formatEntryNumber(7, 1000) !== '0007') throw new Error('formatEntryNumber(7, 1000) failed');
  });

  return results;
}
