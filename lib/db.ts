// prisim-frontend/lib/db.ts
// Utility for Next.js API routes to access the DB binding

import { D1Database } from '@cloudflare/workers-types';

export function getDb(env: { DB: D1Database }) {
  return env.DB;
}

