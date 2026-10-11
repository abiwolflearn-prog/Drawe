import { DrawModel } from '../../models/Draw.js';
import { DrawNumberModel } from '../../models/DrawNumber.js';
import { isFallbackStore } from '../../db/connect.js';
import { defaultDraw, defaultNumbersMap, buildNumbersMapForCapacity } from '../store.js';
import { formatEntryNumber, IDraw } from '../../types/index.js';

// Cache in-memory numbers maps per draw
export const drawNumbersCache = new Map<string, Map<number, any>>([
  [defaultDraw._id, defaultNumbersMap],
  ['draw_round_001', defaultNumbersMap],
]);

// Cache in-memory draws for multi-tenant support during development/fallback
export const memoryDraws: Map<string, IDraw> = new Map([
  [defaultDraw._id, defaultDraw],
  [
    'draw_round_hawassa_01',
    {
      ...defaultDraw,
      _id: 'draw_round_hawassa_01',
      id: 'draw_round_hawassa_01',
      tenantId: 'tenant_hawassa',
      name: 'Round #001 — Hawassa Lake Draw',
      title: 'Round #001 — Hawassa Lake Draw',
      capacity: 80,
      pricePerNumber: 100,
      prizes: [
        { position: 1, label: '1st Winner (🥇 1ኛ አሸናፊ)', amount: 5000, currency: 'ETB' },
        { position: 2, label: '2nd Winner (🥈 2ኛ አሸናፊ)', amount: 2000, currency: 'ETB' },
      ],
    },
  ],
  [
    'draw_round_dire_01',
    {
      ...defaultDraw,
      _id: 'draw_round_dire_01',
      id: 'draw_round_dire_01',
      tenantId: 'tenant_dire',
      name: 'Round #001 — Dire Dawa Express',
      title: 'Round #001 — Dire Dawa Express',
      capacity: 50,
      pricePerNumber: 40,
      prizes: [
        { position: 1, label: '1st Winner (🥇 1ኛ አሸናፊ)', amount: 1500, currency: 'ETB' },
      ],
    },
  ],
  [
    'draw_capacity_250',
    {
      ...defaultDraw,
      _id: 'draw_capacity_250',
      id: 'draw_capacity_250',
      tenantId: 'tenant_addis',
      name: 'Special Round — 250 Entries',
      title: 'Special Round — 250 Entries',
      capacity: 250,
      pricePerNumber: 50,
      prizes: [
        { position: 1, label: '1st Winner (🥇 1ኛ አሸናፊ)', amount: 6000, currency: 'ETB' },
        { position: 2, label: '2nd Winner (🥈 2ኛ አሸናፊ)', amount: 2500, currency: 'ETB' },
        { position: 3, label: '3rd Winner (🥉 3ኛ አሸናፊ)', amount: 1000, currency: 'ETB' },
      ],
    },
  ],
  [
    'draw_capacity_500',
    {
      ...defaultDraw,
      _id: 'draw_capacity_500',
      id: 'draw_capacity_500',
      tenantId: 'tenant_addis',
      name: 'Mega Draw — 500 Entries',
      title: 'Mega Draw — 500 Entries',
      capacity: 500,
      pricePerNumber: 50,
      prizes: [
        { position: 1, label: '1st Winner (🥇 1ኛ አሸናፊ)', amount: 12000, currency: 'ETB' },
        { position: 2, label: '2nd Winner (🥈 2ኛ አሸናፊ)', amount: 5000, currency: 'ETB' },
      ],
    },
  ],
  [
    'draw_capacity_1000',
    {
      ...defaultDraw,
      _id: 'draw_capacity_1000',
      id: 'draw_capacity_1000',
      tenantId: 'tenant_addis',
      name: 'Grand SaaS Draw — 1000 Entries',
      title: 'Grand SaaS Draw — 1000 Entries',
      capacity: 1000,
      pricePerNumber: 50,
      prizes: [
        { position: 1, label: '1st Winner (🥇 1ኛ አሸናፊ)', amount: 25000, currency: 'ETB' },
        { position: 2, label: '2nd Winner (🥈 2ኛ አሸናፊ)', amount: 10000, currency: 'ETB' },
        { position: 3, label: '3rd Winner (🥉 3ኛ አሸናፊ)', amount: 5000, currency: 'ETB' },
      ],
    },
  ],
]);

export class DrawService {
  /**
   * Get current active draw for a specific tenant
   */
  async getActiveDraw(tenantId?: string): Promise<any | null> {
    const targetTenant = tenantId || 'tenant_addis';

    if (!isFallbackStore()) {
      try {
        const draw = await DrawModel.findOne({
          tenantId: targetTenant,
          status: 'OPEN',
        })
          .sort({ createdAt: -1 })
          .lean();
        if (draw) return draw;
      } catch (err) {
        // Fallback
      }
    }

    // Check memory draws
    for (const d of memoryDraws.values()) {
      if (d.tenantId === targetTenant && d.status === 'OPEN') {
        return d;
      }
    }

    // Default fallback
    if (defaultDraw.tenantId === targetTenant) {
      return defaultDraw;
    }

    // Create a mock active draw if tenant exists
    const fallbackDraw: IDraw = {
      ...defaultDraw,
      _id: `draw_${targetTenant}_01`,
      id: `draw_${targetTenant}_01`,
      tenantId: targetTenant,
      name: `Active Community Draw (${targetTenant})`,
      title: `Active Community Draw`,
      status: 'OPEN',
    };
    memoryDraws.set(fallbackDraw._id, fallbackDraw);
    return fallbackDraw;
  }

  /**
   * Find draw by ID with optional tenant isolation check
   */
  async getDrawById(drawId: string, tenantId?: string): Promise<any | null> {
    if (!drawId) return null;

    if (!isFallbackStore()) {
      try {
        const query: any = { _id: drawId };
        if (tenantId) query.tenantId = tenantId;
        const draw = await DrawModel.findOne(query).lean();
        if (draw) return draw;
      } catch (err) {
        // Fallback
      }
    }

    const draw = memoryDraws.get(drawId) || (defaultDraw._id === drawId || defaultDraw.id === drawId ? defaultDraw : null);
    if (!draw) return null;
    if (tenantId && draw.tenantId !== tenantId) {
      return null; // Tenant isolation mismatch
    }
    return draw;
  }

  /**
   * Retrieve numbers map object for a draw
   */
  async getDrawNumbersMap(drawId: string, tenantId?: string): Promise<Map<number, any>> {
    const draw = await this.getDrawById(drawId, tenantId);
    const resolvedId = draw?._id || drawId;

    if (drawNumbersCache.has(resolvedId)) {
      return drawNumbersCache.get(resolvedId)!;
    }

    const capacity = draw?.capacity || 100;
    const drawTenant = draw?.tenantId || tenantId || 'tenant_addis';
    const dynamicMap = buildNumbersMapForCapacity(resolvedId, drawTenant, capacity);
    drawNumbersCache.set(resolvedId, dynamicMap);
    return dynamicMap;
  }

  /**
   * Retrieve number grid map array for a draw
   */
  async getDrawNumbers(drawId: string, tenantId?: string): Promise<any[]> {
    const draw = await this.getDrawById(drawId, tenantId);
    if (!draw) return [];

    if (!isFallbackStore()) {
      try {
        const numbers = await DrawNumberModel.find({ drawId: draw._id }).sort({ number: 1 }).lean();
        if (numbers && numbers.length > 0) return numbers;
      } catch (err) {
        // Fallback
      }
    }

    const map = await this.getDrawNumbersMap(draw._id || draw.id, draw.tenantId);
    return Array.from(map.values());
  }

  /**
   * Formats draw safely for public/Telegram consumption
   */
  getPublicDrawDetails(draw: any) {
    if (!draw) return null;
    return {
      id: draw._id?.toString() || draw.id,
      tenantId: draw.tenantId?.toString() || draw.tenantId,
      title: draw.title || draw.name,
      drawNumber: draw.drawNumber || 1,
      capacity: draw.capacity || 100,
      pricePerNumber: draw.pricePerNumber || 50,
      currency: draw.currency || 'ETB',
      status: draw.status,
      startAt: draw.startAt,
      closeAt: draw.closeAt,
      prizes: draw.prizes || [],
      serverSeedHash: draw.serverSeedHash,
      winnerNumber: draw.status === 'COMPLETED' ? draw.winnerNumber : null,
      winnerNumbers: draw.status === 'COMPLETED' ? draw.winnerNumbers : undefined,
    };
  }
}

export const drawService = new DrawService();
