import nodemailer from 'nodemailer';
import { logger } from '../middleware/index.js';
import { generateAIResponse, sanitizeInput } from '../services/ai-service.js';

let emailTransporter: nodemailer.Transporter | null = null;

export async function initializeEmail(): Promise<void> {
  try {
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure:
        process.env.SMTP_SECURE === 'true' ||
        parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection
    await emailTransporter.verify();
    logger.info('Email transporter initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize email transporter:', error);
    throw error;
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo?: string
): Promise<void> {
  try {
    if (!emailTransporter) {
      throw new Error('Email transporter not initialized');
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
      replyTo: replyTo || process.env.SMTP_USER,
    };

    await emailTransporter.sendMail(mailOptions);
    logger.info('Email sent:', { to, subject });
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
}

export async function handleEmailInbound(
  fromAddress: string,
  subject: string,
  body: string,
  messageId: string
): Promise<void> {
  try {
    const userMessage = sanitizeInput(body);

    // Generate AI response
    const aiResponse = await generateAIResponse(userMessage, {
      policies: [],
      sops: [],
      faqs: [],
      conversationHistory: [],
    });

    // Send email response
    const htmlContent = `
      <p>${aiResponse}</p>
      <hr>
      <p><small>This is an automated response. For urgent matters, please reply to this email.</small></p>
    `;

    await sendEmail(fromAddress, `Re: ${subject}`, htmlContent, messageId);

    logger.info('Email processed:', {
      fromAddress,
      subject,
      inputLength: userMessage.length,
    });
  } catch (error) {
    logger.error('Error processing inbound email:', error);
  }
}
