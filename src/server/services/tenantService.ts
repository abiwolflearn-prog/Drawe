import { TenantModel, ITenant } from '../../models/Tenant.js';
import { isFallbackStore } from '../../db/connect.js';
import { memoryTenants } from '../routes/superAdmin.js';

export class TenantService {
  /**
   * Retrieve all active public tenants for discovery
   */
  async getAllTenants(): Promise<any[]> {
    if (!isFallbackStore()) {
      try {
        const tenants = await TenantModel.find({ status: 'ACTIVE', isPublic: true }).lean();
        if (tenants && tenants.length > 0) return tenants;
      } catch (err) {
        console.warn('[TenantService] Failed to fetch from MongoDB, falling back to memoryTenants', err);
      }
    }
    return memoryTenants.filter(t => t.status === 'ACTIVE');
  }

  /**
   * Find tenant by ID or slug
   */
  async getTenantById(tenantId: string): Promise<any | null> {
    if (!tenantId) return null;

    if (!isFallbackStore()) {
      try {
        const tenant = await TenantModel.findOne({
          $or: [{ _id: tenantId }, { slug: tenantId }, { id: tenantId }],
        }).lean();
        if (tenant) return tenant;
      } catch (err) {
        // Fallback to memory
      }
    }

    const found = memoryTenants.find(
      t => t._id === tenantId || t.id === tenantId || t.slug === tenantId
    );
    return found || null;
  }

  /**
   * Find tenant by slug
   */
  async getTenantBySlug(slug: string): Promise<any | null> {
    if (!slug) return null;

    if (!isFallbackStore()) {
      try {
        const tenant = await TenantModel.findOne({ slug: slug.toLowerCase() }).lean();
        if (tenant) return tenant;
      } catch (err) {
        // Fallback to memory
      }
    }

    const found = memoryTenants.find(t => t.slug === slug.toLowerCase());
    return found || null;
  }

  /**
   * Validate that tenant exists and is active
   */
  async validateTenantAccess(tenantId: string): Promise<any> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    if (tenant.status !== 'ACTIVE') {
      throw new Error('Operator community is currently suspended');
    }
    return tenant;
  }

  /**
   * Resolve configured Telegram admin chat ID for a specific tenant
   */
  async getTenantAdminTelegramChat(tenantId: string): Promise<string | null> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) return null;

    if (tenant.adminTelegramChatId) {
      return String(tenant.adminTelegramChatId);
    }

    if (tenant.ownerAdminId) {
      const adminUser = memoryTenants.find(t => t.ownerAdminId === tenant.ownerAdminId);
      if (adminUser?.adminTelegramChatId) {
        return String(adminUser.adminTelegramChatId);
      }
    }

    return process.env.ADMIN_TELEGRAM_CHAT_ID || null;
  }
}

export const tenantService = new TenantService();
