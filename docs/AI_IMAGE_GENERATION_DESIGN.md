# AI Image Generation Design Document
## Appreciation Card Image Generator

**Version:** 2.0
**Last Updated:** 2026-03-19

---

## Overview

Generate beautiful appreciation card backgrounds using Runware AI, tailored to the user's gratitude content and emotional context. Pro-only feature gated by Stripe subscription.

---

## Current Stack

| Component | Value |
|-----------|-------|
| Provider | Runware AI (`api.runware.ai/v1`) |
| Model | `runware:100@1` (SDXL 1.0) |
| Output | 1024x1024 PNG |
| Auth | `RUNWARE_API_KEY` env var |
| API Route | `web/app/api/ai/generate-image/route.ts` |
| Gating | Pro subscription (`is_pro` on profiles table) |

---

## Prompt Engineering

### Emotion-to-Style Mapping

The prompt is dynamically constructed based on the user's `feeling` field. When no feeling is provided, defaults to "grateful".

```typescript
const EMOTION_STYLES: Record<string, { scene: string; colors: string; mood: string }> = {
  // Joy & Happiness
  happy:    { scene: 'bright watercolor meadow, wildflowers in sunlight', colors: 'yellow, orange, light green', mood: 'cheerful, vibrant, energetic' },
  joy:      { scene: 'impressionist garden celebration, light streaming through trees', colors: 'vibrant rainbow, golden', mood: 'uplifting, celebratory, radiant' },
  excited:  { scene: 'dynamic bursting colors, abstract energy flow', colors: 'coral, turquoise, magenta', mood: 'energetic, enthusiastic, lively' },

  // Peace & Calm
  peaceful: { scene: 'zen garden, still water reflection, morning mist', colors: 'soft blue, sage green, white', mood: 'serene, tranquil, meditative' },
  calm:     { scene: 'soft pastel clouds, gentle ocean waves at dawn', colors: 'lavender, light blue, cream', mood: 'soothing, relaxing, gentle' },

  // Love & Gratitude
  grateful: { scene: 'warm sunset over rolling hills, golden hour', colors: 'gold, amber, rose', mood: 'warm, heartfelt, sincere' },
  love:     { scene: 'romantic garden, rose petals on water', colors: 'pink, red, soft white', mood: 'tender, affectionate, sweet' },
  thankful: { scene: 'autumn harvest landscape, falling golden leaves', colors: 'orange, burgundy, gold', mood: 'abundant, appreciative, warm' },

  // Hope & Inspiration
  hope:     { scene: 'sunrise over mountains, first light breaking through', colors: 'soft pink, light gold, pale blue', mood: 'optimistic, inspiring, fresh' },
  inspired: { scene: 'abstract flowing energy, creative spark trails', colors: 'purple, magenta, electric blue', mood: 'dynamic, creative, visionary' },
  blessed:  { scene: 'divine light rays through clouds, heavenly glow', colors: 'white, gold, pale pink', mood: 'spiritual, sacred, ethereal' },

  // Wonder & Awe
  amazed:   { scene: 'enchanted forest with bioluminescent flowers', colors: 'deep purple, silver, starlight blue', mood: 'wondrous, magical, extraordinary' },
};
```

Feeling matching is fuzzy — the system checks if the user's feeling string contains any of these keys (case-insensitive). Falls back to `grateful` if no match.

### Prompt Construction

```
Positive: "{scene}, {mood} atmosphere, {colors} color palette,
           soft dreamy light, beautiful composition with space for text overlay,
           commercial greeting card quality, masterpiece, 8k resolution"

Negative: "text, words, letters, numbers, watermark, signature, logo,
           people, faces, hands, dark, gloomy, scary, blurry, pixelated,
           low quality, distorted, deformed, amateur"
```

---

## API Parameters

```typescript
{
  taskType: 'imageInference',
  taskUUID: crypto.randomUUID(),
  positivePrompt: constructedPrompt,
  negativePrompt: NEGATIVE_PROMPT,
  model: 'runware:100@1',
  numberResults: 1,
  outputType: ['URL'],
  outputFormat: 'PNG',
  width: 1024,
  height: 1024,
  steps: 35,
  CFGScale: 7.5,
  scheduler: 'DPM++ 2M Karras',
}
```

### Parameter Rationale

| Parameter | Value | Why |
|-----------|-------|-----|
| `width/height` | 1024 | High quality for retina screens and potential print use |
| `steps` | 35 | Good quality/speed balance (40+ marginal improvement) |
| `CFGScale` | 7.5 | Standard — prompt-adherent without being rigid |
| `scheduler` | DPM++ 2M Karras | Best overall quality for landscape/art generation |
| `outputFormat` | PNG | Lossless quality for card backgrounds |

---

## Cost

- ~$0.003-0.005 per image at 1024x1024 with 35 steps
- Pro-only gating prevents abuse
- Single image per request (no batch generation needed)

---

## Alternative Models

If SDXL quality is insufficient for specific styles, consider:

| Model | ID | Best For |
|-------|-----|----------|
| DreamShaper v8 | `civitai:43831@128713` | Dreamy, artistic watercolor styles |
| Realistic Vision v5 | `civitai:29266@237333` | Photorealistic nature scenes |
| Juggernaut XL | `civitai:133005@150369` | Cinematic, dramatic compositions |

Current SDXL (`runware:100@1`) is the best all-around choice for varied gratitude themes.

---

## Future Improvements

- **User preference learning** — Track which styles users regenerate vs keep, bias toward preferred styles
- **Category-aware prompts** — Use the post category (Family, Nature, Work, etc.) to further refine the scene
- **Style presets** — Let users pick a style direction before generating (watercolor, photorealistic, abstract)
- **Multi-image generation** — Generate 2-3 options and let user pick
