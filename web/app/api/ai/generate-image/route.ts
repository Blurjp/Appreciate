import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content, feeling } = await req.json()
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }

  const prompt = `serene peaceful beautiful nature background, ${feeling ? feeling + ', ' : ''}soft dreamy light, watercolor style, no text, no people, suitable for a gratitude journal card`

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
        positivePrompt: prompt,
        model: 'runware:100@1',
        numberResults: 1,
        outputType: ['URL'],
        outputFormat: 'WEBP',
        width: 768,
        height: 768,
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
