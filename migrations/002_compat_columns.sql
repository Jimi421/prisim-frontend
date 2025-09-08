-- 002_compat_columns.sql
PRAGMA foreign_keys = ON;

-- Add columns your code might be querying
ALTER TABLE assets ADD COLUMN file_key TEXT;        -- alias of r2_key
ALTER TABLE assets ADD COLUMN gallery  TEXT;        -- alias of gallery slug (denormalized)
ALTER TABLE galleries ADD COLUMN cover_key TEXT;    -- optional cover image key

-- Backfill file_key from r2_key
UPDATE assets SET file_key = r2_key WHERE file_key IS NULL;

-- Backfill gallery from the gallery slug
UPDATE assets
SET gallery = (
  SELECT slug FROM galleries g WHERE g.id = assets.gallery_id
)
WHERE gallery IS NULL;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_assets_gallery_slug ON assets(gallery);
CREATE INDEX IF NOT EXISTS idx_galleries_cover_key ON galleries(cover_key);

