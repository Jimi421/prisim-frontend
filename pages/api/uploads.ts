import { NextRequest, NextResponse } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 })
  }

  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return new NextResponse('Invalid content type', { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file || !(file instanceof File)) {
    return new NextResponse('No file uploaded', { status: 400 })
  }

  const key = crypto.randomUUID()
  const arrayBuffer = await file.arrayBuffer()

  try {
    await env.PRISIM_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    })

    return NextResponse.json({
      success: true,
      key,
      type: file.type,
      size: file.size,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return new NextResponse('Upload failed', { status: 500 })
  }
}

