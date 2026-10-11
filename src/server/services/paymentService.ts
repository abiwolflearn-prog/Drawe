import { PaymentModel } from '../../models/Payment.js';
import { AuditLogModel } from '../../models/AuditLog.js';
import { isFallbackStore } from '../../db/connect.js';
import { playerService } from './playerService.js';
import { drawService } from './drawService.js';
import { tenantService } from './tenantService.js';
import { defaultNumbersMap, defaultDraw, memoryAuditLogs } from '../store.js';
import { broadcastNumberUpdate } from '../socket.js';
import { IPayment, formatEntryNumber } from '../../types/index.js';

// Global shared memory store for payments during fallback / testing
export const memoryPayments: IPayment[] = [
  {
    _id: 'pay_1001',
    id: 'pay_1001',
    playerId: 'usr_player_01',
    playerName: 'Sample Player',
    playerPhone: '+251911002233',
    tenantId: 'tenant_addis',
    drawId: 'draw_round_001',
    drawTitle: 'Round #001 — Addis Community Draw',
    selectionId: 'sel_1001',
    numbers: [19, 54],
    unitPrice: 50,
    amount: 100,
    method: 'TELEBIRR',
    transactionReference: 'TXN-984720192',
    screenshotUrl: '',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

export interface SubmitPaymentInput {
  playerId: string;
  tenantId: string;
  drawId: string;
  numbers: number[];
  method?: string;
  transactionReference: string;
  screenshotUrl?: string;
}

export class PaymentService {
  /**
   * Submit direct operator payment with complete business rule validation
   */
  async submitPayment(input: SubmitPaymentInput): Promise<{
    payment: any;
    draw: any;
    unitPrice: number;
    amount: number;
    quantity: number;
  }> {
    const { playerId, tenantId, drawId, numbers, method, transactionReference, screenshotUrl } = input;

    // 1. Verify authenticated player
    if (!playerId) {
      throw new Error('Unauthorized: Authenticated player identity is required');
    }
    const player = await playerService.getPlayerById(playerId);
    if (!player) {
      throw new Error('Player account not found');
    }

    // 2. Verify tenant membership
    const hasMembership = await playerService.hasTenantMembership(playerId, tenantId);
    if (!hasMembership) {
      // Auto-join if tenant is active
      const tenant = await tenantService.validateTenantAccess(tenantId);
      await playerService.joinTenant(playerId, tenant._id || tenant.id);
    }

    // 3. Verify draw belongs to tenant
    const draw = await drawService.getDrawById(drawId, tenantId);
    if (!draw) {
      throw new Error('Draw not found or does not belong to the selected operator');
    }

    // 4. Verify draw is OPEN
    if (draw.status !== 'OPEN') {
      throw new Error(`Draw is currently ${draw.status}. Selections are only allowed when OPEN.`);
    }

    // 5. Verify numbers format and bounds
    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      throw new Error('Please select at least one number');
    }
    const capacity = draw.capacity || 100;
    const uniqueNumbers = Array.from(new Set(numbers));
    if (uniqueNumbers.length !== numbers.length) {
      throw new Error('Duplicate numbers found in selection');
    }

    for (const num of uniqueNumbers) {
      if (!Number.isInteger(num) || num < 1 || num > capacity) {
        throw new Error(`Invalid number ${num}. Must be an integer between 1 and ${capacity}`);
      }
    }

    // 6. Check transaction reference validity
    const cleanRef = (transactionReference || '').trim();
    if (!cleanRef || cleanRef.length < 4) {
      throw new Error('A valid transaction reference number (minimum 4 characters) is required');
    }

    // 7. Prevent duplicate transactionReference across all payments
    const isDuplicate = await this.isReferenceDuplicate(cleanRef, draw._id || draw.id);
    if (isDuplicate) {
      throw new Error('Duplicate payment reference: This reference ID has already been submitted');
    }

    const numbersMap = await drawService.getDrawNumbersMap(draw._id || draw.id, tenantId);

    // 8. Verify selected numbers are still available (prevent collision)
    for (const num of uniqueNumbers) {
      const cell = numbersMap.get(num);
      if (cell && (cell.status === 'CONFIRMED' || cell.status === 'PAYMENT_PENDING' || cell.status === 'WINNER')) {
        throw new Error(`ይቅርታ፣ ቁጥር ${num} በሌላ ተጠቃሚ ተይዟል።`);
      }
    }

    // 9. Server-Side Authoritative Pricing Recalculation
    const unitPrice = draw.pricePerNumber || 50;
    const recalculatedTotal = uniqueNumbers.length * unitPrice;

    // 10. Update number states to PAYMENT_PENDING and broadcast
    for (const num of uniqueNumbers) {
      const cell = numbersMap.get(num);
      if (cell) {
        cell.status = 'PAYMENT_PENDING';
        cell.selectedBy = { id: playerId, name: player.name };
        broadcastNumberUpdate(draw._id || draw.id, num, 'PAYMENT_PENDING', cell.selectedBy);
      }
    }

    // 11. Create Payment record
    const paymentPayload: any = {
      _id: `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      id: `pay_${Date.now()}`,
      playerId,
      playerName: player.name,
      playerPhone: player.phone || '',
      tenantId,
      drawId: draw._id || draw.id,
      drawTitle: draw.title || draw.name,
      selectionId: `sel_${Date.now()}`,
      numbers: uniqueNumbers,
      unitPrice,
      amount: recalculatedTotal,
      method: (method as any) || 'TELEBIRR',
      transactionReference: cleanRef,
      screenshotUrl: screenshotUrl || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!isFallbackStore()) {
      try {
        await PaymentModel.create(paymentPayload);
      } catch (err) {
        console.warn('[PaymentService] Failed to persist payment to MongoDB, using memory:', err);
      }
    }

    memoryPayments.unshift(paymentPayload);

    // 12. Create Audit Log record
    const auditRecord = {
      _id: `audit_${Date.now()}`,
      tenantId,
      actorId: playerId,
      actorName: player.name,
      action: 'SUBMIT_PAYMENT',
      entityType: 'PAYMENT',
      entityId: paymentPayload._id,
      metadata: {
        numbers: uniqueNumbers,
        amount: recalculatedTotal,
        unitPrice,
        ref: cleanRef,
      },
      createdAt: new Date().toISOString(),
    };

    if (!isFallbackStore()) {
      try {
        await AuditLogModel.create(auditRecord);
      } catch (err) {
        // Fallback
      }
    }
    memoryAuditLogs.unshift(auditRecord);

    // 13. Notify tenant operator/admin on Telegram with approval buttons
    try {
      await this.notifyTenantAdminNewPayment(paymentPayload, draw);
    } catch (err) {
      console.warn('[PaymentService] Failed to send Telegram admin notification:', err);
    }

    return {
      payment: paymentPayload,
      draw,
      unitPrice,
      amount: recalculatedTotal,
      quantity: uniqueNumbers.length,
    };
  }

  /**
   * Send new payment notification to the tenant's admin Telegram chat
   */
  async notifyTenantAdminNewPayment(payment: any, draw: any): Promise<void> {
    const adminChatId = await tenantService.getTenantAdminTelegramChat(payment.tenantId);
    if (!adminChatId) {
      return;
    }

    const { telegramService } = await import('./telegramService.js');
    const capacity = draw.capacity || 100;
    const formattedNumbers = (payment.numbers || [])
      .map((n: number) => formatEntryNumber(n, capacity))
      .join(', ');

    const messageText =
      `💳 **አዲስ የክፍያ ማረጋገጫ**\n\n` +
      `**ተጫዋች:** ${payment.playerName}\n` +
      `**ቁጥሮች:** [${formattedNumbers}]\n` +
      `**ብዛት:** ${payment.numbers.length}\n` +
      `**ዋጋ:** ${payment.unitPrice} ETB\n` +
      `**ጠቅላላ:** ${payment.amount} ETB\n` +
      `**የክፍያ ማጣቀሻ:** \`${payment.transactionReference}\`\n\n` +
      `ከታች ያሉትን አዝራሮች በመጫን ክፍያውን ያጽድቁ ወይም ውድቅ ያድርጉ:`;

    const inlineKeyboard = [
      [
        { text: '✅ አጽድቅ', callback_data: `adm_appr:${payment._id}` },
        { text: '❌ አትቀበል', callback_data: `adm_rejc:${payment._id}` },
      ],
    ];

    await telegramService.sendTelegramMessage(adminChatId, messageText, {
      reply_markup: { inline_keyboard: inlineKeyboard },
    });
  }

  /**
   * Notify player on Telegram when their payment is approved or rejected
   */
  async notifyPlayerPaymentStatus(payment: any, newStatus: 'APPROVED' | 'REJECTED'): Promise<void> {
    const player = await playerService.getPlayerById(payment.playerId);
    if (!player || !player.telegramUserId) return;

    const { telegramService } = await import('./telegramService.js');
    const draw = await drawService.getDrawById(payment.drawId);
    const capacity = draw?.capacity || 100;
    const formattedNumbers = (payment.numbers || [])
      .map((n: number) => formatEntryNumber(n, capacity))
      .join(', ');

    let messageText = '';
    if (newStatus === 'APPROVED') {
      messageText =
        `🎉 **የክፍያ ማረጋገጫዎ ጸድቋል!**\n\n` +
        `**የክፍያ ማጣቀሻ:** \`${payment.transactionReference}\`\n` +
        `**የተረጋገጡ ቁጥሮች:** [${formattedNumbers}]\n` +
        `**የክፍያ መጠን:** ${payment.amount} ETB\n` +
        `**ሁኔታ:** ✅ CONFIRMED (የተረጋገጠ)\n\n` +
        `ቁጥሮችዎ በይፋ ለቀጣዩ ዕጣ ተመዝግበዋል! መልካም ዕድል! 🎯`;
    } else {
      messageText =
        `⚠️ **የክፍያ ማረጋገጫዎ ውድቅ ተደርጓል**\n\n` +
        `**የክፍያ ማጣቀሻ:** \`${payment.transactionReference}\`\n` +
        `**ምክንያት:** ${payment.rejectionReason || 'የማጣቀሻ ማረጋገጫ አልተሳካም'}\n` +
        `**ሁኔታ:** ❌ REJECTED (ውድቅ ተደርጓል)\n\n` +
        `የመረጧቸው ቁጥሮች ተለቀዋል። እባክዎ ትክክለኛውን የክፍያ ማረጋገጫ ደረሰኝ በማረጋገጥ እንደገና ይሞክሩ።`;
    }

    await telegramService.sendTelegramMessage(player.telegramUserId, messageText);
  }

  /**
   * Check if a transaction reference is already in use
   */
  async isReferenceDuplicate(reference: string, drawId?: string): Promise<boolean> {
    const clean = reference.trim().toLowerCase();

    if (!isFallbackStore()) {
      try {
        const query: any = {
          transactionReference: { $regex: new RegExp(`^${clean}$`, 'i') },
        };
        const exists = await PaymentModel.findOne(query).lean();
        if (exists) return true;
      } catch (err) {
        // Fallback
      }
    }

    const inMemory = memoryPayments.find(
      p => p.transactionReference.trim().toLowerCase() === clean
    );
    return !!inMemory;
  }

  /**
   * Retrieve payments for a player with optional tenant isolation
   */
  async getPlayerPayments(playerId: string, tenantId?: string): Promise<any[]> {
    if (!playerId) return [];

    if (!isFallbackStore()) {
      try {
        const query: any = { playerId };
        if (tenantId) query.tenantId = tenantId;
        const payments = await PaymentModel.find(query).sort({ createdAt: -1 }).lean();
        if (payments && payments.length > 0) return payments;
      } catch (err) {
        // Fallback
      }
    }

    let filtered = memoryPayments.filter(p => p.playerId === playerId);
    if (tenantId) {
      filtered = filtered.filter(p => p.tenantId === tenantId);
    }
    return filtered;
  }

  /**
   * Find payment by ID
   */
  async getPaymentById(paymentId: string): Promise<any | null> {
    if (!paymentId) return null;

    if (!isFallbackStore()) {
      try {
        const p = await PaymentModel.findById(paymentId).lean();
        if (p) return p;
      } catch (err) {
        // Fallback
      }
    }

    const found = memoryPayments.find(p => p._id === paymentId || p.id === paymentId);
    return found || null;
  }

  /**
   * Authoritative Payment Approval
   * Used by BOTH Web Admin API and Telegram Bot callbacks
   */
  async approvePayment(paymentId: string, adminUser: any): Promise<any> {
    let payment = await this.getPaymentById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'APPROVED') {
      return payment;
    }

    // Security Verification: Role & Tenant Isolation
    if (adminUser) {
      const isSuper = adminUser.role === 'SUPER_ADMIN';
      const isAdmin = adminUser.role === 'ADMIN';

      if (!isSuper && !isAdmin) {
        throw new Error('Unauthorized: Admin role required');
      }

      if (!isSuper && adminUser.tenantId !== payment.tenantId) {
        throw new Error(
          `Tenant Isolation Violation: Admin from "${adminUser.tenantId}" cannot approve payment for "${payment.tenantId}"`
        );
      }
    }

    const verifiedBy = adminUser?.id || adminUser?._id || 'admin';
    const verifiedAt = new Date().toISOString();

    payment.status = 'APPROVED';
    payment.verifiedBy = verifiedBy;
    payment.verifiedAt = verifiedAt;

    if (!isFallbackStore()) {
      try {
        await PaymentModel.updateOne(
          { _id: payment._id },
          { status: 'APPROVED', verifiedBy, verifiedAt }
        );
      } catch (err) {
        // Fallback
      }
    }

    // Confirm numbers in draw's numbers map
    const numbersMap = await drawService.getDrawNumbersMap(payment.drawId, payment.tenantId);
    for (const num of payment.numbers) {
      const cell = numbersMap.get(num);
      if (cell) {
        cell.status = 'CONFIRMED';
        cell.confirmedAt = verifiedAt;
        broadcastNumberUpdate(payment.drawId, num, 'CONFIRMED', cell.selectedBy);
      }
    }

    // Create Audit Log
    const auditRecord = {
      _id: `audit_${Date.now()}`,
      tenantId: payment.tenantId,
      actorId: verifiedBy,
      actorName: adminUser?.name || 'Operator Admin',
      action: 'APPROVE_PAYMENT',
      entityType: 'PAYMENT',
      entityId: payment._id,
      metadata: {
        numbers: payment.numbers,
        amount: payment.amount,
        ref: payment.transactionReference,
      },
      createdAt: verifiedAt,
    };

    if (!isFallbackStore()) {
      try {
        await AuditLogModel.create(auditRecord);
      } catch (err) {
        // Fallback
      }
    }
    memoryAuditLogs.unshift(auditRecord);

    // Notify player on Telegram
    try {
      await this.notifyPlayerPaymentStatus(payment, 'APPROVED');
    } catch (err) {
      console.warn('[PaymentService] Failed to notify player of payment approval:', err);
    }

    return payment;
  }

  /**
   * Authoritative Payment Rejection
   * Used by BOTH Web Admin API and Telegram Bot callbacks
   */
  async rejectPayment(paymentId: string, reason: string, adminUser: any): Promise<any> {
    let payment = await this.getPaymentById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'REJECTED') {
      return payment;
    }

    // Security Verification: Role & Tenant Isolation
    if (adminUser) {
      const isSuper = adminUser.role === 'SUPER_ADMIN';
      const isAdmin = adminUser.role === 'ADMIN';

      if (!isSuper && !isAdmin) {
        throw new Error('Unauthorized: Admin role required');
      }

      if (!isSuper && adminUser.tenantId !== payment.tenantId) {
        throw new Error(
          `Tenant Isolation Violation: Admin from "${adminUser.tenantId}" cannot reject payment for "${payment.tenantId}"`
        );
      }
    }

    const verifiedBy = adminUser?.id || adminUser?._id || 'admin';
    const verifiedAt = new Date().toISOString();
    const rejectionReason = reason || 'Payment reference verification failed';

    payment.status = 'REJECTED';
    payment.rejectionReason = rejectionReason;
    payment.verifiedBy = verifiedBy;
    payment.verifiedAt = verifiedAt;

    if (!isFallbackStore()) {
      try {
        await PaymentModel.updateOne(
          { _id: payment._id },
          { status: 'REJECTED', rejectionReason, verifiedBy, verifiedAt }
        );
      } catch (err) {
        // Fallback
      }
    }

    // Release numbers back to AVAILABLE
    const numbersMap = await drawService.getDrawNumbersMap(payment.drawId, payment.tenantId);
    for (const num of payment.numbers) {
      const cell = numbersMap.get(num);
      if (cell && cell.status === 'PAYMENT_PENDING') {
        cell.status = 'AVAILABLE';
        cell.selectedBy = undefined;
        broadcastNumberUpdate(payment.drawId, num, 'AVAILABLE', undefined);
      }
    }

    // Create Audit Log
    const auditRecord = {
      _id: `audit_${Date.now()}`,
      tenantId: payment.tenantId,
      actorId: verifiedBy,
      actorName: adminUser?.name || 'Operator Admin',
      action: 'REJECT_PAYMENT',
      entityType: 'PAYMENT',
      entityId: payment._id,
      metadata: {
        numbers: payment.numbers,
        reason: rejectionReason,
      },
      createdAt: verifiedAt,
    };

    if (!isFallbackStore()) {
      try {
        await AuditLogModel.create(auditRecord);
      } catch (err) {
        // Fallback
      }
    }
    memoryAuditLogs.unshift(auditRecord);

    // Notify player on Telegram
    try {
      await this.notifyPlayerPaymentStatus(payment, 'REJECTED');
    } catch (err) {
      console.warn('[PaymentService] Failed to notify player of payment rejection:', err);
    }

    return payment;
  }
}

export const paymentService = new PaymentService();
