// pages/api/upload.ts
import { getRequestContext } from '@cloudflare/next-on-pages'; 
// (this gives you access to env.JIMI_DB & env.PRISIM_BUCKET)
 
export const config = {
  runtime: 'experimental-edge',
};
 
export async function POST(request: Request) {
  // 1. Grab the Cloudflare bindings
  const { env } = getRequestContext();
  const db = env.JIMI_DB;
  const bucket = env.PRISIM_BUCKET;
 
  // 2. Parse the multipart/form-data
  const form = await request.formData();
  const file = form.get('file') as File;
  const title = (form.get('title') as string) || 'Untitled';
  const style = (form.get('style') as string) || 'unknown';
  const bwFlag = form.get('blackAndWhite') === 'on';
  const notes = (form.get('notes') as string) || '';
 
  if (!file || typeof file.name !== 'string') {
    return new Response(JSON.stringify({ ok: false, error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
 
  // 3. Generate a unique key & upload to R2
  const key = `${Date.now()}_${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  await bucket.put(key, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  });
 
  // 4. Record metadata in D1
  const createdAt = new Date().toISOString();
  await db.prepare(`
    INSERT INTO gallery_sketches 
      (slug, title, notes, style, black_and_white, created_at, url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      key.replace(/\W+/g, '-').toLowerCase(), // slug
      title,
      notes,
      style,
      bwFlag ? 1 : 0,
      createdAt,
      `https://<your-pages-domain>/.netlify/functions/r2/${key}` // or your public URL pattern
    )
    .run();
 
  // 5. Return success + new record info
  return new Response(
    JSON.stringify({
      ok: true,
      key,
      sketch: { slug: key, title, style, blackAndWhite: bwFlag, createdAt },
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

