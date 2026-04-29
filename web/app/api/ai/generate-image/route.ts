import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const EMOTION_STYLES: Record<string, { scene: string; colors: string; mood: string }> = {
  happy:    { scene: 'bright watercolor meadow, wildflowers in sunlight', colors: 'yellow, orange, light green', mood: 'cheerful, vibrant, energetic' },
  joy:      { scene: 'impressionist garden celebration, light streaming through trees', colors: 'vibrant rainbow, golden', mood: 'uplifting, celebratory, radiant' },
  excited:  { scene: 'dynamic bursting colors, abstract energy flow', colors: 'coral, turquoise, magenta', mood: 'energetic, enthusiastic, lively' },
  peaceful: { scene: 'zen garden, still water reflection, morning mist', colors: 'soft blue, sage green, white', mood: 'serene, tranquil, meditative' },
  calm:     { scene: 'soft pastel clouds, gentle ocean waves at dawn', colors: 'lavender, light blue, cream', mood: 'soothing, relaxing, gentle' },
  grateful: { scene: 'warm sunset over rolling hills, golden hour', colors: 'gold, amber, rose', mood: 'warm, heartfelt, sincere' },
  love:     { scene: 'romantic garden, rose petals on water', colors: 'pink, red, soft white', mood: 'tender, affectionate, sweet' },
  thankful: { scene: 'autumn harvest landscape, falling golden leaves', colors: 'orange, burgundy, gold', mood: 'abundant, appreciative, warm' },
  hope:     { scene: 'sunrise over mountains, first light breaking through', colors: 'soft pink, light gold, pale blue', mood: 'optimistic, inspiring, fresh' },
  inspired: { scene: 'abstract flowing energy, creative spark trails', colors: 'purple, magenta, electric blue', mood: 'dynamic, creative, visionary' },
  blessed:  { scene: 'divine light rays through clouds, heavenly glow', colors: 'white, gold, pale pink', mood: 'spiritual, sacred, ethereal' },
  amazed:   { scene: 'enchanted forest with bioluminescent flowers', colors: 'deep purple, silver, starlight blue', mood: 'wondrous, magical, extraordinary' },
}

const NEGATIVE_PROMPT = 'text, words, letters, numbers, watermark, signature, logo, people, faces, hands, dark, gloomy, scary, blurry, pixelated, low quality, distorted, deformed, amateur'

function matchEmotion(feeling: string): { scene: string; colors: string; mood: string } {
  const lower = feeling.toLowerCase()
  for (const [key, style] of Object.entries(EMOTION_STYLES)) {
    if (lower.includes(key)) return style
  }
  return EMOTION_STYLES.grateful
}

function buildPrompt(feeling?: string, photoPaletteHint?: string, hasPhotoReference?: boolean): string {
  const style = matchEmotion(feeling || 'grateful')
  return [
    style.scene,
    `${style.mood} atmosphere`,
    `${style.colors} color palette`,
    photoPaletteHint ? `inspired by uploaded photo palette: ${photoPaletteHint}` : null,
    hasPhotoReference ? 'keep visual harmony with the uploaded reference photo while creating a new background' : null,
    'soft dreamy light, beautiful composition with space for text overlay',
    'commercial greeting card quality, masterpiece, 8k resolution',
  ].filter(Boolean).join(', ')
}

export async function POST(req: NextRequest) {
  // Try cookie-based auth first (web), then Bearer token (iOS)
  let userId: string | undefined

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    userId = user.id
  } else {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (token) {
      const tokenClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      const { data: { user: tokenUser } } = await tokenClient.auth.getUser(token)
      if (tokenUser) userId = tokenUser.id
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content, feeling, photoPaletteHint, hasPhotoReference } = await req.json()
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }

  const positivePrompt = buildPrompt(feeling, photoPaletteHint, hasPhotoReference)
  const taskUUID = crypto.randomUUID()

  const response = await fetch('https://api.runware.ai/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RUNWARE_API_KEY}`,
    },
    body: JSON.stringify([
      {
        taskType: 'imageInference',
        taskUUID,
        positivePrompt,
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
      },
    ]),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Runware error:', err)
    return NextResponse.json({ error: 'Image generation failed' }, { status: 502 })
  }

  const result = await response.json()
  const imageURL = result?.data?.[0]?.imageURL

  if (!imageURL) {
    return NextResponse.json({ error: 'No image returned' }, { status: 502 })
  }

  return NextResponse.json({ data: { imageURL } })
}
