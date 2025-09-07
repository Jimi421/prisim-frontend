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
    const DB = env.DB ?? env.JIMI_DB;
    const R2: R2Bucket | undefined =
      env.PRISIM_R2 ?? env.BUCKET ?? env.ASSETS ?? env.PRISIM_BUCKET;

    if (!DB?.prepare) return json({ error: 'Database not configured' }, 500);
    if (!R2?.head) return json({ error: 'R2 bucket not configured' }, 500);

    const { results } = await DB.prepare(
      'SELECT id, gallery_id, key, mime, title, tags, favorite, created_at \
       FROM items ORDER BY created_at DESC'
    ).all();

    const bucketName = env.PRISIM_R2 || env.BUCKET || env.ASSETS || env.PRISIM_BUCKET;

    const enriched = await Promise.all(
      (results as ItemRow[]).map(async (row) => {
        try {
          const head = await R2.head(row.key);
          const url = head ? `https://pub-${bucketName}.r2.dev/${row.key}` : null;
          return { ...row, url };
        } catch {
          return { ...row, url: null };
        }
      })
    );

    return json(enriched);
  } catch (err: any) {
    console.error('images API error:', err);
    return json({ error: String(err?.message || err) }, 500);
  }
}

