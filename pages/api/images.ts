// Edge API Route: GET /api/images?gallery=<slug>
export const config = { runtime: 'edge' as const };

type Row = {
  id: number;
  url: string;
  title: string;
  gallery: string;
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
        SELECT i.id, i.url, COALESCE(i.title, '') AS title, g.slug AS gallery
        FROM images i
        JOIN gallery_images gi ON gi.image_id = i.id
        JOIN galleries g ON g.id = gi.gallery_id
        WHERE g.slug = ?
        ORDER BY gi.position, i.created_at DESC
      `).bind(gallery);
    } else {
      stmt = JIMI_DB.prepare(`
        SELECT i.id, i.url, COALESCE(i.title, '') AS title, g.slug AS gallery
        FROM images i
        JOIN gallery_images gi ON gi.image_id = i.id
        JOIN galleries g ON g.id = gi.gallery_id
        ORDER BY g.name, gi.position, i.created_at DESC
      `);
    }
    const { results } = await stmt.all<Row>();
    return json(results);
  } catch (err: any) {
    return json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

