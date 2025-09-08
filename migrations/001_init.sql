-- D1-safe init (no WAL/FTS). You can add FTS later as 002.sql.
PRAGMA foreign_keys = ON;

-- ===== core =====
CREATE TABLE IF NOT EXISTS galleries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  cover_url   TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS assets (
  id          TEXT PRIMARY KEY,             -- uuid
  gallery_id  INTEGER NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  gallery     TEXT,                         -- denormalized gallery slug
  r2_key      TEXT NOT NULL UNIQUE,
  file_key    TEXT,                         -- alias of r2_key
  filename    TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size_bytes  INTEGER NOT NULL DEFAULT 0,
  width       INTEGER,
  height      INTEGER,
  duration_ms INTEGER,
  title       TEXT,
  caption     TEXT,
  is_favorite INTEGER NOT NULL DEFAULT 0,   -- 0/1
  kind        TEXT NOT NULL DEFAULT 'image',-- 'image'|'sketch'|'video'
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_assets_gallery       ON assets(gallery_id);
CREATE INDEX IF NOT EXISTS idx_assets_gallery_slug ON assets(gallery);
CREATE INDEX IF NOT EXISTS idx_assets_kind          ON assets(kind);
CREATE INDEX IF NOT EXISTS idx_assets_favorite      ON assets(is_favorite) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS asset_tags (
  asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  tag_id   INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (asset_id, tag_id)
);

-- ===== housekeeping =====
CREATE TRIGGER IF NOT EXISTS trg_galleries_updated_at
AFTER UPDATE ON galleries
BEGIN
  UPDATE galleries
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_assets_updated_at
AFTER UPDATE ON assets
BEGIN
  UPDATE assets
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
  WHERE id = NEW.id;
END;

-- ===== helpful view =====
CREATE VIEW IF NOT EXISTS v_gallery_counts AS
SELECT
  g.id,
  g.slug,
  g.title,
  COUNT(a.id) AS asset_count,
  SUM(CASE WHEN a.is_favorite = 1 AND a.deleted_at IS NULL THEN 1 ELSE 0 END) AS favorite_count
FROM galleries g
LEFT JOIN assets a
  ON a.gallery_id = g.id AND a.deleted_at IS NULL
GROUP BY g.id, g.slug, g.title;

