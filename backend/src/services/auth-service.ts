/**
 * Authentication service with JWT and OAuth
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../db/schema.js';
import { logger } from '../middleware/index.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-min-32-characters-long';
const JWT_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Generate API key for tenant
 */
export function generateApiKey(): string {
  return `sk_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: any; token: string }> {
  const result = await pool.query(
    `SELECT u.*, t.id as tenant_id, t.name as tenant_name 
     FROM users u 
     JOIN tenants t ON u.tenant_id = t.id 
     WHERE u.email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];
  const passwordValid = await comparePassword(password, user.password_hash);

  if (!passwordValid) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [
    user.id,
  ]);

  const token = generateToken({
    userId: user.id,
    tenantId: user.tenant_id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      tenantId: user.tenant_id,
      tenantName: user.tenant_name,
    },
    token,
  };
}

/**
 * Create new tenant
 */
export async function createTenant(
  name: string,
  slug: string,
  email: string,
  password: string
): Promise<any> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create tenant
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING *`,
      [name, slug]
    );

    const tenant = tenantResult.rows[0];

    // Create admin user
    const passwordHash = await hashPassword(password);
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) RETURNING id, email, role, tenant_id`,
      [tenant.id, email, passwordHash, 'admin']
    );

    const user = userResult.rows[0];

    // Generate API key
    const apiKey = generateApiKey();
    await client.query('UPDATE users SET api_key = $1 WHERE id = $2', [
      apiKey,
      user.id,
    ]);

    await client.query('COMMIT');

    logger.info(`Tenant created: ${name} (${slug})`);

    return {
      tenant,
      user: { ...user, apiKey },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error creating tenant:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Validate API key
 */
export async function validateApiKey(
  apiKey: string
): Promise<any> {
  const result = await pool.query(
    `SELECT u.*, t.* FROM users u 
     JOIN tenants t ON u.tenant_id = t.id 
     WHERE u.api_key = $1 AND u.is_active = true`,
    [apiKey]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}
