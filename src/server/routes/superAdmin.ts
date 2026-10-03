import { Router, Request, Response } from 'express';
import { requireSuperAdmin, AuthRequest } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = Router();

// Memory store for Operators / Tenants with rich discovery metadata
export const memoryTenants: any[] = [
  {
    _id: 'tenant_addis',
    id: 'tenant_addis',
    name: 'Addis Number Community',
    slug: 'addis-draws',
    ownerAdminId: 'usr_admin_01',
    ownerName: 'Addis Lead Operator',
    ownerEmail: 'admin@draw.com',
    status: 'ACTIVE',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Premier Addis Ababa 01–80 draw community. Transparent operator payments via Telebirr & CBE with instant admin verification.',
    location: 'Addis Ababa, Ethiopia',
    telegramUsername: 'AddisDrawCommunity',
    telegramCommunityUrl: 'https://t.me/AddisDrawCommunity',
    telegramChannelUrl: 'https://t.me/AddisDrawChannel',
    telegramMemberCount: 12400,
    isVerified: true,
    isPublic: true,
    isFeatured: true,
    completedRounds: 128,
    activeRounds: 1,
    totalParticipants: 3240,
    performanceScore: 96,
    totalCollectedAmount: 18500,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    _id: 'tenant_hawassa',
    id: 'tenant_hawassa',
    name: 'Hawassa Lake Draw Operator',
    slug: 'hawassa-draws',
    ownerAdminId: 'usr_admin_02',
    ownerName: 'Hawassa Operator B',
    ownerEmail: 'hawassa@draw.com',
    status: 'ACTIVE',
    logo: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Official Hawassa region 01–80 number draw operator. Verified CBE & Telebirr processing.',
    location: 'Hawassa, Sidama, Ethiopia',
    telegramUsername: 'HawassaDraws',
    telegramCommunityUrl: 'https://t.me/HawassaDraws',
    telegramMemberCount: 5800,
    isVerified: true,
    isPublic: true,
    isFeatured: true,
    completedRounds: 64,
    activeRounds: 1,
    totalParticipants: 1450,
    performanceScore: 91,
    totalCollectedAmount: 9200,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    _id: 'tenant_dire',
    id: 'tenant_dire',
    name: 'Dire Dawa Express Community',
    slug: 'dire-draws',
    ownerAdminId: 'usr_admin_03',
    ownerName: 'Dire Operator C',
    ownerEmail: 'dire@draw.com',
    status: 'ACTIVE',
    logo: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Fast-growing Dire Dawa operator running daily 01–80 number draws.',
    location: 'Dire Dawa, Ethiopia',
    telegramUsername: 'DireDawaDraws',
    telegramCommunityUrl: 'https://t.me/DireDawaDraws',
    telegramMemberCount: 3200,
    isVerified: false,
    isPublic: true,
    isFeatured: false,
    completedRounds: 32,
    activeRounds: 1,
    totalParticipants: 820,
    performanceScore: 84,
    totalCollectedAmount: 4100,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  }
];

// Memory store for Platform Audit Logs
export const memoryPlatformAuditLogs: any[] = [
  {
    _id: 'pl_audit_01',
    tenantId: null,
    actorId: 'usr_super_01',
    actorName: 'Super Admin',
    action: 'PLATFORM_INITIALIZED',
    entityType: 'SYSTEM',
    entityId: 'system',
    metadata: { version: '1.0.0-multi-tenant' },
    createdAt: new Date().toISOString(),
  }
];

// PUBLIC READ Endpoint for Operator Discovery Directory
router.get('/public/operators', (req: Request, res: Response) => {
  const publicOperators = memoryTenants
    .filter(t => t.status === 'ACTIVE' && t.isPublic)
    .map(t => ({
      _id: t._id,
      id: t._id,
      name: t.name,
      slug: t.slug,
      logo: t.logo,
      description: t.description,
      location: t.location,
      telegramUsername: t.telegramUsername,
      telegramCommunityUrl: t.telegramCommunityUrl,
      telegramMemberCount: t.telegramMemberCount,
      isVerified: t.isVerified,
      isFeatured: t.isFeatured,
      completedRounds: t.completedRounds,
      activeRounds: t.activeRounds,
      totalParticipants: t.totalParticipants,
      performanceScore: t.performanceScore,
      createdAt: t.createdAt,
    }));

  return res.json({ operators: publicOperators });
});

// PUBLIC READ Endpoint for Single Operator Profile
router.get('/public/operators/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const operator = memoryTenants.find(t => t.slug === slug && t.status === 'ACTIVE' && t.isPublic);

  if (!operator) {
    return res.status(404).json({ error: 'Operator profile not found' });
  }

  return res.json({
    operator: {
      _id: operator._id,
      id: operator._id,
      name: operator.name,
      slug: operator.slug,
      logo: operator.logo,
      description: operator.description,
      location: operator.location,
      telegramUsername: operator.telegramUsername,
      telegramCommunityUrl: operator.telegramCommunityUrl,
      telegramChannelUrl: operator.telegramChannelUrl,
      telegramMemberCount: operator.telegramMemberCount,
      isVerified: operator.isVerified,
      isFeatured: operator.isFeatured,
      completedRounds: operator.completedRounds,
      activeRounds: operator.activeRounds,
      totalParticipants: operator.totalParticipants,
      performanceScore: operator.performanceScore,
      createdAt: operator.createdAt,
    }
  });
});

// GET /api/super-admin/dashboard
router.get('/dashboard', requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const totalOperators = memoryTenants.length;
  const activeOperators = memoryTenants.filter(t => t.status === 'ACTIVE').length;
  const totalDraws = memoryTenants.reduce((sum, t) => sum + (t.completedRounds || 0), 0);
  const totalPlayers = memoryTenants.reduce((sum, t) => sum + (t.totalParticipants || 0), 0);
  const totalCollected = memoryTenants.reduce((sum, t) => sum + (t.totalCollectedAmount || 0), 0);

  return res.json({
    metrics: {
      totalOperators,
      activeOperators,
      totalDraws,
      totalPlayers,
      totalCollectedAmount: totalCollected,
    },
    tenants: memoryTenants,
  });
});

// GET /api/super-admin/operators
router.get('/operators', requireSuperAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ operators: memoryTenants });
});

// POST /api/super-admin/operators — Create New SaaS Admin/Tenant Workspace
router.post('/operators', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, adminName, adminEmail, password, description, location, telegramUsername } = req.body;

    if (!name || !slug || !adminEmail || !password) {
      return res.status(400).json({ error: 'Tenant name, slug, admin email, and password are required' });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/\s+/g, '-');
    const existing = memoryTenants.find(t => t.slug === cleanSlug);
    if (existing) {
      return res.status(400).json({ error: 'Tenant slug already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdminId = 'usr_admin_' + Date.now();
    const newTenantId = 'tenant_' + Date.now();

    const newTenant = {
      _id: newTenantId,
      id: newTenantId,
      name: name.trim(),
      slug: cleanSlug,
      ownerAdminId: newAdminId,
      ownerName: adminName || name.trim() + ' Operator',
      ownerEmail: adminEmail.toLowerCase().trim(),
      status: 'ACTIVE',
      logo: '',
      description: description || 'New SaaS Draw Operator workspace.',
      location: location || 'Addis Ababa, Ethiopia',
      telegramUsername: telegramUsername || '',
      telegramCommunityUrl: telegramUsername ? `https://t.me/${telegramUsername.replace('@', '')}` : '',
      telegramMemberCount: 100,
      isVerified: true,
      isPublic: true,
      isFeatured: false,
      completedRounds: 0,
      activeRounds: 1,
      totalParticipants: 0,
      performanceScore: 90,
      totalCollectedAmount: 0,
      createdAt: new Date().toISOString(),
    };

    memoryTenants.unshift(newTenant);

    memoryPlatformAuditLogs.unshift({
      _id: 'pl_audit_' + Date.now(),
      tenantId: newTenantId,
      actorId: req.user?.id || 'super_admin',
      actorName: req.user?.name || 'Super Admin',
      action: 'TENANT_CREATED',
      entityType: 'TENANT',
      entityId: newTenantId,
      metadata: { name: newTenant.name, slug: newTenant.slug, email: adminEmail },
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      message: 'SaaS Operator Workspace created successfully',
      operator: newTenant,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create operator workspace' });
  }
});

// POST /api/super-admin/operators/:id/verify
router.post('/operators/:id/verify', requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const operator = memoryTenants.find(t => t._id === id || t.id === id);

  if (!operator) {
    return res.status(404).json({ error: 'Operator workspace not found' });
  }

  operator.isVerified = !operator.isVerified;

  return res.json({ message: `Operator verification updated to ${operator.isVerified}`, operator });
});

// POST /api/super-admin/operators/:id/feature
router.post('/operators/:id/feature', requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const operator = memoryTenants.find(t => t._id === id || t.id === id);

  if (!operator) {
    return res.status(404).json({ error: 'Operator workspace not found' });
  }

  operator.isFeatured = !operator.isFeatured;

  return res.json({ message: `Operator featured state updated to ${operator.isFeatured}`, operator });
});

// POST /api/super-admin/operators/:id/activate
router.post('/operators/:id/activate', requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const operator = memoryTenants.find(t => t._id === id || t.id === id);

  if (!operator) {
    return res.status(404).json({ error: 'Operator workspace not found' });
  }

  operator.status = 'ACTIVE';

  memoryPlatformAuditLogs.unshift({
    _id: 'pl_audit_' + Date.now(),
    tenantId: operator._id,
    actorId: req.user?.id || 'super_admin',
    actorName: req.user?.name || 'Super Admin',
    action: 'TENANT_ACTIVATED',
    entityType: 'TENANT',
    entityId: operator._id,
    metadata: { name: operator.name },
    createdAt: new Date().toISOString(),
  });

  return res.json({ message: 'Operator workspace activated', operator });
});

// POST /api/super-admin/operators/:id/suspend
router.post('/operators/:id/suspend', requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const operator = memoryTenants.find(t => t._id === id || t.id === id);

  if (!operator) {
    return res.status(404).json({ error: 'Operator workspace not found' });
  }

  operator.status = 'SUSPENDED';

  memoryPlatformAuditLogs.unshift({
    _id: 'pl_audit_' + Date.now(),
    tenantId: operator._id,
    actorId: req.user?.id || 'super_admin',
    actorName: req.user?.name || 'Super Admin',
    action: 'TENANT_SUSPENDED',
    entityType: 'TENANT',
    entityId: operator._id,
    metadata: { name: operator.name },
    createdAt: new Date().toISOString(),
  });

  return res.json({ message: 'Operator workspace suspended', operator });
});

// GET /api/super-admin/audit-logs
router.get('/audit-logs', requireSuperAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ auditLogs: memoryPlatformAuditLogs });
});

export default router;
