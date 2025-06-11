export const runtime = 'edge'

import type { NextRequest } from 'next/server'
import { getDb }            from '../../lib/db'

export async function GET(
  request: NextRequest,
  { env }: { env: any }
) {
  const db      = getDb(env)
  const { results } = await db
    .prepare(`SELECT * FROM galleries`)
    .all()

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  })
}

