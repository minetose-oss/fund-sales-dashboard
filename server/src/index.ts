import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { appRouter } from './trpc/router.js';
import { createContext } from './trpc/context.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC endpoint
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe:sales', () => {
    socket.join('sales-updates');
    console.log('Client subscribed to sales updates:', socket.id);
  });

  socket.on('subscribe:analytics', () => {
    socket.join('analytics-updates');
    console.log('Client subscribed to analytics updates:', socket.id);
  });

  socket.on('subscribe:insights', () => {
    socket.join('insights-updates');
    console.log('Client subscribed to market insights:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper functions to emit real-time updates
export const emitSaleUpdate = (data: any) => {
  io.to('sales-updates').emit('sale:new', data);
};

export const emitAnalyticsUpdate = (data: any) => {
  io.to('analytics-updates').emit('analytics:update', data);
};

export const emitInsightUpdate = (data: any) => {
  io.to('insights-updates').emit('insight:new', data);
};

// Store io instance for use in other modules
export { io };

// Start server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`tRPC endpoint: http://localhost:${PORT}/trpc`);
  console.log(`Socket.IO endpoint: ws://localhost:${PORT}`);
});
