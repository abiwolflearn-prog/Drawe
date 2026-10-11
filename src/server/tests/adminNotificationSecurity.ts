import { paymentService, memoryPayments } from '../services/paymentService.js';
import { playerService } from '../services/playerService.js';
import { tenantService } from '../services/tenantService.js';
import { drawService } from '../services/drawService.js';
import { telegramService } from '../services/telegramService.js';
import { memoryAuditLogs } from '../store.js';

export interface AdminTestResult {
  name: string;
  passed: boolean;
  message: string;
}

export async function runAdminNotificationSecurityTests(): Promise<AdminTestResult[]> {
  const results: AdminTestResult[] = [];

  const test = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      results.push({ name, passed: true, message: 'Passed' });
    } catch (err: any) {
      results.push({ name, passed: false, message: err.message || 'Failed' });
    }
  };

  // Test 1: Admin Telegram Chat resolution for tenant
  await test('Admin chat resolution: resolves configured admin Telegram ID for tenant', async () => {
    const addisChat = await tenantService.getTenantAdminTelegramChat('tenant_addis');
    if (addisChat !== '77700001') {
      throw new Error(`Expected admin chat 77700001 for tenant_addis, got: ${addisChat}`);
    }

    const hawassaChat = await tenantService.getTenantAdminTelegramChat('tenant_hawassa');
    if (hawassaChat !== '77700002') {
      throw new Error(`Expected admin chat 77700002 for tenant_hawassa, got: ${hawassaChat}`);
    }
  });

  // Test 2: Admin user mapping by Telegram ID
  await test('Admin user mapping: maps Telegram user ID to platform ADMIN user', async () => {
    const adminUser = await playerService.findUserByTelegramId('77700001');
    if (!adminUser) throw new Error('Failed to find admin user for Telegram ID 77700001');
    if (adminUser.role !== 'ADMIN') throw new Error(`Expected role ADMIN, got ${adminUser.role}`);
    if (adminUser.tenantId !== 'tenant_addis') throw new Error(`Expected tenant_addis, got ${adminUser.tenantId}`);
  });

  // Test 3: Authorized Admin Payment Approval
  await test('Admin approval: approves payment, confirms numbers, creates audit log', async () => {
    const player = await playerService.findOrCreateTelegramUser({ id: 99001122, first_name: 'BuyerTest' });
    const ref = `TXN-APPR-${Date.now()}`;

    // Reset cell 72
    const numbersMap = await drawService.getDrawNumbersMap('draw_round_001', 'tenant_addis');
    const cell72 = numbersMap.get(72);
    if (cell72) {
      cell72.status = 'AVAILABLE';
      cell72.selectedBy = undefined;
    }

    const submitted = await paymentService.submitPayment({
      playerId: player.user.id,
      tenantId: 'tenant_addis',
      drawId: 'draw_round_001',
      numbers: [72],
      transactionReference: ref,
    });

    const adminUser = await playerService.findUserByTelegramId('77700001'); // Addis Admin
    const approved = await paymentService.approvePayment(submitted.payment._id, adminUser);

    if (approved.status !== 'APPROVED') {
      throw new Error(`Expected status APPROVED, got ${approved.status}`);
    }

    const updatedCell72 = numbersMap.get(72);
    if (updatedCell72?.status !== 'CONFIRMED') {
      throw new Error(`Expected number 72 to be CONFIRMED, got ${updatedCell72?.status}`);
    }

    const audit = memoryAuditLogs.find(a => a.entityId === submitted.payment._id && a.action === 'APPROVE_PAYMENT');
    if (!audit) {
      throw new Error('Audit log for APPROVE_PAYMENT was not created');
    }

    // Cleanup
    if (cell72) {
      cell72.status = 'AVAILABLE';
      cell72.selectedBy = undefined;
    }
  });

  // Test 4: Tenant Isolation Enforcement (Admin A cannot approve Tenant B payment)
  await test('Tenant Isolation: Admin A (Addis) cannot approve Tenant B (Hawassa) payment', async () => {
    const player = await playerService.findOrCreateTelegramUser({ id: 99003344, first_name: 'HawassaBuyer' });
    const ref = `TXN-HAWASSA-${Date.now()}`;

    // Submit payment to Hawassa tenant
    const submitted = await paymentService.submitPayment({
      playerId: player.user.id,
      tenantId: 'tenant_hawassa',
      drawId: 'draw_round_hawassa_01',
      numbers: [1],
      transactionReference: ref,
    });

    const addisAdmin = await playerService.findUserByTelegramId('77700001'); // Addis Admin
    let isolationBlocked = false;

    try {
      await paymentService.approvePayment(submitted.payment._id, addisAdmin);
    } catch (err: any) {
      isolationBlocked = true;
      if (!err.message.includes('Tenant Isolation')) {
        throw new Error(`Unexpected error message: ${err.message}`);
      }
    }

    if (!isolationBlocked) {
      throw new Error('Tenant isolation breach! Addis Admin approved Hawassa payment.');
    }
  });

  // Test 5: Role Security (Non-admin cannot approve payment)
  await test('Role Security: non-admin player cannot approve payment', async () => {
    const regularPlayer = await playerService.findOrCreateTelegramUser({ id: 99005566, first_name: 'RegularPlayer' });
    const payment = memoryPayments[0];

    let unauthorizedBlocked = false;
    try {
      await paymentService.approvePayment(payment._id, regularPlayer.user);
    } catch (err: any) {
      unauthorizedBlocked = true;
      if (!err.message.includes('Admin role required')) {
        throw new Error(`Unexpected error message: ${err.message}`);
      }
    }

    if (!unauthorizedBlocked) {
      throw new Error('Non-admin player was allowed to approve payment!');
    }
  });

  // Test 6: Rejection releases numbers and creates audit log
  await test('Admin rejection: releases numbers back to AVAILABLE and creates audit log', async () => {
    const player = await playerService.findOrCreateTelegramUser({ id: 99007788, first_name: 'Rejectee' });
    const ref = `TXN-REJC-${Date.now()}`;

    // Reset cell 73
    const numbersMap = await drawService.getDrawNumbersMap('draw_round_001', 'tenant_addis');
    const cell73 = numbersMap.get(73);
    if (cell73) {
      cell73.status = 'AVAILABLE';
      cell73.selectedBy = undefined;
    }

    const submitted = await paymentService.submitPayment({
      playerId: player.user.id,
      tenantId: 'tenant_addis',
      drawId: 'draw_round_001',
      numbers: [73],
      transactionReference: ref,
    });

    const adminUser = await playerService.findUserByTelegramId('77700001');
    const rejected = await paymentService.rejectPayment(submitted.payment._id, 'Invalid receipt reference', adminUser);

    if (rejected.status !== 'REJECTED') {
      throw new Error(`Expected status REJECTED, got ${rejected.status}`);
    }

    const releasedCell73 = numbersMap.get(73);
    if (releasedCell73?.status !== 'AVAILABLE') {
      throw new Error(`Expected cell 73 to be released to AVAILABLE, got ${releasedCell73?.status}`);
    }

    const audit = memoryAuditLogs.find(a => a.entityId === submitted.payment._id && a.action === 'REJECT_PAYMENT');
    if (!audit) {
      throw new Error('Audit log for REJECT_PAYMENT was not created');
    }
  });

  // Test 7: Telegram Webhook Callback Query Security (adm_appr handler)
  await test('Telegram Webhook: adm_appr callback handles authorization and isolation', async () => {
    const payment = memoryPayments[0]; // Addis payment

    // Simulated callback query from Addis Admin (77700001)
    const validApprovalUpdate = {
      callback_query: {
        id: 'cq_valid_appr',
        message: { chat: { id: 77700001 } },
        from: { id: 77700001, first_name: 'AddisAdmin' },
        data: `adm_appr:${payment._id}`,
      },
    };

    const response = await telegramService.handleUpdate(validApprovalUpdate);
    if (!response || !response.text.includes('ጸድቋል')) {
      throw new Error(`Expected approval message, got: ${JSON.stringify(response)}`);
    }

    // Simulated callback query from an unauthorized non-admin user (88888888)
    const unauthorizedUpdate = {
      callback_query: {
        id: 'cq_unauth',
        message: { chat: { id: 88888888 } },
        from: { id: 88888888, first_name: 'Hacker' },
        data: `adm_appr:${payment._id}`,
      },
    };

    const unauthResponse = await telegramService.handleUpdate(unauthorizedUpdate);
    if (!unauthResponse || !unauthResponse.text.includes('ያልተፈቀደ')) {
      throw new Error(`Expected unauthorized rejection, got: ${JSON.stringify(unauthResponse)}`);
    }
  });

  return results;
}
