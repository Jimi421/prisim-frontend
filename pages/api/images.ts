// File: pages/api/images.ts

import type { NextRequest } from 'next/server'
import { getDb } from '../../lib/db'

export async function GET(
  request: NextRequest,
  { env }: { env: any }    // ← inline type to satisfy TS for now
) {
  const url     = new URL(request.url)
  const gallery = url.searchParams.get('gallery')
  const db      = getDb(env)

  if (!gallery) {
    return new Response(JSON.stringify({ error: 'Missing gallery parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { results } = await db
    .prepare(`SELECT * FROM images WHERE gallery = ?`)
    .bind(gallery)
    .all()

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  })
}

