import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { content, feeling } = await req.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }

  // Build a prompt that creates a beautiful, peaceful background
  const keywords = feeling ? `${content} ${feeling}` : content
  const prompt = `serene peaceful beautiful nature background for gratitude journal, ${keywords.slice(0, 100)}, soft light, dreamy, watercolor, no text, no people`

  // Pollinations.ai — free AI image generation, no API key required
  const encoded = encodeURIComponent(prompt)
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true&seed=${Date.now()}`

  // Verify the image is reachable
  try {
    const check = await fetch(imageUrl, { method: 'HEAD' })
    if (!check.ok) throw new Error('Image service unavailable')
  } catch {
    return NextResponse.json({ error: 'Image generation failed' }, { status: 502 })
  }

  return NextResponse.json({ data: { imageURL: imageUrl } })
}
