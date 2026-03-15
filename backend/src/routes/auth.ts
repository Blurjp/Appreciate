import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  appleAuthSchema,
  refreshTokenSchema,
} from '../utils/validation';
import * as authService from '../services/authService';
import { success, error } from '../utils/response';
import { AuthRequest } from '../types';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', validate(registerSchema), async (req, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const data = await authService.register(email, password, name);
    success(res, data, 201);
  } catch (err: any) {
    error(res, err.message, 'REGISTER_ERROR', err.status || 500);
  }
});

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    success(res, data);
  } catch (err: any) {
    error(res, err.message, 'LOGIN_ERROR', err.status || 500);
  }
});

// POST /api/v1/auth/apple
router.post('/apple', validate(appleAuthSchema), async (req, res: Response) => {
  try {
    const { identityToken, user } = req.body;
    const data = await authService.signInWithApple(identityToken, user);
    success(res, data);
  } catch (err: any) {
    error(res, err.message, 'APPLE_AUTH_ERROR', err.status || 500);
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', validate(refreshTokenSchema), async (req, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refreshTokens(refreshToken);
    success(res, data);
  } catch (err: any) {
    error(res, err.message, 'REFRESH_ERROR', err.status || 500);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authenticate, async (_req, res: Response) => {
  // Stateless JWT — client just discards the token
  success(res, { message: 'Logged out successfully' });
});

// GET /api/v1/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getMe(req.userId!);
    success(res, { user });
  } catch (err: any) {
    error(res, err.message, 'USER_ERROR', err.status || 500);
  }
});

export default router;
