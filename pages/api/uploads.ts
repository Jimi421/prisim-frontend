// Edge API Route: POST /api/uploads (multipart/form-data)
// fields: file, title, style, notes, blackAndWhite ("true"/"false"), gallery
export const config = { runtime: 'edge' as const };

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  // @ts-expect-error provided by next-on-pages
  const { PRISIM_BUCKET, JIMI_DB } = (globalThis as any).env ?? {};
  if (!PRISIM_BUCKET?.put) return json({ ok: false, error: 'R2 bucket not configured' }, { status: 500 });
  if (!JIMI_DB?.prepare) return json({ ok: false, error: 'Database not configured' }, { status: 500 });

  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return json({ ok: false, error: 'Missing file' }, { status: 400 });

    const title = String(form.get('title') ?? '');
    const style = String(form.get('style') ?? '');
    const notes = String(form.get('notes') ?? '');
    const blackAndWhite = String(form.get('blackAndWhite') ?? 'false') === 'true' ? 1 : 0;
    const gallery = String(form.get('gallery') ?? '');

    const bytes = await file.arrayBuffer();

    // Create object key and public URL (adjust if you use custom domain)
    const keyBase = `${Date.now()}-${slugify(title || file.name)}`;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const key = ext ? `${keyBase}.${ext}` : keyBase;

    await PRISIM_BUCKET.put(key, bytes, {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    });

    // If you serve R2 through a public bucket domain, replace the URL format here
    const url = `https://${'prisim'}.r2.cloudflarestorage.com/${key}`;

    const slug = slugify(title || keyBase);

    await JIMI_DB
      .prepare(
        `INSERT INTO gallery_sketches (slug, title, style, notes, black_and_white, url, gallery)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(slug, title, style, notes, blackAndWhite, url, gallery || null)
      .run();

    return json({ ok: true, key, url, slug });
  } catch (err: any) {
    return json({ ok: false, error: err?.message ?? 'Upload server error' }, { status: 500 });
  }
}

