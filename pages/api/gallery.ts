// pages/api/gallery.ts
// Next.js (pages router) API route running on the Edge, using Cloudflare D1 typings.

import { getEnv } from '../../lib/getEnv';

export const config = { runtime: 'edge' };

type GalleryRow = {
  id: number;
  slug: string;
  title: string;
  cover_url?: string | null;
};

type Env = {
  JIMI_DB: D1Database;
};

export default async function handler(req: Request, ctx: any): Promise<Response> {
  try {
    const env = getEnv<Env>(req, ctx);
    if (!env?.JIMI_DB) {
      return json({ error: 'D1 binding JIMI_DB not available' }, 500);
    }

    const db = env.JIMI_DB;

    // Adjust the query/columns to match your schema
    const query = `
      SELECT id, slug, title, cover_url
      FROM galleries
      ORDER BY id DESC
    `;

    const stmt = db.prepare(query);
    // Make sure TypeScript knows this is a D1PreparedStatement so generics are allowed:
    const { results } = await (stmt as D1PreparedStatement).all<GalleryRow>();

    return json(results ?? []);
  } catch (err: any) {
    // Surface a helpful error in JSON without leaking internals.
    return json({ error: err?.message || 'Failed to load galleries' }, 500);
  }
}

// Small helper for JSON responses
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

