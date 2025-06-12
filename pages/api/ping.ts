import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request: Request): Promise<Response> {
  try {
    const { env } = getRequestContext();
    const result = await env.JIMI_DB.prepare('SELECT 1 as result').first();

    return new Response(
      JSON.stringify({ ok: true, result }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
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
    );
  }
}

