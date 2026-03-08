/**
 * Authentication routes (signup, login, etc.)
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as authService from '../services/auth-service.js';
import { logger } from '../middleware/index.js';

const router = Router();

/**
 * Sign up new tenant
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { tenantName, email, password, slug } = req.body;

    if (!tenantName || !email || !password || !slug) {
      return res.status(400).json({
        error: 'Missing required fields: tenantName, email, password, slug',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters' });
    }

    const result = await authService.createTenant(
      tenantName,
      slug,
      email,
      password
    );

    const token = authService.generateToken({
      userId: result.user.id,
      tenantId: result.tenant.id,
      email: result.user.email,
      role: result.user.role,
    });

    logger.info(`New signup: ${email} for tenant ${tenantName}`);

    res.status(201).json({
      tenant: result.tenant,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        apiKey: result.user.apiKey,
      },
      token,
    });
  } catch (error: any) {
    logger.error('Signup error:', error);

    if (error.message.includes('duplicate')) {
      return res.status(409).json({ error: 'Email or slug already exists' });
    }

    res.status(500).json({ error: 'Failed to create account' });
  }
});

/**
 * Login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: email, password' });
    }

    const result = await authService.authenticateUser(email, password);

    logger.info(`Login successful: ${email}`);

    res.json({
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    logger.warn('Login failed:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

/**
 * Get current user
 */
router.get('/me', authenticateToken, async (req: any, res: Response) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * Refresh token
 */
router.post('/refresh', authenticateToken, async (req: any, res: Response) => {
  try {
    const token = authService.generateToken({
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      email: req.user.email,
      role: req.user.role,
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Logout (client-side implementation)
 */
router.post('/logout', authenticateToken, (req: Request, res: Response) => {
  // Client should discard token
  res.json({ success: true });
});

export default router;
