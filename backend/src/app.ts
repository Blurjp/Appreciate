import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import streakRoutes from './routes/streak';
import userRoutes from './routes/users';
import { authenticate } from './middleware/auth';
import { success, error } from './utils/response';
import { paginationSchema } from './utils/validation';
import * as postService from './services/postService';
import { AuthRequest } from './types';

const app = express();

// Global middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later', code: 'RATE_LIMIT' },
  },
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many auth attempts, please try again later', code: 'RATE_LIMIT' },
  },
});
app.use('/api/v1/auth/', authLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/streak', streakRoutes);
app.use('/api/v1/users', userRoutes);

// GET /api/v1/my-wall — Authenticated user's wall
app.get('/api/v1/my-wall', authenticate, async (req: AuthRequest, res) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const visibility = req.query.visibility as string | undefined;

    const data = await postService.getMyWall(req.userId!, page, limit, visibility);
    success(res, data);
  } catch (err: any) {
    error(res, err.message, 'MY_WALL_ERROR', err.status || 500);
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Endpoint not found', code: 'NOT_FOUND' },
  });
});

// Global error handler
app.use(errorHandler);

export default app;
