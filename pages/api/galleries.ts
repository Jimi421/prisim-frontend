// File: pages/api/galleries.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getDb } from '../../lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = getDb(process.env as any)
  const { results } = await db
    .prepare(`SELECT * FROM galleries`)
    .all()

  res.status(200).json(results)
}

