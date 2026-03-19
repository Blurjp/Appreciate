import { v2 as cloudinary } from 'cloudinary'

let configured = false

function requireEnv(name: 'CLOUDINARY_CLOUD_NAME' | 'CLOUDINARY_API_KEY' | 'CLOUDINARY_API_SECRET') {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name}`)
  }
  return value
}

export function getCloudinary() {
  if (!configured) {
    cloudinary.config({
      cloud_name: requireEnv('CLOUDINARY_CLOUD_NAME'),
      api_key: requireEnv('CLOUDINARY_API_KEY'),
      api_secret: requireEnv('CLOUDINARY_API_SECRET'),
      secure: true,
    })
    configured = true
  }

  return cloudinary
}

export function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder: string
    publicId?: string
    resourceType?: 'image'
  }
) {
  const uploader = getCloudinary().uploader

  return new Promise<{ secureUrl: string; publicId: string }>((resolve, reject) => {
    const stream = uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: options.resourceType ?? 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error('Cloudinary upload failed'))
          return
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        })
      }
    )

    stream.end(buffer)
  })
}
