-- 002_add_gallery_column.sql
ALTER TABLE gallery_sketches
  ADD COLUMN gallery TEXT NOT NULL DEFAULT 'default';

