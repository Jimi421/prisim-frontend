// pages/api/images.ts

import type { D1Database } from '@cloudflare/workers-types'

export const runtime = 'edge'

export default async function handler(
  request: Request,
  { env }: { env: { JIMI_DB: D1Database } }
): Promise<Response> {
  try {
    const url = new URL(request.url)
    const gallery = url.searchParams.get('gallery')

    const db = env.JIMI_DB
    const { results } = await db
      .prepare('SELECT * FROM images WHERE gallery = ?')
      .bind(gallery)
      .all()

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err.message || String(err),
        stack: err.stack?.split('\n').slice(0, 3),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

