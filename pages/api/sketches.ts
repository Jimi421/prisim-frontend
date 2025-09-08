export const config = { runtime: 'edge' };

type ItemRow = {
  id: string;
  gallery_id: string;
  key: string;
  mime: string;
  title: string;
  tags: string;
  favorite: number;
  created_at: number;
};
type GalleryRow = { id: string };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });

    const env: any = (globalThis as any)?.env ?? {};
    const DB = env.DB;
    const R2: R2Bucket | undefined =
      env.PRISIM_R2 ?? env.BUCKET ?? env.ASSETS ?? env.PRISIM_BUCKET;

    if (!DB?.prepare) return json({ error: 'Database not configured' }, 500);

    const url = new URL(req.url);
    const slug = url.searchParams.get('slug') || undefined;

    let galleryId: string | undefined;
    if (slug) {
      const g = (await DB.prepare('SELECT id FROM galleries WHERE slug = ?')
        .bind(slug)
        .first()) as GalleryRow | null;
      if (!g?.id) return json({ error: 'Gallery not found' }, 404);
      galleryId = g.id;
    }

    const baseSQL =
      'SELECT id, gallery_id, key, mime, title, tags, favorite, created_at ' +
      'FROM items WHERE tags LIKE \'%"sketch"%\'';
    const sql = galleryId ? `${baseSQL} AND gallery_id = ? ORDER BY created_at DESC`
                          : `${baseSQL} ORDER BY created_at DESC`;

    const stmt = galleryId ? DB.prepare(sql).bind(galleryId) : DB.prepare(sql);
    const { results } = await stmt.all();

    const enriched = await Promise.all(
      (results as ItemRow[]).map(async (row) => {
        if (!R2?.head) return { ...row, exists: null as boolean | null };
        try {
          const head = await R2.head(row.key);
          return { ...row, exists: !!head };
        } catch {
          return { ...row, exists: false };
        }
      })
    );

    return json(enriched);
  } catch (err: any) {
    console.error('sketches API error:', err);
    return json({ error: String(err?.message || err) }, 500);
  }
}

