CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  cat_id TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('medical', 'vaccine', 'medication', 'food', 'accessories', 'grooming', 'insurance', 'other')),
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_expenses_cat_id ON expenses(cat_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
