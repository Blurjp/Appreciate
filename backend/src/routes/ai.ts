import { Router, Response, Request } from 'express';
import { z } from 'zod';
import { success, error } from '../utils/response';
import { generateGratitudeImage, generateImage } from '../services/runwareService';

const router = Router();

// Validation schema
const generateImageSchema = z.object({
  content: z.string().min(1, 'Content is required').max(500, 'Content too long'),
  feeling: z.string().max(100).optional(),
  style: z.string().max(100).optional(),
});

const generateCustomImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000),
  negativePrompt: z.string().max(500).optional(),
  width: z.number().min(256).max(1024).optional(),
  height: z.number().min(256).max(1024).optional(),
});

// POST /api/v1/ai/generate-image
router.post(
  '/generate-image',
  async (req: Request, res: Response) => {
    try {
      const { content, feeling, style } = req.body;

      // Validate input
      const validation = generateImageSchema.safeParse({ content, feeling, style });
      if (!validation.success) {
        error(res, validation.error.errors[0].message, 'VALIDATION_ERROR', 400);
        return;
      }

      // Generate image
      const imageURL = await generateGratitudeImage(content, feeling);

      success(res, { imageURL }, 'Image generated successfully');
    } catch (err: any) {
      console.error('Image generation error:', err);
      error(res, err.message, 'IMAGE_GENERATION_ERROR', 500);
    }
  }
);

// POST /api/v1/ai/generate-custom-image
router.post(
  '/generate-custom-image',
  async (req: Request, res: Response) => {
    try {
      const { prompt, negativePrompt, width, height } = req.body;

      // Validate input
      const validation = generateCustomImageSchema.safeParse({ prompt, negativePrompt, width, height });
      if (!validation.success) {
        error(res, validation.error.errors[0].message, 'VALIDATION_ERROR', 400);
        return;
      }

      // Generate image
      const result = await generateImage(prompt, negativePrompt, {
        width: width || 512,
        height: height || 512,
      });

      success(res, result, 'Image generated successfully');
    } catch (err: any) {
      console.error('Custom image generation error:', err);
      error(res, err.message, 'IMAGE_GENERATION_ERROR', 500);
    }
  }
);

export default router;
