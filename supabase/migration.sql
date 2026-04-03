-- =============================================
-- DAILY DRINK COMPANION - Phase 1 Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Ingredients table
CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  normalized_name VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50), -- alcohol, mixer, fruit, herb, sweetener, etc.
  is_alcoholic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Drinks table
CREATE TABLE drinks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  image_url TEXT,
  is_alcoholic BOOLEAN NOT NULL,
  prep_time_minutes INT DEFAULT 5,
  difficulty VARCHAR(20) DEFAULT 'easy', -- easy, medium, hard
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Drink Ingredients (many-to-many join)
CREATE TABLE drink_ingredients (
  id SERIAL PRIMARY KEY,
  drink_id INT REFERENCES drinks(id) ON DELETE CASCADE,
  ingredient_id INT REFERENCES ingredients(id),
  quantity VARCHAR(50),
  is_optional BOOLEAN DEFAULT FALSE
);

-- 4. Drink Steps
CREATE TABLE drink_steps (
  id SERIAL PRIMARY KEY,
  drink_id INT REFERENCES drinks(id) ON DELETE CASCADE,
  step_number INT,
  instruction TEXT
);

-- 5. Drink Tags
CREATE TABLE drink_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE
);

-- 6. Drink Tag Map (many-to-many)
CREATE TABLE drink_tag_map (
  drink_id INT REFERENCES drinks(id) ON DELETE CASCADE,
  tag_id INT REFERENCES drink_tags(id),
  PRIMARY KEY (drink_id, tag_id)
);

-- 7. Favorites (future user support)
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  drink_id INT REFERENCES drinks(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_ingredients_name ON ingredients(normalized_name);
CREATE INDEX idx_drink_ingredients_drink ON drink_ingredients(drink_id);
CREATE INDEX idx_drink_ingredients_ingredient ON drink_ingredients(ingredient_id);
CREATE INDEX idx_drinks_alcoholic ON drinks(is_alcoholic);
CREATE INDEX idx_drink_steps_drink ON drink_steps(drink_id);

-- =============================================
-- ROW LEVEL SECURITY (allow public read)
-- =============================================
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_tag_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public read on drinks" ON drinks FOR SELECT USING (true);
CREATE POLICY "Allow public read on drink_ingredients" ON drink_ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public read on drink_steps" ON drink_steps FOR SELECT USING (true);
CREATE POLICY "Allow public read on drink_tags" ON drink_tags FOR SELECT USING (true);
CREATE POLICY "Allow public read on drink_tag_map" ON drink_tag_map FOR SELECT USING (true);
