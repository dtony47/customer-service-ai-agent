import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../middleware/index.js';

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export interface AIContext {
  policies: string[];
  sops: string[];
  faqs: Array<{ question: string; answer: string }>;
  conversationHistory: Array<{ role: string; content: string }>;
}

/**
 * Generate AI response based on customer message and company knowledge base
 */
export async function generateAIResponse(
  customerMessage: string,
  context: AIContext
): Promise<string> {
  try {
    // Build context prompt from policies, SOPs, and FAQs
    const contextPrompt = buildContextPrompt(context);

    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const chat = model.startChat({
      history: context.conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(
      `${contextPrompt}\n\nCustomer: ${customerMessage}`
    );

    const response = result.response.text();
    return response;
  } catch (error) {
    logger.error('AI generation error:', error);
    throw new Error('Failed to generate response');
  }
}

/**
 * Build a context prompt from company knowledge base
 */
function buildContextPrompt(context: AIContext): string {
  let prompt = 'You are a helpful customer service representative. ';
  prompt += 'Use the following company information to answer customer questions:\n\n';

  if (context.policies.length > 0) {
    prompt += `Company Policies:\n${context.policies.join('\n')}\n\n`;
  }

  if (context.sops.length > 0) {
    prompt += `Standard Operating Procedures:\n${context.sops.join('\n')}\n\n`;
  }

  if (context.faqs.length > 0) {
    prompt += `Frequently Asked Questions:\n`;
    context.faqs.forEach((faq) => {
      prompt += `Q: ${faq.question}\nA: ${faq.answer}\n`;
    });
    prompt += '\n';
  }

  prompt += 'Provide helpful, professional, and polite responses. If you cannot find the answer in the provided information, offer to escalate to a human agent.';

  return prompt;
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 5000) // Limit message length
    .replace(/[<>]/g, ''); // Remove potential XSS characters
}

/**
 * Extract entities from customer message
 */
export async function extractEntities(message: string): Promise<string[]> {
  try {
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(
      `Extract key entities (names, dates, order numbers, etc.) from this message. Return as JSON array.\nMessage: "${message}"`
    );

    const text = result.response.text();
    const match = text.match(/\[.*\]/s);
    if (match) {
      return JSON.parse(match[0]);
    }
    return [];
  } catch (error) {
    logger.error('Entity extraction error:', error);
    return [];
  }
}
