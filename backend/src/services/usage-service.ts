/**
 * Usage tracking and analytics for SaaS metering
 */

import { pool } from '../db/schema.js';
import { logger } from '../middleware/index.js';

export interface UsageEvent {
  tenantId: string;
  eventType: string;
  metadata?: any;
}

export async function trackUsage(event: UsageEvent): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO usage_events (tenant_id, event_type, metadata) 
       VALUES ($1, $2, $3)`,
      [event.tenantId, event.eventType, JSON.stringify(event.metadata || {})]
    );

    // Check usage limits
    await checkUsageLimits(event.tenantId);
  } catch (error) {
    logger.error('Error tracking usage:', error);
  }
}

/**
 * Check if tenant has exceeded usage limits
 */
export async function checkUsageLimits(tenantId: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT subscription_plan FROM tenants WHERE id = $1`,
      [tenantId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const plan = result.rows[0].subscription_plan;
    const limits = getPlanLimits(plan);

    // Count messages this month
    const this_month = new Date(),
      today = new Date();
    this_month.setMonth(this_month.getMonth() - 1);

    const messagesResult = await pool.query(
      `SELECT COUNT(*) as count FROM messages 
       WHERE tenant_id = $1 AND created_at >= $2`,
      [tenantId, this_month]
    );

    const messageCount = parseInt(
      messagesResult.rows[0].count,
      10
    );

    if (
      limits.messagesPerMonth !== 'unlimited' &&
      messageCount >= limits.messagesPerMonth
    ) {
      logger.warn(
        `Usage limit exceeded for tenant ${tenantId}: ${messageCount}/${limits.messagesPerMonth} messages`
      );
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error checking usage limits:', error);
    return true; // Allow usage on error
  }
}

/**
 * Get plan limits
 */
function getPlanLimits(
  plan: string
): {
  messagesPerMonth: number | string;
  channels: number | string;
  users: number | string;
} {
  const plans: any = {
    starter: {
      messagesPerMonth: 1000,
      channels: 1,
      users: 2,
    },
    pro: {
      messagesPerMonth: 10000,
      channels: 3,
      users: 10,
    },
    enterprise: {
      messagesPerMonth: 'unlimited',
      channels: 'unlimited',
      users: 'unlimited',
    },
  };

  return plans[plan] || plans.starter;
}

/**
 * Get usage statistics for tenant
 */
export async function getUsageStats(tenantId: string): Promise<any> {
  try {
    const this_month = new Date();
    this_month.setMonth(this_month.getMonth() - 1);

    const results = await Promise.all([
      // Message count
      pool.query(
        `SELECT COUNT(*) as count FROM messages 
         WHERE tenant_id = $1 AND created_at >= $2`,
        [tenantId, this_month]
      ),
      // Conversation count
      pool.query(
        `SELECT COUNT(*) as count FROM conversations 
         WHERE tenant_id = $1 AND created_at >= $2`,
        [tenantId, this_month]
      ),
      // Active user count
      pool.query(
        `SELECT COUNT(*) as count FROM users 
         WHERE tenant_id = $1 AND is_active = true`,
        [tenantId]
      ),
      // Subscription plan
      pool.query(
        `SELECT subscription_plan FROM tenants WHERE id = $1`,
        [tenantId]
      ),
    ]);

    const plan = results[3].rows[0].subscription_plan;
    const limits = getPlanLimits(plan);

    return {
      messagesThisMonth: parseInt(results[0].rows[0].count, 10),
      conversationsThisMonth: parseInt(results[1].rows[0].count, 10),
      activeUsers: parseInt(results[2].rows[0].count, 10),
      plan,
      limits,
      usagePercentage: {
        messages:
          limits.messagesPerMonth === 'unlimited'
            ? 0
            : (parseInt(results[0].rows[0].count, 10) /
                (limits.messagesPerMonth as number)) *
              100,
      },
    };
  } catch (error) {
    logger.error('Error getting usage stats:', error);
    throw error;
  }
}
