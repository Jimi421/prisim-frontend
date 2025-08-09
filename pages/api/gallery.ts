// Edge API Route: GET /api/gallery?gallery=<slug>
export const config = { runtime: 'edge' as const };

type Row = {
  id: number;
  slug: string;
  title: string;
  style: string | null;
  notes: string | null;
  black_and_white: number | 0 | 1;
  created_at: string;
  url: string | null;
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
  if (!JIMI_DB?.prepare) return json({ error: 'Database not configured' }, { status: 500 });

  const url = new URL(req.url);
  const gallery = url.searchParams.get('gallery') ?? undefined;

  try {
    let stmt;
    if (gallery) {
      stmt = JIMI_DB.prepare(`
        SELECT id, slug, title, style, notes, black_and_white, created_at, url, gallery
        FROM gallery_sketches
        WHERE gallery = ?
        ORDER BY created_at DESC
      `).bind(gallery);
    } else {
      stmt = JIMI_DB.prepare(`
        SELECT id, slug, title, style, notes, black_and_white, created_at, url, gallery
        FROM gallery_sketches
        ORDER BY created_at DESC
      `);
    }
    const { results } = await stmt.all<Row>();
    return json(results);
  } catch (err: any) {
    return json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

