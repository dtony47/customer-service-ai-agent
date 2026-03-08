import axios from 'axios';
import { logger } from '../middleware/index.js';
import { generateAIResponse, sanitizeInput } from '../services/ai-service.js';

const whatsappApiUrl = process.env.WHATSAPP_API_URL || 'http://localhost:8080';
const whatsappApiKey = process.env.WHATSAPP_API_KEY || '';

export async function initializeWhatsApp(): Promise<void> {
  try {
    // Verify connection to Evolution API
    const response = await axios.get(`${whatsappApiUrl}/api/health`, {
      headers: {
        'API-KEY': whatsappApiKey,
      },
    });

    logger.info('WhatsApp (Evolution API) connected:', response.data);
  } catch (error) {
    logger.error('Failed to connect to WhatsApp Evolution API:', error);
    throw error;
  }
}

export async function sendWhatsAppMessage(
  instanceName: string,
  recipientNumber: string,
  message: string
): Promise<void> {
  try {
    const response = await axios.post(
      `${whatsappApiUrl}/api/message/sendText/${instanceName}`,
      {
        number: recipientNumber,
        textMessage: {
          text: message,
        },
      },
      {
        headers: {
          'API-KEY': whatsappApiKey,
        },
      }
    );

    logger.info('WhatsApp message sent:', {
      instanceName,
      recipientNumber,
      messageId: response.data.key?.id,
    });
  } catch (error) {
    logger.error('Failed to send WhatsApp message:', error);
    throw error;
  }
}

export async function handleWhatsAppWebhook(
  payload: any
): Promise<void> {
  try {
    const message = payload.data?.message;
    const senderNumber = payload.data?.key?.remoteJid?.split('@')[0];
    const instanceName = payload.instance?.name;

    if (!message || !message.conversation) {
      return;
    }

    const userMessage = sanitizeInput(message.conversation);

    // Generate AI response
    const aiResponse = await generateAIResponse(userMessage, {
      policies: [],
      sops: [],
      faqs: [],
      conversationHistory: [],
    });

    // Send response back to WhatsApp
    if (senderNumber && instanceName) {
      await sendWhatsAppMessage(instanceName, senderNumber, aiResponse);

      logger.info('WhatsApp webhook processed:', {
        senderNumber,
        instanceName,
        inputLength: userMessage.length,
      });
    }
  } catch (error) {
    logger.error('Error processing WhatsApp webhook:', error);
  }
}
