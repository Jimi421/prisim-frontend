// pages/api/gallery.ts
import type { NextRequest } from 'next/server';

export const config = { runtime: 'edge' };

type Env = {
  JIMI_DB: D1Database;
  PRISIM_BUCKET: R2Bucket;
};

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

export default async function handler(request: NextRequest, env: Env) {
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Access bindings from env parameter
  if (!env?.JIMI_DB) {
    console.error('JIMI_DB binding not found');
    return json({ error: 'Database not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const gallery = searchParams.get('gallery') ?? undefined;

  try {
    let stmt;
    if (gallery) {
      stmt = env.JIMI_DB.prepare(`
        SELECT id, slug, title, style, notes, black_and_white, created_at, url, gallery
        FROM gallery_sketches
        WHERE gallery = ?
        ORDER BY created_at DESC
      `).bind(gallery);
    } else {
      stmt = env.JIMI_DB.prepare(`
        SELECT id, slug, title, style, notes, black_and_white, created_at, url, gallery
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
