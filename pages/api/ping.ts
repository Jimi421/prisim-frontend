export const runtime = 'edge'

import type { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { env }: { env: any }
) {
  // Run a simple query to verify the D1 binding
  const { results } = await env.JIMI_DB
    .prepare('SELECT 1 AS ok')
    .all()

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  })
}

