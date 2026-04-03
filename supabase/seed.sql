-- =============================================
-- SEED DATA - Daily Drink Companion
-- Run after migration.sql in Supabase SQL Editor
-- =============================================

-- Tags
INSERT INTO drink_tags (name) VALUES
  ('quick'), ('party'), ('budget'), ('refreshing'), ('classic'), ('tropical'), ('creamy'), ('warm');

-- Ingredients
INSERT INTO ingredients (name, normalized_name, type, is_alcoholic) VALUES
  ('White Rum', 'white_rum', 'alcohol', true),
  ('Vodka', 'vodka', 'alcohol', true),
  ('Gin', 'gin', 'alcohol', true),
  ('Tequila', 'tequila', 'alcohol', true),
  ('Whiskey', 'whiskey', 'alcohol', true),
  ('Triple Sec', 'triple_sec', 'alcohol', true),
  ('Kahlua', 'kahlua', 'alcohol', true),
  ('Baileys', 'baileys', 'alcohol', true),
  ('Lemon', 'lemon', 'fruit', false),
  ('Lime', 'lime', 'fruit', false),
  ('Orange', 'orange', 'fruit', false),
  ('Pineapple Juice', 'pineapple_juice', 'juice', false),
  ('Orange Juice', 'orange_juice', 'juice', false),
  ('Cranberry Juice', 'cranberry_juice', 'juice', false),
  ('Coconut Cream', 'coconut_cream', 'mixer', false),
  ('Soda Water', 'soda_water', 'mixer', false),
  ('Cola', 'cola', 'mixer', false),
  ('Tonic Water', 'tonic_water', 'mixer', false),
  ('Ginger Beer', 'ginger_beer', 'mixer', false),
  ('Mint Leaves', 'mint', 'herb', false),
  ('Sugar', 'sugar', 'sweetener', false),
  ('Simple Syrup', 'simple_syrup', 'sweetener', false),
  ('Grenadine', 'grenadine', 'sweetener', false),
  ('Ice', 'ice', 'other', false),
  ('Salt', 'salt', 'other', false),
  ('Milk', 'milk', 'dairy', false),
  ('Cream', 'cream', 'dairy', false),
  ('Coffee', 'coffee', 'other', false),
  ('Tea', 'tea', 'other', false),
  ('Honey', 'honey', 'sweetener', false),
  ('Ginger', 'ginger', 'herb', false),
  ('Mango', 'mango', 'fruit', false),
  ('Strawberry', 'strawberry', 'fruit', false),
  ('Watermelon', 'watermelon', 'fruit', false),
  ('Banana', 'banana', 'fruit', false),
  ('Coconut Water', 'coconut_water', 'mixer', false),
  ('Sprite/7Up', 'sprite', 'mixer', false),
  ('Angostura Bitters', 'angostura_bitters', 'alcohol', true),
  ('Blue Curacao', 'blue_curacao', 'alcohol', true),
  ('Peach Schnapps', 'peach_schnapps', 'alcohol', true);

-- =============================================
-- ALCOHOLIC DRINKS
-- =============================================

-- 1. Mojito
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Mojito', 'A refreshing Cuban cocktail with rum, lime, mint, and soda water.', true, 3, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('white_rum', '60ml', false),
  ('lime', '1 whole', false),
  ('mint', '10 leaves', false),
  ('sugar', '2 tsp', false),
  ('soda_water', 'top up', false),
  ('ice', 'full glass', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Mojito';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Muddle mint leaves and sugar in a glass.'),
  (2, 'Squeeze lime juice and drop lime into the glass.'),
  (3, 'Add rum and fill with ice.'),
  (4, 'Top with soda water and stir gently.')
) AS v(step_number, instruction)
WHERE d.name = 'Mojito';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Mojito' AND t.name IN ('classic', 'refreshing');

-- 2. Gin & Tonic
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Gin & Tonic', 'A timeless classic. Crisp, clean, and refreshing.', true, 1, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('gin', '60ml', false),
  ('tonic_water', '120ml', false),
  ('lime', '1 wedge', true),
  ('ice', 'full glass', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Gin & Tonic';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Fill a glass with ice.'),
  (2, 'Pour gin over the ice.'),
  (3, 'Top with tonic water and stir once.'),
  (4, 'Garnish with a lime wedge.')
) AS v(step_number, instruction)
WHERE d.name = 'Gin & Tonic';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Gin & Tonic' AND t.name IN ('quick', 'classic');

-- 3. Margarita
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Margarita', 'A tangy tequila cocktail with lime and triple sec.', true, 3, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('tequila', '60ml', false),
  ('triple_sec', '30ml', false),
  ('lime', '30ml juice', false),
  ('salt', 'rim', true),
  ('ice', 'full glass', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Margarita';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Rim glass with salt (optional).'),
  (2, 'Shake tequila, triple sec, and lime juice with ice.'),
  (3, 'Strain into the glass.'),
  (4, 'Garnish with a lime wedge.')
) AS v(step_number, instruction)
WHERE d.name = 'Margarita';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Margarita' AND t.name IN ('classic', 'party');

-- 4. Whiskey Sour
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Whiskey Sour', 'A bold mix of whiskey, lemon juice, and simple syrup.', true, 3, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('whiskey', '60ml', false),
  ('lemon', '30ml juice', false),
  ('simple_syrup', '15ml', false),
  ('ice', 'full glass', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Whiskey Sour';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Combine whiskey, lemon juice, and simple syrup in a shaker with ice.'),
  (2, 'Shake well for 15 seconds.'),
  (3, 'Strain into a rocks glass with ice.'),
  (4, 'Garnish with a lemon wheel.')
) AS v(step_number, instruction)
WHERE d.name = 'Whiskey Sour';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Whiskey Sour' AND t.name IN ('classic');

-- 5. Pina Colada
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Piña Colada', 'A tropical creamy cocktail with rum, pineapple, and coconut.', true, 4, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('white_rum', '60ml', false),
  ('pineapple_juice', '90ml', false),
  ('coconut_cream', '30ml', false),
  ('ice', '1 cup', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Piña Colada';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Blend rum, pineapple juice, coconut cream, and ice until smooth.'),
  (2, 'Pour into a tall glass.'),
  (3, 'Garnish with a pineapple slice.')
) AS v(step_number, instruction)
WHERE d.name = 'Piña Colada';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Piña Colada' AND t.name IN ('tropical', 'creamy', 'party');

-- 6. Cuba Libre
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Cuba Libre', 'Rum and cola with a squeeze of lime. Simple and satisfying.', true, 1, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('white_rum', '60ml', false),
  ('cola', '150ml', false),
  ('lime', '1 wedge', false),
  ('ice', 'full glass', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Cuba Libre';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Fill a glass with ice.'),
  (2, 'Pour rum and squeeze lime into the glass.'),
  (3, 'Top with cola and stir gently.')
) AS v(step_number, instruction)
WHERE d.name = 'Cuba Libre';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Cuba Libre' AND t.name IN ('quick', 'budget', 'party');

-- 7. Vodka Cranberry
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Vodka Cranberry', 'A simple and fruity vodka cocktail.', true, 1, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('vodka', '60ml', false),
  ('cranberry_juice', '120ml', false),
  ('lime', '1 wedge', true),
  ('ice', 'full glass', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Vodka Cranberry';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Fill a glass with ice.'),
  (2, 'Pour vodka and cranberry juice.'),
  (3, 'Stir and garnish with lime.')
) AS v(step_number, instruction)
WHERE d.name = 'Vodka Cranberry';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Vodka Cranberry' AND t.name IN ('quick', 'budget');

-- 8. Moscow Mule
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Moscow Mule', 'A spicy, refreshing vodka cocktail with ginger beer and lime.', true, 2, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('vodka', '60ml', false),
  ('ginger_beer', '120ml', false),
  ('lime', '15ml juice', false),
  ('ice', 'full glass', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Moscow Mule';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Fill a copper mug or glass with ice.'),
  (2, 'Pour vodka and lime juice.'),
  (3, 'Top with ginger beer and stir gently.'),
  (4, 'Garnish with a lime wheel.')
) AS v(step_number, instruction)
WHERE d.name = 'Moscow Mule';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Moscow Mule' AND t.name IN ('classic', 'refreshing');

-- =============================================
-- NON-ALCOHOLIC DRINKS
-- =============================================

-- 9. Virgin Mojito
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Virgin Mojito', 'All the freshness of a mojito without the alcohol.', false, 3, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('lime', '1 whole', false),
  ('mint', '10 leaves', false),
  ('sugar', '2 tsp', false),
  ('soda_water', 'top up', false),
  ('ice', 'full glass', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Virgin Mojito';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Muddle mint and sugar in a glass.'),
  (2, 'Add lime juice and ice.'),
  (3, 'Top with soda water and stir.'),
  (4, 'Garnish with mint sprig and lime wheel.')
) AS v(step_number, instruction)
WHERE d.name = 'Virgin Mojito';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Virgin Mojito' AND t.name IN ('refreshing', 'budget');

-- 10. Mango Lassi
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Mango Lassi', 'A creamy Indian yogurt-based mango smoothie.', false, 2, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('mango', '1 cup pulp', false),
  ('milk', '1/2 cup', false),
  ('sugar', '2 tbsp', true),
  ('ice', '1/2 cup', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Mango Lassi';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Blend mango pulp, milk, sugar, and ice until smooth.'),
  (2, 'Pour into a glass and serve chilled.')
) AS v(step_number, instruction)
WHERE d.name = 'Mango Lassi';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Mango Lassi' AND t.name IN ('quick', 'creamy', 'budget');

-- 11. Lemonade
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Fresh Lemonade', 'Classic homemade lemonade. Sweet, tangy, and refreshing.', false, 2, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('lemon', '2 whole', false),
  ('sugar', '3 tbsp', false),
  ('ice', 'full glass', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Fresh Lemonade';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Squeeze lemons into a pitcher.'),
  (2, 'Add sugar and stir until dissolved.'),
  (3, 'Add cold water and ice.'),
  (4, 'Stir well and serve.')
) AS v(step_number, instruction)
WHERE d.name = 'Fresh Lemonade';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Fresh Lemonade' AND t.name IN ('quick', 'budget', 'refreshing');

-- 12. Shirley Temple
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Shirley Temple', 'A sweet and bubbly non-alcoholic classic with grenadine and sprite.', false, 1, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('sprite', '200ml', false),
  ('grenadine', '30ml', false),
  ('ice', 'full glass', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Shirley Temple';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Fill a glass with ice.'),
  (2, 'Pour Sprite over ice.'),
  (3, 'Add grenadine and stir gently.')
) AS v(step_number, instruction)
WHERE d.name = 'Shirley Temple';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Shirley Temple' AND t.name IN ('quick', 'budget', 'party');

-- 13. Iced Coffee
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Iced Coffee', 'A simple and energizing cold coffee drink.', false, 2, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('coffee', '200ml brewed', false),
  ('milk', '50ml', true),
  ('sugar', '2 tsp', true),
  ('ice', 'full glass', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Iced Coffee';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Brew coffee and let it cool.'),
  (2, 'Fill a glass with ice.'),
  (3, 'Pour cooled coffee over ice.'),
  (4, 'Add milk and sugar to taste.')
) AS v(step_number, instruction)
WHERE d.name = 'Iced Coffee';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Iced Coffee' AND t.name IN ('quick', 'budget');

-- 14. Watermelon Cooler
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Watermelon Cooler', 'A hydrating summer drink made with fresh watermelon.', false, 3, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('watermelon', '2 cups cubed', false),
  ('lime', '15ml juice', true),
  ('mint', '5 leaves', true),
  ('ice', '1 cup', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Watermelon Cooler';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Blend watermelon chunks until smooth.'),
  (2, 'Strain if desired for a smoother drink.'),
  (3, 'Pour over ice, add lime juice.'),
  (4, 'Garnish with mint leaves.')
) AS v(step_number, instruction)
WHERE d.name = 'Watermelon Cooler';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Watermelon Cooler' AND t.name IN ('refreshing', 'budget');

-- 15. Ginger Honey Tea
INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty)
VALUES ('Ginger Honey Tea', 'A warm, soothing drink perfect for cold days or sore throats.', false, 5, 'easy');

INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
SELECT d.id, i.id, v.quantity, v.is_optional
FROM drinks d, (VALUES
  ('ginger', '1 inch piece', false),
  ('honey', '2 tbsp', false),
  ('lemon', '1 wedge', true),
  ('tea', '1 cup hot water', false)
) AS v(ing, quantity, is_optional)
JOIN ingredients i ON i.normalized_name = v.ing
WHERE d.name = 'Ginger Honey Tea';

INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, v.step_number, v.instruction
FROM drinks d, (VALUES
  (1, 'Boil water and steep tea bag or leaves.'),
  (2, 'Grate or slice ginger and add to the cup.'),
  (3, 'Stir in honey until dissolved.'),
  (4, 'Squeeze lemon wedge and enjoy warm.')
) AS v(step_number, instruction)
WHERE d.name = 'Ginger Honey Tea';

INSERT INTO drink_tag_map (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d, drink_tags t WHERE d.name = 'Ginger Honey Tea' AND t.name IN ('warm', 'budget');
