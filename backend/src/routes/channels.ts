import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Channel Routes
 * Manage channel configurations
 */

router.get('/', async (req: Request, res: Response) => {
  try {
    const channels = [
      {
        id: 'slack',
        name: 'Slack',
        enabled: !!process.env.SLACK_BOT_TOKEN,
        configured: !!process.env.SLACK_BOT_TOKEN,
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        enabled: !!process.env.WHATSAPP_API_URL,
        configured: !!process.env.WHATSAPP_API_URL,
      },
      {
        id: 'email',
        name: 'Email',
        enabled: !!process.env.SMTP_HOST,
        configured: !!process.env.SMTP_HOST,
      },
      {
        id: 'voice',
        name: 'Voice (Twilio)',
        enabled: !!process.env.TWILIO_ACCOUNT_SID,
        configured: !!process.env.TWILIO_ACCOUNT_SID,
      },
    ];

    res.json({ channels });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    res.json({
      channel: id,
      status: 'connected',
      lastCheck: new Date(),
      metrics: {
        messagesProcessed: 0,
        activeConversations: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channel status' });
  }
});

export default router;
