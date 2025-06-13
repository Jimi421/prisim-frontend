// pages/api/ping2.ts
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  const { env } = getRequestContext();

  if (!env.JIMI_DB) {
    // HTTP 500 if the binding is missing
    return new Response('❌ JIMI_DB binding NOT found', { status: 500 });
  }

  // HTTP 200 if it is
  return new Response('✅ JIMI_DB binding IS present');
}

