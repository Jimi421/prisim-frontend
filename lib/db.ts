// prisim-frontend/lib/db.ts
// Utility for Next.js API routes to access the D1 binding

import { D1Database } from '@cloudflare/workers-types';

export function getDb(env: { JIMI_DB: D1Database }) {
  return env.JIMI_DB;
}

