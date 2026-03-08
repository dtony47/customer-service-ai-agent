/**
 * Stripe integration for SaaS billing
 */

import Stripe from 'stripe';
import { pool } from '../db/schema.js';
import { logger } from '../middleware/index.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER,
    monthlyPrice: 29,
    features: {
      channels: 1,
      messagesPerMonth: 1000,
      users: 2,
      support: 'email',
    },
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO,
    monthlyPrice: 99,
    features: {
      channels: 3,
      messagesPerMonth: 10000,
      users: 10,
      support: 'priority',
    },
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    monthlyPrice: 299,
    features: {
      channels: 'unlimited',
      messagesPerMonth: 'unlimited',
      users: 'unlimited',
      support: '24/7',
    },
  },
};

/**
 * Create Stripe customer for tenant
 */
export async function createStripeCustomer(
  tenantId: string,
  tenantName: string,
  email: string
): Promise<string> {
  try {
    const customer = await stripe.customers.create({
      name: tenantName,
      email,
      metadata: { tenantId },
    });

    // Store in database
    await pool.query(
      'UPDATE tenants SET stripe_customer_id = $1 WHERE id = $2',
      [customer.id, tenantId]
    );

    logger.info(`Stripe customer created: ${customer.id}`);
    return customer.id;
  } catch (error) {
    logger.error('Error creating Stripe customer:', error);
    throw error;
  }
}

/**
 * Create subscription for tenant
 */
export async function createSubscription(
  tenantId: string,
  planKey: keyof typeof SUBSCRIPTION_PLANS
): Promise<Stripe.Subscription> {
  try {
    const plan = SUBSCRIPTION_PLANS[planKey];
    const result = await pool.query(
      'SELECT stripe_customer_id FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (result.rows.length === 0) {
      throw new Error('Tenant not found');
    }

    const customerId = result.rows[0].stripe_customer_id;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: { tenantId, planKey },
    });

    // Store subscription in database
    await pool.query(
      `UPDATE tenants 
       SET stripe_subscription_id = $1, subscription_plan = $2, subscription_status = $3 
       WHERE id = $4`,
      [subscription.id, planKey, subscription.status, tenantId]
    );

    logger.info(`Subscription created: ${subscription.id} for tenant ${tenantId}`);
    return subscription;
  } catch (error) {
    logger.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(tenantId: string): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT stripe_subscription_id FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (result.rows.length === 0 || !result.rows[0].stripe_subscription_id) {
      throw new Error('No active subscription found');
    }

    const subscriptionId = result.rows[0].stripe_subscription_id;

    await stripe.subscriptions.cancel(subscriptionId);

    // Update database
    await pool.query(
      `UPDATE tenants SET subscription_status = $1, stripe_subscription_id = NULL WHERE id = $2`,
      ['cancelled', tenantId]
    );

    logger.info(`Subscription cancelled for tenant ${tenantId}`);
  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Handle Stripe webhook
 */
export async function handleWebhook(event: Stripe.Event): Promise<void> {
  try {
    switch (event.type) {
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenantId;

        await pool.query(
          'UPDATE tenants SET subscription_status = $1 WHERE id = $2',
          [subscription.status, tenantId]
        );

        logger.info(`Subscription updated: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenantId;

        await pool.query(
          `UPDATE tenants SET subscription_status = $1, subscription_plan = $2 WHERE id = $3`,
          ['cancelled', 'starter', tenantId]
        );

        logger.info(`Subscription deleted: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        logger.info(`Payment succeeded: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logger.warn(`Payment failed: ${invoice.id}`);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    logger.error('Error handling webhook:', error);
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(tenantId: string): Promise<any> {
  const result = await pool.query(
    `SELECT subscription_plan, subscription_status, stripe_subscription_id 
     FROM tenants WHERE id = $1`,
    [tenantId]
  );

  if (result.rows.length === 0) {
    throw new Error('Tenant not found');
  }

  const tenant = result.rows[0];
  const plan = SUBSCRIPTION_PLANS[tenant.subscription_plan as keyof typeof SUBSCRIPTION_PLANS];

  return {
    plan: tenant.subscription_plan,
    status: tenant.subscription_status,
    features: plan?.features || {},
  };
}
