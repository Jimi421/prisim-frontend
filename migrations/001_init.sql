PRAGMA foreign_keys = ON;

-- Optional artist table if you want per-user uploads in future
CREATE TABLE artists (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL
);

-- Table of galleries (e.g., trees, portraits, etc.)
CREATE TABLE galleries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id  INTEGER REFERENCES artists(id),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  parent_id  INTEGER REFERENCES galleries(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table of uploaded sketch metadata
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

-- Optional for later: joins multiple sketches into a sequence
CREATE TABLE gallery_sets (
  gallery_id   INTEGER NOT NULL REFERENCES galleries(id),
  sketch_id    INTEGER NOT NULL REFERENCES gallery_sketches(id),
  position     INTEGER DEFAULT 0,
  PRIMARY KEY (gallery_id, sketch_id)
);

