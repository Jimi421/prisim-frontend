// pages/api/ping.ts
export const runtime = 'edge'

import type { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { env }: { env: any /* & { JIMI_DB: D1Database } */ }
) {
  try {
    // run a trivial query
    const { results } = await env.JIMI_DB
      .prepare('SELECT 1 AS ok')
      .all()

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    // surface the error message
    return new Response(
      JSON.stringify({
        ok: false,
        error: err.message || String(err),
        stack: err.stack?.split('\n').slice(0,3), // first 3 lines
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

