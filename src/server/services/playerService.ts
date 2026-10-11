import { UserModel } from '../../models/User.js';
import { PlayerMembershipModel } from '../../models/PlayerMembership.js';
import { isFallbackStore } from '../../db/connect.js';
import { generateToken } from '../middleware/auth.js';
import { tenantService } from './tenantService.js';
import { memoryPlayerMemberships } from '../store.js';
import { memoryUsers } from '../routes/auth.js';
import bcrypt from 'bcryptjs';

// In-memory fallback player store when MongoDB is not connected
export const memoryPlayers: any[] = [
  {
    _id: 'usr_player_01',
    id: 'usr_player_01',
    tenantId: 'tenant_addis',
    name: 'Sample Player',
    email: 'player@draw.com',
    phone: '+251911002233',
    telegramUserId: '12345678',
    role: 'PLAYER',
    status: 'ACTIVE',
    language: 'am',
    createdAt: new Date().toISOString(),
  },
];

export class PlayerService {
  /**
   * Find or create user mapped from verified Telegram account
   * Securely maps: telegramUserId -> User -> PlayerMembership -> Tenant
   */
  async findOrCreateTelegramUser(
    tgUser: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    },
    requestedTenantId?: string
  ): Promise<{ user: any; token: string; activeTenantId: string; memberships: any[] }> {
    const tgIdStr = String(tgUser.id);
    const fullName = `${tgUser.first_name || ''}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`.trim() || 'Telegram Player';
    const tgUsername = tgUser.username ? `@${tgUser.username}` : undefined;
    const preferredLang = tgUser.language_code === 'en' ? 'en' : 'am';

    let user: any = null;

    if (!isFallbackStore()) {
      try {
        user = await UserModel.findOne({ telegramUserId: tgIdStr }).lean();
        if (!user) {
          // Check by email placeholder
          const placeholderEmail = `tg_${tgIdStr}@telegram.draw`;
          const dummyHash = await bcrypt.hash(`tg_secret_${tgIdStr}_${Date.now()}`, 8);

          const created = await UserModel.create({
            name: fullName,
            email: placeholderEmail,
            phone: '',
            passwordHash: dummyHash,
            telegramUserId: tgIdStr,
            role: 'PLAYER',
            status: 'ACTIVE',
            language: preferredLang,
          });
          user = created.toObject();
        }
      } catch (err) {
        console.warn('[PlayerService] MongoDB user query error, using fallback:', err);
      }
    }

    if (!user) {
      user = memoryPlayers.find(p => p.telegramUserId === tgIdStr);
      if (!user) {
        user = {
          _id: `usr_tg_${tgIdStr}`,
          id: `usr_tg_${tgIdStr}`,
          name: fullName,
          email: `tg_${tgIdStr}@telegram.draw`,
          phone: '',
          telegramUserId: tgIdStr,
          telegramUsername: tgUsername,
          role: 'PLAYER',
          status: 'ACTIVE',
          language: preferredLang,
          createdAt: new Date().toISOString(),
        };
        memoryPlayers.push(user);
      }
    }

    // Determine target tenant: validate requestedTenantId or default to tenant_addis
    let targetTenantId = 'tenant_addis';
    if (requestedTenantId) {
      const validTenant = await tenantService.getTenantById(requestedTenantId);
      if (validTenant && validTenant.status === 'ACTIVE') {
        targetTenantId = validTenant._id || validTenant.id;
      }
    }

    // Ensure player membership exists for target tenant
    await this.joinTenant(user._id || user.id, targetTenantId);

    // Retrieve all active memberships for player
    const memberships = await this.getPlayerMemberships(user._id || user.id);

    // Generate authoritative JWT token
    const token = generateToken({
      id: user._id?.toString() || user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'PLAYER',
      tenantId: targetTenantId,
    });

    return {
      user: {
        id: user._id?.toString() || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'PLAYER',
        telegramUserId: tgIdStr,
        telegramUsername: tgUsername,
        language: user.language || preferredLang,
        tenantId: targetTenantId,
      },
      token,
      activeTenantId: targetTenantId,
      memberships,
    };
  }

  /**
   * Get all active memberships for a player
   */
  async getPlayerMemberships(playerId: string): Promise<any[]> {
    if (!playerId) return [];

    if (!isFallbackStore()) {
      try {
        const mems = await PlayerMembershipModel.find({
          playerId,
          status: 'ACTIVE',
        }).lean();
        if (mems && mems.length > 0) return mems;
      } catch (err) {
        // Fallback
      }
    }

    return memoryPlayerMemberships.filter(
      m => m.playerId === playerId && m.status === 'ACTIVE'
    );
  }

  /**
   * Verify if player has access to tenant
   */
  async hasTenantMembership(playerId: string, tenantId: string): Promise<boolean> {
    if (!playerId || !tenantId) return false;

    if (!isFallbackStore()) {
      try {
        const mem = await PlayerMembershipModel.findOne({
          playerId,
          tenantId,
          status: 'ACTIVE',
        }).lean();
        if (mem) return true;
      } catch (err) {
        // Fallback
      }
    }

    const found = memoryPlayerMemberships.find(
      m => m.playerId === playerId && (m.tenantId === tenantId || m.tenantId === 'tenant_addis') && m.status === 'ACTIVE'
    );
    return !!found;
  }

  /**
   * Enroll player into tenant
   */
  async joinTenant(playerId: string, tenantId: string): Promise<any> {
    if (!playerId || !tenantId) return null;

    if (!isFallbackStore()) {
      try {
        const existing = await PlayerMembershipModel.findOne({ playerId, tenantId });
        if (existing) {
          if (existing.status !== 'ACTIVE') {
            existing.status = 'ACTIVE';
            await existing.save();
          }
          return existing.toObject();
        }

        const created = await PlayerMembershipModel.create({
          playerId,
          tenantId,
          status: 'ACTIVE',
          joinedAt: new Date().toISOString(),
        });
        return created.toObject();
      } catch (err) {
        // Fallback
      }
    }

    const existingMem = memoryPlayerMemberships.find(
      m => m.playerId === playerId && m.tenantId === tenantId
    );
    if (existingMem) {
      existingMem.status = 'ACTIVE';
      return existingMem;
    }

    const newMem = {
      _id: `mem_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      playerId,
      tenantId,
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryPlayerMemberships.push(newMem);
    return newMem;
  }

  /**
   * Find player or admin user by internal user ID
   */
  async getPlayerById(playerId: string): Promise<any | null> {
    if (!playerId) return null;

    if (!isFallbackStore()) {
      try {
        const user = await UserModel.findById(playerId).lean();
        if (user) return user;
      } catch (err) {
        // Fallback
      }
    }

    const foundInUsers = memoryUsers.find(u => u._id === playerId || u.id === playerId);
    if (foundInUsers) return foundInUsers;

    const found = memoryPlayers.find(p => p._id === playerId || p.id === playerId);
    return found || null;
  }

  /**
   * Look up platform user (Admin or Player) by mapped Telegram user ID
   */
  async findUserByTelegramId(telegramUserId: string): Promise<any | null> {
    if (!telegramUserId) return null;
    const tgStr = String(telegramUserId);

    if (!isFallbackStore()) {
      try {
        const user = await UserModel.findOne({ telegramUserId: tgStr }).lean();
        if (user) return user;
      } catch (err) {
        // Fallback
      }
    }

    const foundInUsers = memoryUsers.find(u => String(u.telegramUserId) === tgStr);
    if (foundInUsers) return foundInUsers;

    const foundInPlayers = memoryPlayers.find(p => String(p.telegramUserId) === tgStr);
    return foundInPlayers || null;
  }
}

export const playerService = new PlayerService();
