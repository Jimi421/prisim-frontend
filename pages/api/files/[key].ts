// pages/api/files/[key].ts
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    const env: any = (globalThis as any)?.env ?? {};
    const R2 = env.PRISIM_BUCKET;
    
    if (!R2?.get) {
      return new Response('R2 bucket not configured', { status: 500 });
    }

    // Extract the key from the URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const key = pathParts[pathParts.length - 1]; // Get last part of path

    if (!key) {
      return new Response('Missing file key', { status: 400 });
    }

    const object = await R2.get(decodeURIComponent(key));
    
    if (!object) {
      return new Response('File not found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=3600');
    
    return new Response(object.body, { headers });
  } catch (err: any) {
    console.error('Error serving file:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
