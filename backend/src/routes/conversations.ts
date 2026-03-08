import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Conversation Routes
 */

router.get('/', async (req: Request, res: Response) => {
  try {
    const { channel, status, userId } = req.query;

    res.json({
      conversations: [],
      total: 0,
      filters: { channel, status, userId },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    res.json({
      conversation: {
        id,
        channel: '',
        status: 'active',
        messages: [],
        createdAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { channel, userId, metadata } = req.body;

    if (!channel) {
      return res.status(400).json({ error: 'Missing required field: channel' });
    }

    res.status(201).json({
      id: `conv_${Date.now()}`,
      channel,
      userId,
      status: 'active',
      metadata,
      createdAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

router.post('/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, sender } = req.body;

    if (!content || !sender) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: content, sender' });
    }

    res.status(201).json({
      messageId: `msg_${Date.now()}`,
      conversationId: id,
      content,
      sender,
      createdAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add message' });
  }
});

export default router;
