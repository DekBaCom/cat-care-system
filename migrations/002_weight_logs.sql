CREATE TABLE IF NOT EXISTS weight_logs (
  id TEXT PRIMARY KEY,
  cat_id TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  logged_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_weight_logs_cat_id ON weight_logs(cat_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON weight_logs(logged_date);
