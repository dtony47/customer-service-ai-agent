/**
 * Billing and subscription routes
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as billingService from '../services/billing-service.js';
import * as usageService from '../services/usage-service.js';
import { logger } from '../middleware/index.js';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    email: string;
    role: string;
  };
}

/**
 * Get subscription details
 */
router.get(
  '/subscription',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenantId;
      const subscription = await billingService.getSubscriptionDetails(tenantId!);

      res.json(subscription);
    } catch (error) {
      logger.error('Error fetching subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  }
);

/**
 * Create subscription
 */
router.post(
  '/subscription',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { plan } = req.body;
      const tenantId = req.user?.tenantId;

      if (!plan) {
        return res.status(400).json({ error: 'Missing plan' });
      }

      const subscription = await billingService.createSubscription(
        tenantId!,
        plan as any
      );

      res.status(201).json(subscription);
    } catch (error) {
      logger.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  }
);

/**
 * Cancel subscription
 */
router.delete(
  '/subscription',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenantId;

      await billingService.cancelSubscription(tenantId!);

      res.json({ success: true });
    } catch (error) {
      logger.error('Error cancelling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }
);

/**
 * Get usage statistics
 */
router.get(
  '/usage',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenantId;
      const stats = await usageService.getUsageStats(tenantId!);

      res.json(stats);
    } catch (error) {
      logger.error('Error fetching usage stats:', error);
      res.status(500).json({ error: 'Failed to fetch usage statistics' });
    }
  }
);

/**
 * Stripe webhook
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const stripeSignatureSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSignatureSecret) {
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    // Import Stripe for webhook verification
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const signature = req.headers['stripe-signature'] as string;
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      stripeSignatureSecret
    );

    await billingService.handleWebhook(event);

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(400).json({ error: 'Invalid webhook signature' });
  }
});

export default router;
