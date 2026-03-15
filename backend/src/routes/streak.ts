import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import * as streakService from '../services/streakService';
import { success, error } from '../utils/response';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/v1/streak — Get current user's streak
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await streakService.getStreak(req.userId!);
    success(res, data);
  } catch (err: any) {
    error(res, err.message, 'STREAK_ERROR', err.status || 500);
  }
});

export default router;
