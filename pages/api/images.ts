// prisim-frontend/pages/api/images.ts
import type { NextRequest } from 'next/server';
import { getDb } from '../../lib/db';

export async function GET(request: NextRequest, { env }) {
  const url = new URL(request.url);
  const gallery = url.searchParams.get('gallery');
  const db = getDb(env);

  let query = `SELECT i.* FROM images i
               JOIN gallery_images gi ON gi.image_id = i.id`;
  const params: any[] = [];

  if (gallery) {
    query += ` WHERE gi.gallery_id = ?`;
    params.push(gallery);
  }

  const { results } = await db.prepare(query).bind(...params).all();
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
}

