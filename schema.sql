CREATE TABLE gallery_sketches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  gallery TEXT NOT NULL DEFAULT 'default',
  file_key TEXT NOT NULL,
  style TEXT,
  black_and_white INTEGER DEFAULT 0,
  notes TEXT,
  url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

