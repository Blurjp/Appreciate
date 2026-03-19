import axios from 'axios';

const RUNWARE_API_URL = 'https://api.runware.ai/v1';

interface RunwareImageRequest {
  taskType: string;
  taskUUID: string;
  input: string[];
  outputType: string;
  outputFormat: string;
  positivePrompt: string;
  negativePrompt?: string;
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
  numberResults?: number;
  seed?: number;
}

interface RunwareImageResponse {
  data: Array<{
    taskType: string;
    taskUUID: string;
    imageUUID: string;
    imageURL: string;
    cost?: number;
  }>;
}

interface RunwareError {
  errors: Array<{
    code: string;
    message: string;
    taskUUID?: string;
  }>;
}

/**
 * Generate an image using Runware AI
 * @param prompt The positive prompt describing the image to generate
 * @param negativePrompt Optional negative prompt (things to avoid)
 * @param options Additional options (width, height, etc.)
 * @returns The generated image URL
 */
export async function generateImage(
  prompt: string,
  negativePrompt?: string,
  options?: {
    width?: number;
    height?: number;
    model?: string;
    style?: string;
  }
): Promise<{ imageURL: string; cost?: number }> {
  const apiKey = process.env.RUNWARE_API_KEY;
  
  if (!apiKey) {
    throw new Error('RUNWARE_API_KEY environment variable is not set');
  }

  // Enhance prompt with gratitude theme
  const enhancedPrompt = `beautiful gratitude appreciation card, ${prompt}, warm and uplifting, artistic, inspirational, soft lighting, high quality`;

  const defaultNegativePrompt = 'text, words, letters, numbers, watermark, low quality, blurry, dark, gloomy, scary';
  const finalNegativePrompt = negativePrompt 
    ? `${defaultNegativePrompt}, ${negativePrompt}`
    : defaultNegativePrompt;

  const taskUUID = crypto.randomUUID();

  const requestBody: RunwareImageRequest[] = [
    {
      taskType: 'imageInference',
      taskUUID: taskUUID,
      input: [],
      outputType: 'url',
      outputFormat: 'PNG',
      positivePrompt: enhancedPrompt,
      negativePrompt: finalNegativePrompt,
      model: options?.model || 'civitai:43831@128713', // DreamShaper model
      width: options?.width || 512,
      height: options?.height || 512,
      steps: 30,
      numberResults: 1,
    },
  ];

  try {
    const response = await axios.post<RunwareImageResponse | RunwareError>(
      RUNWARE_API_URL,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Check for errors
    if ('errors' in response.data) {
      const errors = response.data.errors;
      throw new Error(errors.map((e: any) => e.message).join(', '));
    }

    // Extract image URL
    const data = response.data as RunwareImageResponse;
    if (!data.data || data.data.length === 0) {
      throw new Error('No image generated');
    }

    const imageData = data.data[0];
    return {
      imageURL: imageData.imageURL,
      cost: imageData.cost,
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Runware API error:', error.response?.data || error.message);
      throw new Error(`Failed to generate image: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Generate multiple style variations of gratitude images
 * @param content The gratitude content
 * @param feeling The feeling/emotion
 * @returns Array of generated image URLs
 */
export async function generateGratitudeImage(
  content: string,
  feeling?: string
): Promise<string> {
  // Create a prompt based on the gratitude content and feeling
  const feelingStyle = getStyleFromFeeling(feeling);
  const prompt = feelingStyle
    ? `${content.slice(0, 100)}, ${feelingStyle} style`
    : content.slice(0, 100);

  const result = await generateImage(prompt, undefined, {
    width: 512,
    height: 512,
  });

  return result.imageURL;
}

/**
 * Map feelings to artistic styles
 */
function getStyleFromFeeling(feeling?: string): string | null {
  if (!feeling) return null;

  const feelingLower = feeling.toLowerCase();
  
  const styleMap: Record<string, string> = {
    'happy': 'bright and colorful, watercolor',
    'joy': 'vibrant, impressionist',
    'peaceful': 'soft pastel, serene landscape',
    'calm': 'minimalist, zen garden',
    'grateful': 'warm sunset, golden hour',
    'love': 'romantic, soft pink and red',
    'hope': 'sunrise, new beginning',
    'inspired': 'abstract, creative energy',
    'blessed': 'heavenly, divine light',
    'thankful': 'autumn colors, harvest',
    'content': 'cozy, comfortable',
    'amazed': 'magical, fantasy',
    'excited': 'dynamic, energetic',
  };

  for (const [key, style] of Object.entries(styleMap)) {
    if (feelingLower.includes(key)) {
      return style;
    }
  }

  return 'beautiful, artistic';
}
