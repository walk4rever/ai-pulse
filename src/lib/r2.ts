import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import path from 'path'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export interface UploadResult {
  url: string
  key: string
}

export async function uploadToR2(file: File, folder = 'posts'): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`不支持的文件类型: ${file.type}`)
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`文件过大，最大支持 10 MB`)
  }

  const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`
  const key = `${folder}/${randomUUID()}${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )

  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL!
  return { url: `${publicUrl}/${key}`, key }
}
