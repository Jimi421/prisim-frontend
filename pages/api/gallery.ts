// pages/api/gallery.ts
export const config = { runtime: 'edge' };

type Row = {
  id: number;
  slug: string;
  title: string;
  style: string | null;
  notes: string | null;
  black_and_white: number;
  created_at: string;
  url: string | null;
  gallery: string | null;
  file_key: string | null;
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
    // Access the environment bindings
    const env: any = (globalThis as any)?.env ?? {};
    const DB = env.JIMI_DB;
    
    if (!DB?.prepare) {
      console.error('Database binding not found. Available env keys:', Object.keys(env));
      return json({ error: 'Database not configured' }, { status: 500 });
    }

    const url = new URL(req.url);
    const gallery = url.searchParams.get('gallery') ?? undefined;

    let stmt;
    if (gallery) {
      stmt = DB.prepare(`
        SELECT id, slug, title, style, notes, black_and_white, created_at, url, gallery, file_key
        FROM gallery_sketches
        WHERE gallery = ?
        ORDER BY created_at DESC
      `).bind(gallery);
    } else {
      stmt = DB.prepare(`
        SELECT id, slug, title, style, notes, black_and_white, created_at, url, gallery, file_key
        FROM gallery_sketches
        ORDER BY created_at DESC
      `);
    }
    
    const { results } = await stmt.all<Row>();
    return json(results);
  } catch (err: any) {
    console.error('Database query error:', err);
    return json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
