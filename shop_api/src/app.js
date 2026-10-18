import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { allowedOrigins, env } from './config/env.js';
import { pool } from './config/db.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(Object.assign(new Error('Origin not allowed'), { status: 403, code: 'CORS_DENIED' }));
  },
  credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

export const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

app.get('/api/v1/health', asyncHandler(async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, data: { status: 'ok', database: 'connected', uptime: process.uptime() } });
  } catch (_error) {
    res.status(503).json({ success: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Database unavailable' } });
  }
}));

app.use((_req, res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }));

app.use((error, _req, res, _next) => {
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
  if (status >= 500) console.error('API error:', error);
  const isInvalidJson = error.type === 'entity.parse.failed';
  res.status(isInvalidJson ? 400 : status).json({
    success: false,
    error: { code: isInvalidJson ? 'INVALID_JSON' : error.code || 'INTERNAL_ERROR', message: status >= 500 && env.NODE_ENV === 'production' ? 'Internal server error' : error.message },
  });
});
