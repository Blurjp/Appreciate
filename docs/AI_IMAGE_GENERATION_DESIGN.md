# AI Image Generation Design Document
## Appreciation Card Image Generator

**Version:** 1.0  
**Last Updated:** 2026-03-19  
**Author:** AI Team

---

## 🎯 Overview

Generate beautiful, commercial-grade appreciation card images using Runware AI that match the user's gratitude content and emotional context.

---

## 🎨 Design Goals

### Primary Goals
1. **Commercial Quality** - Images should be suitable for professional use
2. **Emotional Resonance** - Images should reflect the feeling of gratitude
3. **Consistency** - Maintain a cohesive visual style across all generated cards
4. **Personalization** - Each card should feel unique and tailored to the content

### Quality Standards
- Resolution: 1024x1024 (high quality for print and digital)
- Style: Artistic, warm, uplifting
- Color Palette: Warm tones (gold, pink, purple, soft blue)
- Composition: Balanced, with space for text overlay

---

## 🤖 AI Model Selection

### Recommended Models (in order of preference)

| Model | ID | Style | Best For |
|-------|----|----|----------|
| **DreamShaper v8** | `civitai:43831@128713` | Artistic, dreamy | General gratitude cards |
| **SDXL 1.0** | `runware:100@1` | High quality, realistic | Professional cards |
| **Realistic Vision v5** | `civitai:29266@237333` | Photorealistic | Nature scenes |
| **Juggernaut XL** | `civitai:133005@150369` | Cinematic | Dramatic cards |
| **Deliberate v3** | `civitai:15228@252417` | Detailed artistic | Abstract gratitude |

---

## 📝 Prompt Engineering

### Master Prompt Template

```
[SUBJECT], [STYLE], [MOOD], [COLOR PALETTE], [COMPOSITION], [QUALITY MODIFIERS]
```

### Base Prompts by Category

#### 1. Nature & Serenity
```
Positive: "serene nature landscape, golden hour sunlight, peaceful meadow with wildflowers, soft bokeh background, warm color palette, cinematic lighting, 8k quality, masterpiece, commercial photography"

Negative: "text, words, letters, people, faces, buildings, dark, gloomy, blurry, low quality, distorted, watermark"
```

#### 2. Abstract Art
```
Positive: "abstract gratitude art, flowing organic shapes, warm gradient colors, gold and pink tones, elegant curves, ethereal atmosphere, high-end design, award-winning digital art"

Negative: "text, sharp edges, harsh contrast, dark colors, messy, chaotic, low resolution"
```

#### 3. Celestial & Magical
```
Positive: "magical starry night sky, aurora borealis, ethereal glow, cosmic beauty, divine light rays, heavenly atmosphere, spiritual awakening, majestic, commercial artwork"

Negative: "text, scary, dark, ominous, sharp objects, earthly elements"
```

#### 4. Floral & Botanical
```
Positive: "beautiful blooming flowers, rose petals floating, soft pink and white palette, morning dew drops, macro photography, elegant botanical illustration, premium greeting card design"

Negative: "text, wilted flowers, brown spots, insects, dirt, harsh lighting"
```

#### 5. Watercolor & Artistic
```
Positive: "watercolor gratitude painting, soft brush strokes, pastel colors, artistic expression, hand-painted greeting card, delicate details, museum quality artwork"

Negative: "text, sharp lines, digital artifacts, oversaturated, muddy colors"
```

---

## 🎭 Emotion-to-Style Mapping

### Feeling-Based Style Selection

```typescript
const EMOTION_STYLES = {
  // Joy & Happiness
  'happy': {
    style: 'bright watercolor, sunny meadow',
    colors: 'yellow, orange, light green',
    mood: 'cheerful, vibrant, energetic'
  },
  'joy': {
    style: 'impressionist painting, celebration',
    colors: 'vibrant rainbow, golden',
    mood: 'uplifting, celebratory, radiant'
  },
  
  // Peace & Calm
  'peaceful': {
    style: 'zen garden, minimalist landscape',
    colors: 'soft blue, sage green, white',
    mood: 'serene, tranquil, meditative'
  },
  'calm': {
    style: 'soft pastel clouds, gentle waves',
    colors: 'lavender, light blue, cream',
    mood: 'soothing, relaxing, gentle'
  },
  
  // Love & Gratitude
  'grateful': {
    style: 'warm sunset, golden hour',
    colors: 'gold, amber, rose',
    mood: 'warm, heartfelt, sincere'
  },
  'love': {
    style: 'romantic garden, rose petals',
    colors: 'pink, red, soft white',
    mood: 'tender, affectionate, sweet'
  },
  'thankful': {
    style: 'autumn harvest, falling leaves',
    colors: 'orange, burgundy, gold',
    mood: 'abundant, appreciative, warm'
  },
  
  // Hope & Inspiration
  'hope': {
    style: 'sunrise over mountains, new beginning',
    colors: 'soft pink, light gold, pale blue',
    mood: 'optimistic, inspiring, fresh'
  },
  'inspired': {
    style: 'abstract energy, creative spark',
    colors: 'purple, magenta, electric blue',
    mood: 'dynamic, creative, visionary'
  },
  'blessed': {
    style: 'divine light, heavenly clouds',
    colors: 'white, gold, pale pink',
    mood: 'spiritual, sacred, grateful'
  },
  
  // Wonder & Awe
  'amazed': {
    style: 'magical fantasy, enchanted forest',
    colors: 'deep purple, silver, starlight',
    mood: 'wondrous, magical, extraordinary'
  },
  'excited': {
    style: 'dynamic energy, bursting colors',
    colors: 'vibrant mix, neon accents',
    mood: 'energetic, enthusiastic, lively'
  }
};
```

---

## 🔧 Technical Specifications

### Image Generation Parameters

```typescript
interface GenerationConfig {
  // Core Settings
  width: 1024;           // High resolution
  height: 1024;          // Square format for cards
  steps: 40;             // Higher steps for quality
  CFGScale: 7.5;         // Balance creativity and accuracy
  
  // Quality Enhancers
  sampler: 'DPM++ 2M Karras';  // High quality sampler
  seed: random;          // Unique each time
  
  // Output
  outputFormat: 'PNG';
  outputType: 'url';
  
  // Cost Optimization
  numberResults: 1;      // Single image per request
}
```

### Advanced Settings

```typescript
interface AdvancedConfig {
  // Detail Enhancement
  hiresFix: true;        // Enable high-res fix
  hiresSteps: 20;        // Additional refinement steps
  upscaleFactor: 2;      // 2x upscaling
  
  // Style Control
  clipSkip: 2;           // Skip last CLIP layer for creativity
  
  // Safety
  nsfwFilter: true;      // Always enabled for commercial use
}
```

---

## 📊 Prompt Enhancement Pipeline

### Step 1: Content Analysis
```typescript
function analyzeContent(content: string, feeling: string): ContentAnalysis {
  return {
    keywords: extractKeywords(content),
    sentiment: analyzeSentiment(content),
    emotionCategory: categorizeEmotion(feeling),
    subjectMatter: identifySubject(content)
  };
}
```

### Step 2: Style Selection
```typescript
function selectStyle(analysis: ContentAnalysis): StyleConfig {
  // Match emotion to predefined style
  // Consider subject matter
  // Balance with sentiment
  return {
    baseStyle: getEmotionStyle(analysis.emotionCategory),
    enhancements: getSubjectEnhancements(analysis.subjectMatter),
    colorPalette: generateColorPalette(analysis.sentiment)
  };
}
```

### Step 3: Prompt Construction
```typescript
function constructPrompt(
  content: string,
  style: StyleConfig
): { positive: string; negative: string } {
  const positive = [
    style.baseStyle.subject,
    style.baseStyle.artistic,
    style.enhancements.join(', '),
    style.colorPalette,
    'commercial quality',
    'award-winning design',
    'professional greeting card',
    'masterpiece',
    '8k resolution'
  ].join(', ');

  const negative = [
    'text, words, letters, numbers',
    'watermark, signature, logo',
    'low quality, blurry, pixelated',
    'dark, gloomy, scary',
    'distorted, deformed',
    'amateur, poorly drawn'
  ].join(', ');

  return { positive, negative };
}
```

---

## 🎨 Visual Style Guidelines

### Color Theory

#### Warm Gratitude (Love, Thankful, Grateful)
- **Primary:** Gold (#FFD700), Rose (#FFB6C1)
- **Secondary:** Amber (#FFBF00), Coral (#FF7F50)
- **Accent:** Cream (#FFFDD0), Peach (#FFDAB9)

#### Cool Serenity (Peaceful, Calm, Blessed)
- **Primary:** Lavender (#E6E6FA), Sky Blue (#87CEEB)
- **Secondary:** Sage Green (#9DC183), Mint (#98FF98)
- **Accent:** White (#FFFFFF), Silver (#C0C0C0)

#### Vibrant Joy (Happy, Excited, Inspired)
- **Primary:** Coral (#FF6B6B), Turquoise (#40E0D0)
- **Secondary:** Magenta (#FF00FF), Gold (#FFD700)
- **Accent:** Electric Blue (#7DF9FF), Lime (#32CD32)

#### Ethereal Wonder (Amazed, Hope, Blessed)
- **Primary:** Soft Purple (#E1D5E7), Pale Pink (#FFD1DC)
- **Secondary:** Light Gold (#FDFD96), Ice Blue (#D6FFFA)
- **Accent:** White (#FFFFFF), Pearl (#F0EAD6)

---

## 🖼️ Composition Guidelines

### Rule of Thirds
- Main subject should align with intersection points
- Leave space for text overlay (top or bottom third)

### Visual Hierarchy
1. **Background:** Gradient or scene (60% of visual weight)
2. **Midground:** Main subject or pattern (30% of visual weight)
3. **Foreground:** Subtle elements (10% of visual weight)

### Text Overlay Space
- Reserve 20-30% of image for text
- Typically top or bottom of image
- Avoid busy patterns in text area

---

## 📈 Quality Assurance

### Automated Checks
```typescript
interface QualityCheck {
  resolution: boolean;      // Must be >= 1024x1024
  colorBalance: boolean;   // No oversaturation
  clarity: boolean;        // No blur or artifacts
  appropriateness: boolean; // No NSFW content
  composition: boolean;    // Follows rule of thirds
}
```

### Manual Review Criteria
- [ ] Emotionally resonant with content
- [ ] Commercial quality appearance
- [ ] Suitable for text overlay
- [ ] Matches brand aesthetic
- [ ] No copyright concerns

---

## 💰 Cost Optimization

### Strategies
1. **Batch Generation:** Generate multiple cards in one API call
2. **Caching:** Store common style templates
3. **Smart Defaults:** Use lower steps for drafts, higher for final
4. **Model Selection:** Use lighter models for simple requests

### Cost Estimates (per image)
- Standard Quality (512x512, 30 steps): ~$0.002
- High Quality (1024x1024, 40 steps): ~$0.005
- Premium (1024x1024, 50 steps + upscale): ~$0.01

---

## 🚀 Implementation Roadmap

### Phase 1: MVP (Current)
- [x] Basic image generation
- [x] Single model support
- [x] Simple prompt construction

### Phase 2: Enhanced Quality
- [ ] Multiple model support
- [ ] Advanced prompt engineering
- [ ] Emotion-based style selection
- [ ] Quality scoring system

### Phase 3: Personalization
- [ ] User preference learning
- [ ] Style customization options
- [ ] Brand template support
- [ ] A/B testing for styles

### Phase 4: Advanced Features
- [ ] Animation support
- [ ] Custom model fine-tuning
- [ ] Real-time generation
- [ ] Multi-language support

---

## 📚 References

### Inspiration Sources
- Hallmark Premium Cards
- Papyrus Greeting Cards
- Minted Art Collection
- Society6 Artists

### Technical Resources
- [Runware API Documentation](https://docs.runware.ai)
- [Stable Diffusion Prompt Guide](https://stable-diffusion-art.com)
- [Color Theory for Designers](https://www.smashingmagazine.com/color-theory/)

---

## 📝 Appendix

### Sample Prompts Library

#### Wedding Gratitude
```
Positive: "elegant white roses bouquet, soft candlelight, romantic atmosphere, golden accents, luxury wedding card design, sophisticated, premium quality"

Negative: "text, dark, cluttered, casual, informal"
```

#### Birthday Appreciation
```
Positive: "colorful balloons floating, confetti, festive atmosphere, bright cheerful colors, celebration, joy, premium birthday card design"

Negative: "text, sad, dark, adult themes, scary"
```

#### Thank You Card
```
Positive: "handwritten thank you note on vintage paper, surrounded by watercolor flowers, elegant script, warm heartfelt, premium stationery design"

Negative: "printed text, modern harsh lines, cold colors"
```

---

**Document Status:** Draft v1.0  
**Next Review:** 2026-04-01
