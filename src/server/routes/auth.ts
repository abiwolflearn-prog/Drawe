import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth.js';
import { UserModel } from '../../models/User.js';
import { isFallbackStore } from '../../db/connect.js';

const router = Router();

// In-memory fallback user store when MongoDB is not connected
export const memoryUsers: any[] = [
  {
    _id: 'usr_super_01',
    id: 'usr_super_01',
    name: 'Super Platform Admin',
    email: 'superadmin@draw.com',
    passwordHash: '$2a$10$X8a3V/S5.U53L1.0M.vW/u4S2QkS5H8qKz3L2W/X8a3V/S5.U53L', // password123
    role: 'SUPER_ADMIN',
    telegramUserId: '77700000',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr_admin_01',
    id: 'usr_admin_01',
    tenantId: 'tenant_addis',
    name: 'Addis Operator Admin',
    email: 'admin@draw.com',
    passwordHash: '$2a$10$X8a3V/S5.U53L1.0M.vW/u4S2QkS5H8qKz3L2W/X8a3V/S5.U53L', // password123
    role: 'ADMIN',
    telegramUserId: '77700001',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr_admin_02',
    id: 'usr_admin_02',
    tenantId: 'tenant_hawassa',
    name: 'Hawassa Operator Admin',
    email: 'hawassa@draw.com',
    passwordHash: '$2a$10$X8a3V/S5.U53L1.0M.vW/u4S2QkS5H8qKz3L2W/X8a3V/S5.U53L', // password123
    role: 'ADMIN',
    telegramUserId: '77700002',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr_player_01',
    id: 'usr_player_01',
    tenantId: 'tenant_addis',
    name: 'Sample Player',
    email: 'player@draw.com',
    passwordHash: '$2a$10$X8a3V/S5.U53L1.0M.vW/u4S2QkS5H8qKz3L2W/X8a3V/S5.U53L', // password123
    role: 'PLAYER',
    telegramUserId: '12345678',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  }
];

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const lowerEmail = email.toLowerCase().trim();

    if (isFallbackStore()) {
      const existing = memoryUsers.find(u => u.email === lowerEmail);
      if (existing) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'usr_' + Date.now(),
        id: 'usr_' + Date.now(),
        tenantId: 'tenant_addis', // Assigned to default operator tenant
        name,
        email: lowerEmail,
        phone: phone || '',
        passwordHash,
        role: 'PLAYER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      memoryUsers.push(newUser);
      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        tenantId: newUser.tenantId,
      });

      return res.status(201).json({
        user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role, tenantId: newUser.tenantId },
        token,
      });
    }

    const existingUser = await UserModel.findOne({ email: lowerEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      name,
      email: lowerEmail,
      phone: phone || '',
      passwordHash,
      role: 'PLAYER',
      status: 'ACTIVE',
      tenantId: 'tenant_addis',
    });

    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      tenantId: newUser.tenantId?.toString(),
    });

    return res.status(201).json({
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        tenantId: newUser.tenantId?.toString(),
      },
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to register account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const lowerEmail = email.toLowerCase().trim();

    if (isFallbackStore()) {
      const user = memoryUsers.find(u => u.email === lowerEmail);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Allow demo login shortcut or valid hash check
      const valid = password === 'password123' || await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken({
        id: user.id || user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      });

      return res.json({
        user: { id: user.id || user._id, name: user.name, email: user.email, phone: user.phone || '', role: user.role, tenantId: user.tenantId },
        token,
      });
    }

    const user = await UserModel.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId?.toString(),
    });

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        tenantId: user.tenantId?.toString(),
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  return res.json({ status: 'logged_out' });
});

export default router;
