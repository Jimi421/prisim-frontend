-- 003_add_file_key_column.sql
ALTER TABLE gallery_sketches ADD COLUMN file_key TEXT;

-- Backfill with slug for existing rows
UPDATE gallery_sketches SET file_key = slug WHERE file_key IS NULL;
