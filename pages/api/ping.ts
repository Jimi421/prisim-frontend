// pages/api/ping.ts
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { env } = getRequestContext();
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === 'true';

  // 1) Make sure our binding is there:
  if (!env.JIMI_DB) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Missing D1 binding: JIMI_DB',
        debug,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 2) Sanity check: SELECT 1
    const sanity = await env.JIMI_DB.prepare('SELECT 1 AS result').first();

    // 3) List all tables in the database
    const { results: tables } = await env.JIMI_DB
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all();

    // 4) Return everything
    return new Response(
      JSON.stringify({
        ok: true,
        sanity,
        tables,
        debug,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    // 5) Catch & surface any errors
    console.error('❌ ping failed:', err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: err.message || String(err),
        stack: err.stack?.split('\n').slice(0, 5),
        debug,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

