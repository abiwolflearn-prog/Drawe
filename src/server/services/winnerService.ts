import { WinnerModel } from '../../models/Winner.js';
import { isFallbackStore } from '../../db/connect.js';
import { memoryWinners } from '../store.js';

export class WinnerService {
  /**
   * Get public winners safely without leaking sensitive personal/payment details
   */
  async getPublicWinners(tenantId?: string, limit: number = 10): Promise<any[]> {
    if (!isFallbackStore()) {
      try {
        const query: any = {};
        if (tenantId) query.tenantId = tenantId;
        const winners = await WinnerModel.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();
        if (winners && winners.length > 0) {
          return winners.map(w => this.sanitizeWinner(w));
        }
      } catch (err) {
        // Fallback
      }
    }

    let filtered = memoryWinners;
    if (tenantId) {
      filtered = memoryWinners.filter(w => w.tenantId === tenantId);
    }
    return filtered.slice(0, limit).map(w => this.sanitizeWinner(w));
  }

  /**
   * Mask player phone and private details for public consumption
   */
  private sanitizeWinner(w: any) {
    let maskedPhone = '';
    if (w.playerPhone) {
      const clean = String(w.playerPhone);
      maskedPhone = clean.length > 4 ? `${clean.slice(0, 4)}****${clean.slice(-2)}` : '****';
    }

    return {
      id: w._id?.toString() || w.id,
      tenantId: w.tenantId?.toString() || w.tenantId,
      drawId: w.drawId?.toString() || w.drawId,
      drawTitle: w.drawTitle || 'Community Draw',
      drawNumber: w.drawNumber || 1,
      position: w.position || 1,
      label: w.label || '1st Winner',
      number: w.number,
      formattedNumber: w.formattedNumber || String(w.number).padStart(2, '0'),
      playerName: w.playerName || 'Verified Player',
      playerPhoneMasked: maskedPhone,
      prizeAmount: w.prizeAmount,
      currency: w.currency || 'ETB',
      drawnAt: w.drawnAt || w.createdAt,
    };
  }
}

export const winnerService = new WinnerService();
