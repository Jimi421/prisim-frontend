-- prisim-frontend/migrations/001_init.sql

PRAGMA foreign_keys = ON;

CREATE TABLE artists (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE galleries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id  INTEGER NOT NULL REFERENCES artists(id),
  name       TEXT    NOT NULL,
  slug       TEXT    UNIQUE NOT NULL,
  parent_id  INTEGER REFERENCES galleries(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  url        TEXT    NOT NULL,
  title      TEXT,
  metadata   JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gallery_images (
  gallery_id INTEGER NOT NULL REFERENCES galleries(id),
  image_id   INTEGER NOT NULL REFERENCES images(id),
  position   INTEGER DEFAULT 0,
  PRIMARY KEY (gallery_id, image_id)
);

