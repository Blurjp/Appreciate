import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadBufferToCloudinary } from '@/lib/cloudinary'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export async function POST(req: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image must be 10MB or smaller' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'appreciate/posts'
    const safeName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40) || 'image'
    const publicId = `${user.id}-${Date.now()}-${safeName}`

    const upload = await uploadBufferToCloudinary(buffer, {
      folder: `${baseFolder}/${user.id}`,
      publicId,
      resourceType: 'image',
    })

    return NextResponse.json({
      url: upload.secureUrl,
      publicId: upload.publicId,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Image upload failed',
      },
      { status: 500 }
    )
  }
}
