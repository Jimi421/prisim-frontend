// File: pages/api/ping-storage.ts

import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  const { env } = getRequestContext();
  const storageBound = typeof env.PRISIM_BUCKET !== 'undefined';
  return new Response(
    JSON.stringify({ storageBound }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

