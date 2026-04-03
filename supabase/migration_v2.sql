-- =============================================
-- PHASE 1 IMPROVEMENTS — Migration v2
-- Run AFTER migration.sql and seed.sql
-- =============================================

-- 1. Ingredient aliases for synonym matching
ALTER TABLE ingredients ADD COLUMN aliases TEXT[] DEFAULT '{}';

-- 2. Base spirit indicator
ALTER TABLE ingredients ADD COLUMN is_base_spirit BOOLEAN DEFAULT FALSE;

-- 3. Precomputed required ingredient count (CRITICAL for matching performance)
ALTER TABLE drinks ADD COLUMN ingredient_count INT DEFAULT 0;

-- 4. Popularity score for dynamic ranking
ALTER TABLE drinks ADD COLUMN popularity_score INT DEFAULT 0;

-- 5. Full-text search vector
ALTER TABLE drinks ADD COLUMN search_vector tsvector;

-- 6. Thumbnail URL for cards
ALTER TABLE drinks ADD COLUMN thumbnail_url TEXT;

-- =============================================
-- ANALYTICS TABLE
-- =============================================
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,    -- 'ingredients_selected', 'drink_viewed', 'search'
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert on analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service read on analytics" ON analytics_events FOR SELECT USING (true);

-- =============================================
-- POPULATE PRECOMPUTED FIELDS
-- =============================================

-- Set ingredient_count = number of required (non-optional) ingredients per drink
UPDATE drinks d SET ingredient_count = (
  SELECT COUNT(*) FROM drink_ingredients di
  WHERE di.drink_id = d.id AND di.is_optional = FALSE
);

-- Build search_vector from drink name + description
UPDATE drinks SET search_vector =
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''));

-- Create index on search_vector
CREATE INDEX idx_drinks_search_vector ON drinks USING GIN(search_vector);

-- =============================================
-- TRIGGER: auto-update search_vector on insert/update
-- =============================================
CREATE OR REPLACE FUNCTION drinks_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_drinks_search_vector
  BEFORE INSERT OR UPDATE ON drinks
  FOR EACH ROW EXECUTE FUNCTION drinks_search_vector_trigger();

-- =============================================
-- TRIGGER: auto-update ingredient_count on drink_ingredients change
-- =============================================
CREATE OR REPLACE FUNCTION update_ingredient_count() RETURNS trigger AS $$
BEGIN
  UPDATE drinks SET ingredient_count = (
    SELECT COUNT(*) FROM drink_ingredients
    WHERE drink_id = COALESCE(NEW.drink_id, OLD.drink_id) AND is_optional = FALSE
  ) WHERE id = COALESCE(NEW.drink_id, OLD.drink_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_ingredient_count
  AFTER INSERT OR UPDATE OR DELETE ON drink_ingredients
  FOR EACH ROW EXECUTE FUNCTION update_ingredient_count();

-- =============================================
-- SEED: aliases and base spirits
-- =============================================
UPDATE ingredients SET aliases = ARRAY['lemon juice', 'nimbu', 'fresh lemon'] WHERE normalized_name = 'lemon';
UPDATE ingredients SET aliases = ARRAY['lime juice', 'fresh lime'] WHERE normalized_name = 'lime';
UPDATE ingredients SET aliases = ARRAY['oj', 'fresh orange juice'] WHERE normalized_name = 'orange_juice';
UPDATE ingredients SET aliases = ARRAY['pineapple', 'fresh pineapple juice'] WHERE normalized_name = 'pineapple_juice';
UPDATE ingredients SET aliases = ARRAY['coke', 'pepsi', 'coca cola'] WHERE normalized_name = 'cola';
UPDATE ingredients SET aliases = ARRAY['sparkling water', 'club soda'] WHERE normalized_name = 'soda_water';
UPDATE ingredients SET aliases = ARRAY['spearmint', 'fresh mint', 'pudina'] WHERE normalized_name = 'mint';
UPDATE ingredients SET aliases = ARRAY['white sugar', 'cane sugar'] WHERE normalized_name = 'sugar';
UPDATE ingredients SET aliases = ARRAY['whole milk', 'full cream milk'] WHERE normalized_name = 'milk';
UPDATE ingredients SET aliases = ARRAY['espresso', 'brewed coffee', 'cold brew'] WHERE normalized_name = 'coffee';
UPDATE ingredients SET aliases = ARRAY['green tea', 'black tea', 'chai'] WHERE normalized_name = 'tea';
UPDATE ingredients SET aliases = ARRAY['adrak', 'fresh ginger'] WHERE normalized_name = 'ginger';
UPDATE ingredients SET aliases = ARRAY['7up', 'lemon lime soda'] WHERE normalized_name = 'sprite';

UPDATE ingredients SET is_base_spirit = TRUE WHERE normalized_name IN ('white_rum', 'vodka', 'gin', 'tequila', 'whiskey');

-- Seed popularity scores (based on how common/well-known drinks are)
UPDATE drinks SET popularity_score = 95 WHERE name = 'Mojito';
UPDATE drinks SET popularity_score = 90 WHERE name = 'Gin & Tonic';
UPDATE drinks SET popularity_score = 88 WHERE name = 'Margarita';
UPDATE drinks SET popularity_score = 80 WHERE name = 'Whiskey Sour';
UPDATE drinks SET popularity_score = 85 WHERE name = 'Piña Colada';
UPDATE drinks SET popularity_score = 70 WHERE name = 'Cuba Libre';
UPDATE drinks SET popularity_score = 75 WHERE name = 'Vodka Cranberry';
UPDATE drinks SET popularity_score = 82 WHERE name = 'Moscow Mule';
UPDATE drinks SET popularity_score = 92 WHERE name = 'Virgin Mojito';
UPDATE drinks SET popularity_score = 78 WHERE name = 'Mango Lassi';
UPDATE drinks SET popularity_score = 93 WHERE name = 'Fresh Lemonade';
UPDATE drinks SET popularity_score = 72 WHERE name = 'Shirley Temple';
UPDATE drinks SET popularity_score = 96 WHERE name = 'Iced Coffee';
UPDATE drinks SET popularity_score = 68 WHERE name = 'Watermelon Cooler';
UPDATE drinks SET popularity_score = 74 WHERE name = 'Ginger Honey Tea';
