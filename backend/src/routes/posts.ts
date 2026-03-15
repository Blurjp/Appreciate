import { Router, Response } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPostSchema, updatePostSchema, paginationSchema } from '../utils/validation';
import * as postService from '../services/postService';
import { success, error } from '../utils/response';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/v1/posts — Public feed
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const category = req.query.category as string | undefined;

    const data = await postService.getPublicFeed(page, limit, category);
    success(res, data);
  } catch (err: any) {
    error(res, err.message, 'FEED_ERROR', err.status || 500);
  }
});

// POST /api/v1/posts — Create post
router.post('/', authenticate, validate(createPostSchema), async (req: AuthRequest, res: Response) => {
  try {
    const post = await postService.createPost(req.userId!, req.body);
    success(res, post, 201);
  } catch (err: any) {
    error(res, err.message, 'CREATE_POST_ERROR', err.status || 500);
  }
});

// GET /api/v1/posts/:id — Get single post
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id as string;
    const post = await postService.getPostById(postId, req.userId);
    success(res, post);
  } catch (err: any) {
    error(res, err.message, 'GET_POST_ERROR', err.status || 500);
  }
});

// PATCH /api/v1/posts/:id — Update post
router.patch('/:id', authenticate, validate(updatePostSchema), async (req: AuthRequest, res: Response) => {
  try {
    const post = await postService.updatePost(req.params.id as string, req.userId!, req.body);
    success(res, post);
  } catch (err: any) {
    error(res, err.message, 'UPDATE_POST_ERROR', err.status || 500);
  }
});

// DELETE /api/v1/posts/:id — Delete post
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await postService.deletePost(req.params.id as string, req.userId!);
    success(res, { message: 'Post deleted' });
  } catch (err: any) {
    error(res, err.message, 'DELETE_POST_ERROR', err.status || 500);
  }
});

// POST /api/v1/posts/:id/heart — Heart/like a post
router.post('/:id/heart', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await postService.heartPost(req.params.id as string, req.userId!);
    success(res, result);
  } catch (err: any) {
    error(res, err.message, 'HEART_ERROR', err.status || 500);
  }
});

export default router;
