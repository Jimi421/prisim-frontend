import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client'; // or your preferred DB client

// Required for parsing multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Replace with your own R2 + D1 logic
const uploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file || Array.isArray(files.file)) {
      return res.status(400).json({ ok: false, error: 'Invalid file upload' });
    }

    try {
      const file = files.file;
      const { filepath, originalFilename } = file;
      const data = await fs.promises.readFile(filepath);
      const fileKey = `uploads/${Date.now()}-${originalFilename}`;

      // ✅ Upload to R2 using the Vercel blob API or Cloudflare's SDK
      const blob = await put(fileKey, data, {
        access: 'public',
      });

      // ✅ Store metadata in D1 (sketch slug, style, etc.)
      const prisma = new PrismaClient(); // or your D1 equivalent
      await prisma.gallery_sketches.create({
        data: {
          slug: fields.slug as string,
          title: fields.title as string,
          notes: fields.notes as string,
          created_at: new Date().toISOString(),
          style: fields.style as string,
        },
      });

      return res.status(200).json({ ok: true, fileUrl: blob.url });
    } catch (e) {
      console.error('Upload error', e);
      return res.status(500).json({ ok: false, error: 'Upload failed' });
    }
  });
};

export default uploadHandler;

