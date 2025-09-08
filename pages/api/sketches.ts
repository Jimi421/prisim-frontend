// pages/api/sketches.ts
export const config = { runtime: 'edge' };

type Row = {
  id: number;
  slug: string;
  title: string;
  style: string | null;
  black_and_white: number;
  notes: string | null;
  url: string | null;
  created_at: string;
  gallery: string | null;
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

export default async function handler(req: Request) {
  if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });

  try {
    const env: any = (globalThis as any)?.env ?? {};
    const DB = env.JIMI_DB;
    
    if (!DB?.prepare) {
      console.error('Database binding not found. Available env keys:', Object.keys(env));
      return json({ ok: false, error: 'Database not configured' }, { status: 500 });
    }

    const stmt = DB.prepare(`
      SELECT id, slug, title, style, black_and_white, notes, url, created_at, gallery
      FROM gallery_sketches
      ORDER BY created_at DESC
    `);
    
    const { results } = await stmt.all<Row>();
    return json({ ok: true, sketches: results });
  } catch (err: any) {
    console.error('Database query error:', err);
    return json({ ok: false, error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
