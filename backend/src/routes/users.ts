import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, paginationSchema } from '../utils/validation';
import { success, error } from '../utils/response';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import * as postService from '../services/postService';

const router = Router();

// PATCH /api/v1/users/profile — Update own profile (must be before /:id)
router.patch('/profile', authenticate, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: req.body,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    success(res, { user });
  } catch (err: any) {
    error(res, err.message, 'PROFILE_UPDATE_ERROR', err.status || 500);
  }
});

// GET /api/v1/users/:id — Get user public info
router.get('/:id', async (req, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    });

    if (!user) {
      error(res, 'User not found', 'USER_NOT_FOUND', 404);
      return;
    }

    success(res, {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      totalPosts: user._count.posts,
    });
  } catch (err: any) {
    error(res, err.message, 'USER_ERROR', err.status || 500);
  }
});

// GET /api/v1/users/:id/wall — Get user's public wall
router.get('/:id/wall', async (req, res: Response) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };

    const data = await postService.getUserPublicWall(req.params.id as string, page, limit);
    success(res, data);
  } catch (err: any) {
    error(res, err.message, 'WALL_ERROR', err.status || 500);
  }
});

export default router;
