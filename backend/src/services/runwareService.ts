import axios from 'axios';

const RUNWARE_API_URL = 'https://api.runware.ai/v1';

interface RunwareImageRequest {
  taskType: string;
  taskUUID: string;
  input: string[];
  outputType: string;
  outputFormat: string;
  positivePrompt: string;
  negativePrompt: string;
  model: string;
  width: number;
  height: number;
  steps: number;
  numberResults: number;
  CFGScale?: number;
  scheduler?: string;
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

// Emotion-to-Style Mapping for high-quality cards
const EMOTION_STYLES: Record<string, {
  subject: string;
  artistic: string;
  colors: string;
  mood: string;
}> = {
  // Joy & Happiness
  'happy': {
    subject: 'bright sunny meadow, wildflowers swaying',
    artistic: 'watercolor painting style, soft brush strokes',
    colors: 'yellow, orange, light green, golden',
    mood: 'cheerful, vibrant, energetic, uplifting'
  },
  'joy': {
    subject: 'celebration scene, floating petals, dancing light',
    artistic: 'impressionist masterpiece, monet inspired',
    colors: 'vibrant rainbow, golden highlights',
    mood: 'uplifting, celebratory, radiant, joyful'
  },
  
  // Peace & Calm
  'peaceful': {
    subject: 'zen garden, cherry blossoms, tranquil pond',
    artistic: 'minimalist japanese art, clean composition',
    colors: 'soft blue, sage green, white, cream',
    mood: 'serene, tranquil, meditative, calm'
  },
  'calm': {
    subject: 'gentle ocean waves, soft clouds, peaceful horizon',
    artistic: 'soft pastel painting, ethereal style',
    colors: 'lavender, light blue, cream, silver',
    mood: 'soothing, relaxing, gentle, peaceful'
  },
  
  // Love & Gratitude
  'grateful': {
    subject: 'golden sunset over peaceful landscape, warm light rays',
    artistic: 'cinematic photography, golden hour lighting',
    colors: 'gold, amber, rose, warm orange',
    mood: 'warm, heartfelt, sincere, appreciative'
  },
  'love': {
    subject: 'romantic rose garden, floating rose petals, soft bokeh',
    artistic: 'fine art photography, romantic style',
    colors: 'pink, red, soft white, blush',
    mood: 'tender, affectionate, sweet, loving'
  },
  'thankful': {
    subject: 'autumn harvest scene, golden leaves, abundance',
    artistic: 'warm oil painting, rich textures',
    colors: 'orange, burgundy, gold, brown',
    mood: 'abundant, appreciative, warm, bountiful'
  },
  
  // Hope & Inspiration
  'hope': {
    subject: 'sunrise over mountains, new dawn, fresh beginning',
    artistic: 'epic landscape photography, dramatic lighting',
    colors: 'soft pink, light gold, pale blue, lavender',
    mood: 'optimistic, inspiring, fresh, hopeful'
  },
  'inspired': {
    subject: 'abstract creative energy, swirling colors, artistic vision',
    artistic: 'abstract expressionism, dynamic composition',
    colors: 'purple, magenta, electric blue, gold',
    mood: 'dynamic, creative, visionary, inspired'
  },
  'blessed': {
    subject: 'divine light rays through clouds, heavenly sky',
    artistic: 'spiritual art, ethereal atmosphere',
    colors: 'white, gold, pale pink, celestial blue',
    mood: 'spiritual, sacred, grateful, blessed'
  },
  
  // Wonder & Awe
  'amazed': {
    subject: 'magical starry night, aurora borealis, enchanted forest',
    artistic: 'fantasy art, magical realism',
    colors: 'deep purple, silver, starlight, cosmic blue',
    mood: 'wondrous, magical, extraordinary, amazed'
  },
  'excited': {
    subject: 'dynamic energy burst, colorful explosion, vibrant motion',
    artistic: 'contemporary digital art, bold style',
    colors: 'vibrant mix, neon accents, rainbow',
    mood: 'energetic, enthusiastic, lively, excited'
  }
};

// Default fallback style
const DEFAULT_STYLE = {
  subject: 'beautiful serene landscape, nature scene',
  artistic: 'fine art painting, museum quality',
  colors: 'warm harmonious palette, soft tones',
  mood: 'peaceful, beautiful, elegant'
};

// Universal quality modifiers for commercial-grade output
const QUALITY_MODIFIERS = [
  'commercial quality greeting card',
  'award-winning design',
  'professional artwork',
  'masterpiece',
  '8k resolution',
  'highly detailed',
  'elegant composition',
  'premium print quality'
].join(', ');

// Universal negative prompt
const NEGATIVE_PROMPT = [
  'text, words, letters, numbers, writing',
  'watermark, signature, logo, brand name',
  'low quality, blurry, pixelated, grainy',
  'dark, gloomy, scary, ominous',
  'distorted, deformed, ugly',
  'amateur, poorly drawn, messy',
  'crowded, cluttered, chaotic',
  'harsh contrast, oversaturated'
].join(', ');

/**
 * Detect emotion from text
 */
function detectEmotion(text: string): string | null {
  const textLower = text.toLowerCase();
  
  for (const emotion of Object.keys(EMOTION_STYLES)) {
    if (textLower.includes(emotion)) {
      return emotion;
    }
  }
  
  // Keyword-based detection
  const keywordMap: Record<string, string> = {
    'smile': 'happy',
    'laugh': 'joy',
    'peace': 'peaceful',
    'relax': 'calm',
    'thank': 'thankful',
    'appreciate': 'grateful',
    'heart': 'love',
    'dream': 'hope',
    'create': 'inspired',
    'miracle': 'amazed',
    'wonder': 'amazed',
    'celebrate': 'excited',
    'blessing': 'blessed',
    'gift': 'thankful'
  };
  
  for (const [keyword, emotion] of Object.entries(keywordMap)) {
    if (textLower.includes(keyword)) {
      return emotion;
    }
  }
  
  return null;
}

/**
 * Extract key subjects from gratitude content
 */
function extractSubjects(content: string): string[] {
  const subjects: string[] = [];
  const contentLower = content.toLowerCase();
  
  // Nature subjects
  if (contentLower.includes('nature') || contentLower.includes('outdoor')) {
    subjects.push('natural landscape');
  }
  if (contentLower.includes('garden') || contentLower.includes('flower')) {
    subjects.push('beautiful flowers');
  }
  if (contentLower.includes('sun') || contentLower.includes('sunshine')) {
    subjects.push('sunlight');
  }
  if (contentLower.includes('water') || contentLower.includes('ocean') || contentLower.includes('sea')) {
    subjects.push('water elements');
  }
  if (contentLower.includes('sky') || contentLower.includes('cloud')) {
    subjects.push('sky scenery');
  }
  
  return subjects;
}

/**
 * Construct high-quality prompt for commercial card generation
 */
function constructPrompt(
  content: string,
  feeling?: string,
  options?: {
    style?: string;
    model?: string;
  }
): { positive: string; negative: string } {
  // Detect emotion from content or feeling
  const detectedEmotion = feeling || detectEmotion(content) || '';
  
  // Get style configuration
  const style = EMOTION_STYLES[detectedEmotion.toLowerCase()] || DEFAULT_STYLE;
  
  // Extract additional subjects from content
  const subjects = extractSubjects(content);
  const subjectsText = subjects.length > 0 ? subjects.join(', ') : style.subject;
  
  // Construct positive prompt
  const positiveParts = [
    subjectsText,
    style.artistic,
    style.colors,
    style.mood,
    QUALITY_MODIFIERS,
    'perfect for text overlay',
    'balanced composition',
    'greeting card design'
  ];
  
  const positive = positiveParts.filter(Boolean).join(', ');
  
  return {
    positive,
    negative: NEGATIVE_PROMPT
  };
}

/**
 * Generate a commercial-grade appreciation card image
 */
export async function generateGratitudeImage(
  content: string,
  feeling?: string
): Promise<string> {
  const apiKey = process.env.RUNWARE_API_KEY;
  
  if (!apiKey) {
    throw new Error('RUNWARE_API_KEY environment variable is not set');
  }

  // Construct high-quality prompt
  const { positive, negative } = constructPrompt(content, feeling);
  
  const taskUUID = crypto.randomUUID();

  const requestBody: RunwareImageRequest[] = [
    {
      taskType: 'imageInference',
      taskUUID: taskUUID,
      input: [],
      outputType: 'url',
      outputFormat: 'PNG',
      positivePrompt: positive,
      negativePrompt: negative,
      model: 'runware:100@1', // SDXL 1.0 for best quality
      width: 1024,
      height: 1024,
      steps: 40,
      numberResults: 1,
      CFGScale: 7.5,
      scheduler: 'DPM++ 2M Karras'
    }
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
    return imageData.imageURL;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Runware API error:', error.response?.data || error.message);
      throw new Error(`Failed to generate image: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Generate custom image with user-specified parameters
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

  // Enhance prompt with quality modifiers
  const enhancedPrompt = `${prompt}, ${QUALITY_MODIFIERS}`;
  const finalNegativePrompt = negativePrompt 
    ? `${NEGATIVE_PROMPT}, ${negativePrompt}`
    : NEGATIVE_PROMPT;

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
      model: options?.model || 'runware:100@1',
      width: options?.width || 1024,
      height: options?.height || 1024,
      steps: 40,
      numberResults: 1,
      CFGScale: 7.5,
      scheduler: 'DPM++ 2M Karras'
    }
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
 * Generate multiple style variations for user to choose
 */
export async function generateStyleVariations(
  content: string,
  feeling?: string,
  count: number = 3
): Promise<string[]> {
  const apiKey = process.env.RUNWARE_API_KEY;
  
  if (!apiKey) {
    throw new Error('RUNWARE_API_KEY environment variable is not set');
  }

  // Get base prompt
  const { positive, negative } = constructPrompt(content, feeling);
  
  // Define different artistic styles
  const styleVariations = [
    'watercolor painting style',
    'photography style, realistic',
    'abstract art style',
    'impressionist painting',
    'digital art, modern',
    'fine art, classical'
  ];

  const requests: RunwareImageRequest[] = [];
  
  for (let i = 0; i < Math.min(count, styleVariations.length); i++) {
    const taskUUID = crypto.randomUUID();
    const stylePrompt = `${positive}, ${styleVariations[i]}`;
    
    requests.push({
      taskType: 'imageInference',
      taskUUID: taskUUID,
      input: [],
      outputType: 'url',
      outputFormat: 'PNG',
      positivePrompt: stylePrompt,
      negativePrompt: negative,
      model: 'runware:100@1',
      width: 1024,
      height: 1024,
      steps: 40,
      numberResults: 1,
      CFGScale: 7.5,
      scheduler: 'DPM++ 2M Karras'
    });
  }

  try {
    const response = await axios.post<RunwareImageResponse | RunwareError>(
      RUNWARE_API_URL,
      requests,
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

    // Extract image URLs
    const data = response.data as RunwareImageResponse;
    if (!data.data || data.data.length === 0) {
      throw new Error('No images generated');
    }

    return data.data.map(img => img.imageURL);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Runware API error:', error.response?.data || error.message);
      throw new Error(`Failed to generate images: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
    throw error;
  }
}
