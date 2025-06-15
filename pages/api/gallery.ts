import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest, context: any) {
  const { env } = context;
  const url = new URL(req.url);
  const gallery = url.searchParams.get('gallery') || 'default';

  try {
    const query = `
      SELECT slug AS id, title, '/api/' || slug AS url
      FROM gallery_sketches
      WHERE gallery = ?1
      ORDER BY rowid DESC
    `;
    const { results } = await env.JIMI_DB.prepare(query).bind(gallery).all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

