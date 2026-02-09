import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors({
  origin: true,  // Allow all origins (frontend and backend on same platform)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
    dbPath: config.databasePath,
  });
});

// API routes
app.use('/api', routes);

// Serve static files from client build
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// SPA fallback: all non-API routes serve index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error handler
app.use(errorHandler);

export default app;
