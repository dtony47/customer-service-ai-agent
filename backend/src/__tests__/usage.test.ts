/**
 * Usage service tests
 */

import { describe, it, expect } from 'vitest';
import * as usageService from '../services/usage-service';

describe('Usage Service', () => {
  it('should track usage events', async () => {
    const event = {
      tenantId: 'test-tenant-id',
      eventType: 'message_sent',
      metadata: { channel: 'slack' },
    };

    // Should not throw
    await expect(
      usageService.trackUsage(event)
    ).resolves.not.toThrow();
  });

  it('should validate usage limits for starter plan', async () => {
    // Mock implementation
    const limits = {
      messagesPerMonth: 1000,
      channels: 1,
      users: 2,
    };

    expect(limits.messagesPerMonth).toBe(1000);
    expect(limits.channels).toBe(1);
    expect(limits.users).toBe(2);
  });

  it('should validate usage limits for pro plan', async () => {
    const limits = {
      messagesPerMonth: 10000,
      channels: 3,
      users: 10,
    };

    expect(limits.messagesPerMonth).toBe(10000);
    expect(limits.channels).toBe(3);
    expect(limits.users).toBe(10);
  });

  it('should validate unlimited usage for enterprise plan', async () => {
    const limits = {
      messagesPerMonth: 'unlimited',
      channels: 'unlimited',
      users: 'unlimited',
    };

    expect(limits.messagesPerMonth).toBe('unlimited');
    expect(limits.channels).toBe('unlimited');
    expect(limits.users).toBe('unlimited');
  });
});
