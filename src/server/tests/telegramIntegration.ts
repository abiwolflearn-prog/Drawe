import crypto from 'crypto';
import { telegramService } from '../services/telegramService.js';
import { playerService } from '../services/playerService.js';
import { tenantService } from '../services/tenantService.js';
import { drawService, memoryDraws } from '../services/drawService.js';
import { paymentService } from '../services/paymentService.js';
import { winnerService } from '../services/winnerService.js';
import { defaultNumbersMap } from '../store.js';
import jwt from 'jsonwebtoken';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export async function runTelegramIntegrationTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const test = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      results.push({ name, passed: true, message: 'Passed' });
    } catch (err: any) {
      results.push({ name, passed: false, message: err.message || 'Failed' });
    }
  };

  const resetTestNumbers = () => {
    [61, 62, 63, 64, 65].forEach(num => {
      const cell = defaultNumbersMap.get(num);
      if (cell) {
        cell.status = 'AVAILABLE';
        cell.selectedBy = undefined;
      }
    });
  };

  // Test 1: Telegram authentication & HMAC-SHA256 verification
  await test('Telegram authentication: verifyInitData validates authentic Telegram hash', () => {
    const testBotToken = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';
    const authDate = String(Math.floor(Date.now() / 1000));
    const userJson = JSON.stringify({ id: 987654321, first_name: 'Abel', username: 'abel_tg' });

    // Construct valid HMAC-SHA256 signature
    const dataCheckString = `auth_date=${authDate}\nuser=${userJson}`;
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(testBotToken).digest();
    const validHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const rawInitData = `auth_date=${encodeURIComponent(authDate)}&user=${encodeURIComponent(userJson)}&hash=${validHash}`;

    const verification = telegramService.verifyInitData(rawInitData, testBotToken);
    if (!verification.isValid) throw new Error('Expected initData to be valid');
    if (verification.user?.id !== 987654321) throw new Error('Failed to parse user from initData');
  });

  await test('Telegram authentication: rejects tampered or forged initData', () => {
    const testBotToken = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';
    const rawInitData = 'auth_date=1600000000&user={"id":987654321}&hash=fake_invalid_hash_12345';
    const verification = telegramService.verifyInitData(rawInitData, testBotToken);
    if (verification.isValid) throw new Error('Forged initData should not be valid');
  });

  await test('Telegram authentication: rejects expired initData (>24h TTL)', () => {
    const testBotToken = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';
    // Expired timestamp (2 days ago)
    const expiredAuthDate = String(Math.floor(Date.now() / 1000) - (2 * 86400));
    const userJson = JSON.stringify({ id: 987654321, first_name: 'Abel', username: 'abel_tg' });

    const dataCheckString = `auth_date=${expiredAuthDate}\nuser=${userJson}`;
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(testBotToken).digest();
    const validHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const expiredInitData = `auth_date=${encodeURIComponent(expiredAuthDate)}&user=${encodeURIComponent(userJson)}&hash=${validHash}`;
    const verification = telegramService.verifyInitData(expiredInitData, testBotToken);
    if (verification.isValid) throw new Error('Expired initData should be rejected');
  });

  await test('Telegram authentication: issues valid JWT token for Telegram player', async () => {
    const authResult = await playerService.findOrCreateTelegramUser(
      { id: 99887766, first_name: 'TestPlayer', username: 'test_tg' },
      'tenant_addis'
    );

    if (!authResult.token) throw new Error('Missing authentication token');
    if (authResult.user.telegramUserId !== '99887766') throw new Error('Incorrect mapped telegramUserId');

    // Decode and verify JWT
    const decoded = jwt.decode(authResult.token) as any;
    if (!decoded || decoded.role !== 'PLAYER') throw new Error('Invalid JWT payload or role');
    if (decoded.tenantId !== 'tenant_addis') throw new Error('JWT tenantId mismatch');
  });

  // Test 2: Tenant membership
  await test('Tenant membership: validates and assigns player to tenant', async () => {
    const playerId = 'usr_test_member_01';
    await playerService.joinTenant(playerId, 'tenant_hawassa');
    const hasAccess = await playerService.hasTenantMembership(playerId, 'tenant_hawassa');
    if (!hasAccess) throw new Error('Player should have membership in tenant_hawassa');
  });

  // Test 3: Operator selection
  await test('Operator selection: retrieves active operators and handles selection', async () => {
    const operators = await tenantService.getAllTenants();
    if (!operators || operators.length < 2) throw new Error('Expected at least 2 active operators');
    const hawassa = await tenantService.getTenantById('tenant_hawassa');
    if (!hawassa || hawassa.name !== 'Hawassa Lake Draw Operator') throw new Error('Failed to find tenant_hawassa');
  });

  // Test 4: Active draw retrieval
  await test('Active draw: returns safe public draw details without exposing secret seed', async () => {
    const draw = await drawService.getActiveDraw('tenant_addis');
    if (!draw) throw new Error('Expected active draw for tenant_addis');
    const publicDetails = drawService.getPublicDrawDetails(draw);
    if (!publicDetails) throw new Error('Expected public details');

    if (!publicDetails.title || !publicDetails.pricePerNumber) throw new Error('Missing public details');
    if ((publicDetails as any).serverSeed) throw new Error('Active draw must NOT leak serverSeed!');
  });

  // Test 5: Number selection bounds
  await test('Number selection: enforces capacity limits (1..capacity)', async () => {
    const testPlayer = await playerService.findOrCreateTelegramUser({ id: 11112222, first_name: 'Tester' });

    // Attempt out-of-bounds number (e.g. 9999)
    let caught = false;
    try {
      await paymentService.submitPayment({
        playerId: testPlayer.user.id,
        tenantId: 'tenant_addis',
        drawId: 'draw_round_001',
        numbers: [9999],
        transactionReference: 'TXN-OOB-001',
      });
    } catch (err: any) {
      caught = true;
    }
    if (!caught) throw new Error('Out of bounds number 9999 should have been rejected');
  });

  // Test 6: Payment submission & server-side authoritative pricing
  await test('Payment submission: calculates authoritative server price snapshot', async () => {
    resetTestNumbers();
    const testPlayer = await playerService.findOrCreateTelegramUser({ id: 33334444, first_name: 'Buyer' });
    const ref = `TXN-TEST-${Date.now()}`;

    // Select numbers 61 and 62 (which are available)
    const result = await paymentService.submitPayment({
      playerId: testPlayer.user.id,
      tenantId: 'tenant_addis',
      drawId: 'draw_round_001',
      numbers: [61, 62],
      transactionReference: ref,
    });

    if (result.quantity !== 2) throw new Error(`Expected quantity 2, got ${result.quantity}`);
    if (result.unitPrice !== 50) throw new Error(`Expected unitPrice 50, got ${result.unitPrice}`);
    if (result.amount !== 100) throw new Error(`Expected amount 100, got ${result.amount}`);
    if (result.payment.status !== 'PENDING') throw new Error('New payment must have PENDING status');
  });

  // Test 7: Duplicate transaction reference rejection
  await test('Payment submission: rejects duplicate transactionReference', async () => {
    resetTestNumbers();
    const testPlayer = await playerService.findOrCreateTelegramUser({ id: 55556666, first_name: 'DupTester' });
    const ref = `TXN-DUP-${Date.now()}`;

    // First submission on number 63
    await paymentService.submitPayment({
      playerId: testPlayer.user.id,
      tenantId: 'tenant_addis',
      drawId: 'draw_round_001',
      numbers: [63],
      transactionReference: ref,
    });

    // Second submission with exact same reference on number 64
    let dupCaught = false;
    try {
      await paymentService.submitPayment({
        playerId: testPlayer.user.id,
        tenantId: 'tenant_addis',
        drawId: 'draw_round_001',
        numbers: [64],
        transactionReference: ref,
      });
    } catch (err: any) {
      dupCaught = true;
      if (!err.message.includes('Duplicate payment reference')) {
        throw new Error(`Unexpected error message: ${err.message}`);
      }
    }

    if (!dupCaught) throw new Error('Duplicate transaction reference was not rejected!');
  });

  // Test 8: PAYMENT_PENDING collision
  await test('Payment submission: prevents number collision on already reserved numbers', async () => {
    resetTestNumbers();
    const playerA = await playerService.findOrCreateTelegramUser({ id: 77770001, first_name: 'PlayerA' });
    const playerB = await playerService.findOrCreateTelegramUser({ id: 77770002, first_name: 'PlayerB' });

    // Number 65 reserved by PlayerA
    await paymentService.submitPayment({
      playerId: playerA.user.id,
      tenantId: 'tenant_addis',
      drawId: 'draw_round_001',
      numbers: [65],
      transactionReference: `TXN-COLLISION-A-${Date.now()}`,
    });

    // PlayerB tries to select number 65
    let collisionCaught = false;
    try {
      await paymentService.submitPayment({
        playerId: playerB.user.id,
        tenantId: 'tenant_addis',
        drawId: 'draw_round_001',
        numbers: [65],
        transactionReference: `TXN-COLLISION-B-${Date.now()}`,
      });
    } catch (err: any) {
      collisionCaught = true;
      if (!err.message.includes('ይቅርታ') && !err.message.includes('no longer available')) {
        throw new Error(`Unexpected collision message: ${err.message}`);
      }
    }

    if (!collisionCaught) throw new Error('Collision on PAYMENT_PENDING number was not prevented!');
  });

  // Test 9: Closed draw rejection
  await test('Closed draw: rejects payment when draw is not OPEN', async () => {
    const testPlayer = await playerService.findOrCreateTelegramUser({ id: 88889999, first_name: 'LatePlayer' });

    // Create a temporary closed draw in memory
    const closedDraw = {
      ...memoryDraws.get('draw_round_001')!,
      _id: 'draw_test_closed_999',
      status: 'CLOSED' as const,
    };
    memoryDraws.set('draw_test_closed_999', closedDraw);

    let closedCaught = false;
    try {
      await paymentService.submitPayment({
        playerId: testPlayer.user.id,
        tenantId: 'tenant_addis',
        drawId: 'draw_test_closed_999',
        numbers: [1],
        transactionReference: `TXN-CLOSED-${Date.now()}`,
      });
    } catch (err: any) {
      closedCaught = true;
      if (!err.message.includes('CLOSED')) {
        throw new Error(`Unexpected error message: ${err.message}`);
      }
    }

    if (!closedCaught) throw new Error('Payment submission on closed draw was not blocked!');
  });

  // Test 10: Unauthorized tenant access / Tenant isolation
  await test('Tenant isolation: blocks access to draws from another tenant', async () => {
    // Attempting to query draw_round_001 (which belongs to tenant_addis) with tenant_hawassa
    const draw = await drawService.getDrawById('draw_round_001', 'tenant_hawassa');
    if (draw !== null) {
      throw new Error('Tenant isolation breach: tenant_hawassa accessed tenant_addis draw!');
    }
  });

  // Test 11: Result access & sensitive data masking
  await test('Result access: masks player phone numbers and returns public winner details', async () => {
    const winners = await winnerService.getPublicWinners('tenant_addis', 5);
    if (!winners || winners.length === 0) throw new Error('Expected at least one public winner');

    for (const w of winners) {
      if (!w.formattedNumber || !w.prizeAmount || !w.drawTitle) {
        throw new Error('Missing expected public winner attributes');
      }
      if (w.playerPhoneMasked && !w.playerPhoneMasked.includes('****')) {
        throw new Error('Sensitive player phone number was not masked!');
      }
    }
  });

  resetTestNumbers();
  return results;
}
