import { getRequestContext } from '@cloudflare/next-on-pages';

export const config = { runtime: 'experimental-edge' };

export async function GET(request: Request, { params }) {
  const { env } = getRequestContext();
  const key = params.key;
  const object = await env.PRISIM_BUCKET.get(key);
  if (!object) return new Response('Not Found', { status: 404 });

  return new Response(object.body, {
    headers: { 'Content-Type': object.httpMetadata.contentType },
  });
}

