// pages/api/ping.ts

import type { D1Database } from '@cloudflare/workers-types'

export const config = {
  runtime: 'edge',
}

export default async function handler(
  request: Request,
  { env }: { env: { JIMI_DB: D1Database } }
) {
  try {
    // ping the D1 binding
    const { results } = await env.JIMI_DB.prepare('SELECT 1 AS ok').all()
    return new Response(
      JSON.stringify({ ok: true, results }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err.message || String(err),
        // truncate stack for brevity
        stack: err.stack?.split('\n').slice(0, 3),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

