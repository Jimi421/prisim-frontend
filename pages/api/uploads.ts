// pages/api/uploads.ts
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

  try {
    const env: any = (globalThis as any)?.env ?? {};
    const DB = env.JIMI_DB;
    const R2 = env.PRISIM_BUCKET;

    if (!R2?.put) {
      console.error('R2 binding not found. Available env keys:', Object.keys(env));
      return json({ ok: false, error: 'R2 bucket not configured' }, { status: 500 });
    }
    if (!DB?.prepare) {
      console.error('DB binding not found. Available env keys:', Object.keys(env));
      return json({ ok: false, error: 'Database not configured' }, { status: 500 });
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return json({ ok: false, error: 'Missing file' }, { status: 400 });

    const title = String(form.get('title') ?? '');
    const style = String(form.get('style') ?? '');
    const notes = String(form.get('notes') ?? '');
    const blackAndWhite = String(form.get('blackAndWhite') ?? '0') === '1' ? 1 : 0;
    const gallery = String(form.get('gallery') ?? 'default');

    const bytes = await file.arrayBuffer();

    // Create object key
    const keyBase = `${Date.now()}-${slugify(title || file.name)}`;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const key = ext ? `${keyBase}.${ext}` : keyBase;

    // Upload to R2
    await R2.put(key, bytes, {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    });

    // Create the public URL
    // You'll need to either:
    // 1. Set up a public bucket URL in R2 settings
    // 2. Or serve files through your API
    const url = `/api/files/${key}`; // Serve through API
    
    const slug = `${Date.now()}-${slugify(title || keyBase)}`; // Make unique

    // Insert into database - matching YOUR schema
    await DB.prepare(
      `INSERT INTO gallery_sketches (slug, title, style, notes, black_and_white, url, gallery, file_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(slug, title, style, notes, blackAndWhite, url, gallery, key)
    .run();

    return json({ ok: true, key, url, slug });
  } catch (err: any) {
    console.error('Upload error:', err);
    return json({ ok: false, error: err?.message ?? 'Upload server error' }, { status: 500 });
  }
}
