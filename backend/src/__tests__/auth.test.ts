/**
 * Authentication service tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as authService from '../services/auth-service';
import { pool } from '../db/schema';

describe('Authentication Service', () => {
  let testTenantId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Clean up test data if it exists
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await pool.query('DELETE FROM tenants WHERE slug = $1', ['test-tenant']);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await pool.query('DELETE FROM tenants WHERE slug = $1', ['test-tenant']);
  });

  it('should create a new tenant and admin user', async () => {
    const result = await authService.createTenant(
      'Test Company',
      'test-tenant',
      'test@example.com',
      'TestPassword123'
    );

    expect(result.tenant).toBeDefined();
    expect(result.tenant.name).toBe('Test Company');
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.role).toBe('admin');

    testTenantId = result.tenant.id;
    testUserId = result.user.id;
  });

  it('should authenticate user with correct credentials', async () => {
    const result = await authService.authenticateUser('test@example.com', 'TestPassword123');

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    try {
      await authService.authenticateUser('test@example.com', 'WrongPassword');
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.message).toBe('Invalid credentials');
    }
  });

  it('should generate valid JWT token', () => {
    const token = authService.generateToken({
      userId: testUserId,
      tenantId: testTenantId,
      email: 'test@example.com',
      role: 'admin',
    });

    expect(token).toBeDefined();
    expect(token).toMatch(/^eyJ/); // JWT starts with eyJ...

    const decoded = authService.verifyToken(token);
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.role).toBe('admin');
  });

  it('should reject invalid tokens', () => {
    expect(() => {
      authService.verifyToken('invalid.token.here');
    }).toThrow('Invalid or expired token');
  });

  it('should generate valid API keys', () => {
    const apiKey = authService.generateApiKey();
    expect(apiKey).toMatch(/^sk_/);
    expect(apiKey.length).toBeGreaterThan(10);
  });

  it('should hash passwords correctly', async () => {
    const password = 'TestPassword123';
    const hash = await authService.hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(password.length);

    const isValid = await authService.comparePassword(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = await authService.comparePassword('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });
});
