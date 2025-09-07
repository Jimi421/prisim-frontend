// pages/api/images.ts
export const runtime = 'experimental-edge';

type Env = {
  // change only if your binding name is different in wrangler/pages settings
  PRISIM_R2: R2Bucket;
};

export default async function handler(req: Request, env: Env) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key');
    if (!key) return new Response('Missing "key"', { status: 400 });

    const obj = await env.PRISIM_R2.get(key);
    if (!obj) return new Response('Not found', { status: 404 });

    const headers = new Headers();

    // Respect any stored metadata
    const ct =
      obj.httpMetadata?.contentType ||
      obj.customMetadata?.contentType ||
      'application/octet-stream';
    headers.set('Content-Type', ct);
    if (obj.httpMetadata?.cacheControl) {
      headers.set('Cache-Control', obj.httpMetadata.cacheControl);
    } else {
      headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, immutable');
    }

    // Stream body to client
    return new Response(obj.body, { headers, status: 200 });
  } catch (err) {
    return new Response('Internal Error', { status: 500 });
  }
}

