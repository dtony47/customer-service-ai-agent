/**
 * Billing service tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as billingService from '../services/billing-service';

describe('Billing Service', () => {
  it('should define subscription plans', () => {
    const plans = Object.keys(billingService.SUBSCRIPTION_PLANS);
    expect(plans).toContain('starter');
    expect(plans).toContain('pro');
    expect(plans).toContain('enterprise');
  });

  it('should validate starter plan features', () => {
    const startePlan = billingService.SUBSCRIPTION_PLANS.starter;
    expect(startePlan.name).toBe('Starter');
    expect(startePlan.monthlyPrice).toBe(29);
    expect(startePlan.features.channels).toBe(1);
    expect(startePlan.features.messagesPerMonth).toBe(1000);
    expect(startePlan.features.users).toBe(2);
    expect(startePlan.features.support).toBe('email');
  });

  it('should validate pro plan features', () => {
    const proPlan = billingService.SUBSCRIPTION_PLANS.pro;
    expect(proPlan.name).toBe('Pro');
    expect(proPlan.monthlyPrice).toBe(99);
    expect(proPlan.features.channels).toBe(3);
    expect(proPlan.features.messagesPerMonth).toBe(10000);
    expect(proPlan.features.users).toBe(10);
    expect(proPlan.features.support).toBe('priority');
  });

  it('should validate enterprise plan features', () => {
    const enterprisePlan = billingService.SUBSCRIPTION_PLANS.enterprise;
    expect(enterprisePlan.name).toBe('Enterprise');
    expect(enterprisePlan.monthlyPrice).toBe(299);
    expect(enterprisePlan.features.channels).toBe('unlimited');
    expect(enterprisePlan.features.messagesPerMonth).toBe('unlimited');
    expect(enterprisePlan.features.users).toBe('unlimited');
    expect(enterprisePlan.features.support).toBe('24/7');
  });
});
