/**
 * Authentication and tenant middleware
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, validateApiKey } from '../services/auth-service.js';
import { logger } from './index.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    email: string;
    role: string;
  };
  tenant?: {
    id: string;
    name: string;
  };
}

/**
 * Verify JWT token middleware
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    logger.warn('Invalid token:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Verify API key middleware
 */
export const authenticateApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  try {
    const auth = await validateApiKey(apiKey);

    if (!auth) {
      return res.status(403).json({ error: 'Invalid API key' });
    }

    req.user = {
      userId: auth.id,
      tenantId: auth.tenant_id,
      email: auth.email,
      role: auth.role,
    };

    next();
  } catch (error) {
    logger.error('API key validation error:', error);
    return res.status(403).json({ error: 'Invalid API key' });
  }
};

/**
 * Ensure admin role
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ error: 'Admin role required' });
  }

  next();
};

/**
 * Optional authentication (for public/private routes)
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = payload;
    } catch (error) {
      // Continue without auth if token is invalid
    }
  }

  next();
};

/**
 * Rate limiting per tenant
 */
export const rateLimitByTenant = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.tenantId) {
    return res.status(401).json({ error: 'Tenant not identified' });
  }

  // TODO: Implement rate limiting logic
  // This would use Redis in production
  next();
};
