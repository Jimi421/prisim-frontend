// Edge API Route: GET /api/sketches
export const config = { runtime: 'edge' as const };

type Row = {
  id: number;
  slug: string;
  title: string;
  style: string | null;
  black_and_white: number | 0 | 1;
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

  // @ts-expect-error provided by next-on-pages
  const { JIMI_DB } = (globalThis as any).env ?? {};
  if (!JIMI_DB?.prepare) return json({ ok: false, error: 'Database not configured' }, { status: 500 });

  try {
    const stmt = JIMI_DB.prepare(`
      SELECT id, slug, title, style, black_and_white, notes, url, created_at, gallery
      FROM gallery_sketches
      ORDER BY created_at DESC
    `);
    const { results } = await stmt.all<Row>();
    return json({ ok: true, sketches: results });
  } catch (err: any) {
    return json({ ok: false, error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

