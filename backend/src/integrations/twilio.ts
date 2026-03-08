import twilio from 'twilio';
import { logger } from '../middleware/index.js';
import { generateAIResponse, sanitizeInput } from '../services/ai-service.js';

let twilioClient: any = null;

export async function initializeTwilio(): Promise<void> {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Verify credentials by fetching account
    const account = await twilioClient.api.accounts.list({ limit: 1 });
    logger.info('Twilio Voice initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Twilio:', error);
    throw error;
  }
}

export async function initiateCall(
  toNumber: string,
  scriptText: string
): Promise<string> {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    const call = await twilioClient.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toNumber,
      url: `${process.env.BACKEND_URL}/api/twilio/voice-callback`,
      statusCallback: `${process.env.BACKEND_URL}/api/twilio/status-callback`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    logger.info('Call initiated:', {
      toNumber,
      callSid: call.sid,
    });

    return call.sid;
  } catch (error) {
    logger.error('Failed to initiate call:', error);
    throw error;
  }
}

export async function handleVoiceCallback(
  callSid: string,
  userTranscription: string
): Promise<string> {
  try {
    const userMessage = sanitizeInput(userTranscription);

    // Generate AI response
    const aiResponse = await generateAIResponse(userMessage, {
      policies: [],
      sops: [],
      faqs: [],
      conversationHistory: [],
    });

    logger.info('Voice message processed:', {
      callSid,
      inputLength: userMessage.length,
    });

    // Return TwiML for text-to-speech response
    return `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">${escapeXml(aiResponse)}</Say>
      </Response>`;
  } catch (error) {
    logger.error('Error processing voice callback:', error);
    return `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">Sorry, I encountered an error. Please try again.</Say>
      </Response>`;
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
