CREATE TABLE IF NOT EXISTS dewormings (
  id TEXT PRIMARY KEY,
  cat_id TEXT NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  deworming_date TEXT NOT NULL,
  next_due_date TEXT,
  product_name TEXT,
  dose TEXT,
  weight_at_time REAL,
  clinic_name TEXT,
  veterinarian_name TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dewormings_cat_id ON dewormings(cat_id);
CREATE INDEX IF NOT EXISTS idx_dewormings_next_due ON dewormings(next_due_date);
