import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'express-async-errors';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import kbRoutes from './routes/knowledge-base.js';
import conversationRoutes from './routes/conversations.js';
import channelRoutes from './routes/channels.js';
import billingRoutes from './routes/billing.js';

// Import middleware
import { errorHandler, requestLogger, authenticateToken } from './middleware/index.js';
import { authenticateToken as authMiddleware } from './middleware/auth.js';

// Import services
import { initializeChannels } from './services/channel-manager.js';
import { initializeDatabase } from './db/schema.js';
import { initializeSupabase } from './integrations/supabase.js';

const app: Express = express();
const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// HTTP server
const httpServer = createServer(app);

// WebSocket
const io = new Server(httpServer, {
  cors: {
    origin: frontendUrl,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: frontendUrl }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);

// Store io instance globally for use in routes
declare global {
  var io: Server;
}
globalThis.io = io;

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Public Auth Routes
app.use('/api/auth', authRoutes);

// Protected API Routes
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/kb', authMiddleware, kbRoutes);
app.use('/api/conversations', authMiddleware, conversationRoutes);
app.use('/api/channels', authMiddleware, channelRoutes);
app.use('/api/billing', billingRoutes);

// Error handling
app.use(errorHandler);

// WebSocket connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize channels
let channelInitialized = false;

// Start server
const startServer = async () => {
  try {
    // Initialize Supabase (optional)
    initializeSupabase();

    // Initialize channel integrations
    if (!channelInitialized) {
      await initializeChannels();
      channelInitialized = true;
    }

    httpServer.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
      console.log(`📊 Frontend URL: ${frontendUrl}`);
      console.log(`🔌 WebSocket ready for real-time updates`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
