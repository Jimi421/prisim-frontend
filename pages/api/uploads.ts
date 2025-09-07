export const runtime = 'edge';

type GalleryRow = { id: string };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const env: any = (globalThis as any)?.env ?? {};
    const DB = env.DB ?? env.JIMI_DB;
    const R2: R2Bucket | undefined =
      env.PRISIM_R2 ?? env.BUCKET ?? env.ASSETS ?? env.PRISIM_BUCKET;

    if (!DB?.prepare) return json({ error: 'Database not configured' }, 500);
    if (!R2?.put) return json({ error: 'R2 bucket not configured' }, 500);

    // Edge/Workers support Request.formData() directly
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const gallerySlug = String(form.get('gallery') || '');

    if (!file) return json({ error: 'Missing file' }, 400);
    if (!gallerySlug) return json({ error: 'Missing gallery slug' }, 400);

    const g = (await DB.prepare('SELECT id FROM galleries WHERE slug=?')
      .bind(gallerySlug)
      .first()) as GalleryRow | null;

    if (!g?.id) return json({ error: 'Gallery not found' }, 404);

    const objectKey = `${gallerySlug}/${Date.now()}-${file.name}`;

    await R2.put(objectKey, (file as any).stream(), {
      httpMetadata: { contentType: (file as any).type },
    });

    const id = crypto.randomUUID();
    await DB.prepare(
      'INSERT INTO items (id, gallery_id, key, mime, title) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(id, g.id, objectKey, (file as any).type, file.name)
      .run();

    return json({ id, key: objectKey }, 201);
  } catch (err: any) {
    console.error('uploads API error:', err);
    return json({ error: String(err?.message || err) }, 500);
  }
}

