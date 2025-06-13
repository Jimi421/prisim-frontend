import { getRequestContext } from '@cloudflare/next-on-pages';

export const config = {
  runtime: 'edge',
};

export async function POST(request: Request) {
  const { env } = getRequestContext();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const filename = `${Date.now()}_${file.name}`;

    await env.PRISIM_BUCKET.put(filename, arrayBuffer);

    return new Response(
      JSON.stringify({ ok: true, key: filename }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Upload failed', details: (err as Error).message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}

