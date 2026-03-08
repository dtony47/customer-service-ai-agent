import { App } from '@slack/bolt';
import { logger } from '../middleware/index.js';
import { generateAIResponse, sanitizeInput } from '../services/ai-service.js';

let slackApp: App;

export async function initializeSlack(): Promise<void> {
  try {
    slackApp = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });

    // Listen to all messages
    slackApp.message(async ({ message, say }: any) => {
      try {
        if (message.type === 'message' && 'text' in message && message.text) {
          const userMessage = sanitizeInput(message.text);

          // Generate AI response
          const aiResponse = await generateAIResponse(userMessage, {
            policies: [],
            sops: [],
            faqs: [],
            conversationHistory: [],
          });

          // Send response back to Slack
          await say(aiResponse);

          logger.info('Slack message processed:', {
            userId: message.user,
            inputLength: userMessage.length,
          });
        }
      } catch (error) {
        logger.error('Error processing Slack message:', error);
        await say(
          'Sorry, I encountered an error processing your message. Please try again.'
        );
      }
    });

    // Listen to app mentions
    slackApp.event('app_mention', async ({ event, say }: any) => {
      try {
        if ('text' in event && event.text) {
          const userMessage = sanitizeInput(event.text.replace(/<@[^>]+>/g, '').trim());

          const aiResponse = await generateAIResponse(userMessage, {
            policies: [],
            sops: [],
            faqs: [],
            conversationHistory: [],
          });

          await say(aiResponse);
        }
      } catch (error) {
        logger.error('Error processing Slack mention:', error);
        await say(
          'Sorry, I encountered an error processing your message. Please try again.'
        );
      }
    });

    await slackApp.start();
    logger.info('Slack bot started successfully');
  } catch (error) {
    logger.error('Failed to initialize Slack:', error);
    throw error;
  }
}

export async function sendSlackMessage(
  channelId: string,
  message: string
): Promise<void> {
  try {
    if (!slackApp) {
      throw new Error('Slack app not initialized');
    }

    await slackApp.client.chat.postMessage({
      channel: channelId,
      text: message,
    });

    logger.info('Slack message sent:', { channelId, messageLength: message.length });
  } catch (error) {
    logger.error('Failed to send Slack message:', error);
    throw error;
  }
}
