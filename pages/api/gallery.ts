export const config = { runtime: 'edge' };

type GalleryRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  created_at: number;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  try {
    const env: any = (globalThis as any)?.env ?? {};
    const DB = env.DB ?? env.JIMI_DB;
    if (!DB?.prepare) return json({ error: 'Database not configured' }, 500);

    if (req.method === 'GET') {
      const { results } = await DB.prepare(
        'SELECT id, slug, title, description, created_at FROM galleries ORDER BY created_at DESC'
      ).all();
      return json(results as GalleryRow[]);
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { slug, title, description = '' } = body || {};
      if (!slug || !title) return json({ error: 'Missing slug or title' }, 400);

      const id = crypto.randomUUID();
      await DB.prepare(
        'INSERT INTO galleries (id, slug, title, description) VALUES (?, ?, ?, ?)'
      )
        .bind(id, slug, title, description)
        .run();

      return json({ id, slug, title, description }, 201);
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err: any) {
    console.error('gallery API error:', err);
    return json({ error: String(err?.message || err) }, 500);
  }
}

