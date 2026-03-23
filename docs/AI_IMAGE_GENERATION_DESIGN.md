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
1. **Commercial Quality** - Images suitable for professional use
2. **Emotional Resonance** - Reflect the feeling of gratitude
3. **Consistency** - Cohesive visual style
4. **Personalization** - Unique and tailored cards

### Quality Standards
- Resolution: 1024x1024 (high quality for print and digital)
- Style: Artistic, warm, uplifting
- Color Palette: Warm tones (gold, pink, purple, soft blue)

---

## 🤖 AI Model

**Model:** SDXL 1.0 (`runware:100@1`)
- Best quality for commercial cards
- 1024x1024 resolution
- 40 steps
- DPM++ 2M Karras sampler
- CFG Scale: 7.5

---

## 📝 Prompt Engineering

### Quality Modifiers (always included)
```
commercial quality greeting card,
award-winning design,
professional artwork,
masterpiece,
8k resolution,
highly detailed,
elegant composition,
premium print quality
```

### Negative Prompt (always excluded)
```
text, words, letters, numbers,
watermark, signature, logo,
low quality, blurry, pixelated,
dark, gloomy, scary,
distorted, deformed, ugly
```

---

## 🎭 Emotion-to-Style Mapping

| Emotion | Subject | Style | Colors |
|---------|---------|-------|--------|
| Happy | Sunny meadow, wildflowers | Watercolor | Yellow, orange, gold |
| Joy | Celebration, floating petals | Impressionist | Rainbow, golden |
| Peaceful | Zen garden, cherry blossoms | Minimalist | Blue, green, white |
| Calm | Ocean waves, clouds | Pastel | Lavender, blue, cream |
| Grateful | Golden sunset, warm light | Cinematic | Gold, amber, rose |
| Love | Rose garden, petals | Fine art | Pink, red, white |
| Thankful | Autumn harvest, leaves | Oil painting | Orange, burgundy, gold |
| Hope | Sunrise, mountains | Epic landscape | Pink, gold, blue |
| Inspired | Abstract energy, colors | Expressionism | Purple, magenta, blue |
| Blessed | Divine light, clouds | Spiritual | White, gold, pink |
| Amazed | Starry night, aurora | Fantasy | Purple, silver, cosmic |
| Excited | Energy burst, motion | Contemporary | Vibrant, neon |

---

## 🔧 Technical Specifications

```typescript
{
  model: 'runware:100@1', // SDXL 1.0
  width: 1024,
  height: 1024,
  steps: 40,
  CFGScale: 7.5,
  scheduler: 'DPM++ 2M Karras',
  outputFormat: 'PNG',
  outputType: 'url'
}
```

---

## 📊 Generation Pipeline

1. **Content Analysis**
   - Extract keywords
   - Detect emotion
   - Identify subject matter

2. **Style Selection**
   - Match emotion to style
   - Apply color palette
   - Add artistic direction

3. **Prompt Construction**
   - Combine: subject + style + colors + quality modifiers
   - Add negative prompt

4. **Image Generation**
   - Send to Runware API
   - Return high-quality image URL

---

## 💰 Cost Estimates

- Standard (1024x1024, 40 steps): ~$0.005 per image
- Premium (with upscaling): ~$0.01 per image

---

## 🚀 Future Enhancements

- Multiple style variations per request
- User preference learning
- Custom model fine-tuning
- Animation support

---

**Document Status:** v1.0
