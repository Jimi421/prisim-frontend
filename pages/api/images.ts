// File: pages/api/images.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getDb } from '../../lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { gallery } = req.query
  const db = getDb(process.env as any)

  if (!gallery || typeof gallery !== 'string') {
    res.status(400).json({ error: 'Missing gallery parameter' })
    return
  }

  const { results } = await db
    .prepare(`SELECT * FROM images WHERE gallery = ?`)
    .bind(gallery)
    .all()

  res.status(200).json(results)
}

