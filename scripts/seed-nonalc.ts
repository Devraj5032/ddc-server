/**
 * Seed script — adds more non-alcoholic drinks: regional specialties,
 * health drinks, hot chocolates, frappes, sherbets, agua frescas, etc.
 * Run: npx ts-node scripts/seed-nonalc.ts
 */
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

function normalize(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

interface Ing { name: string; qty: string; type: string }
interface DrinkDef {
  name: string;
  desc: string;
  ing: Ing[];
  steps: string[];
  prep: number;
  diff: string;
  tags: string[];
}

const drinks: DrinkDef[] = [
  // ═══ INDIAN REGIONAL ═══
  { name: "Aam Panna", desc: "Tangy raw mango cooler — the ultimate Indian summer drink.", ing: [{ name: "Raw Mango", qty: "1 whole", type: "fruit" }, { name: "Sugar", qty: "4 tbsp", type: "sweetener" }, { name: "Cumin Powder", qty: "1/2 tsp", type: "herb" }, { name: "Mint Leaves", qty: "8 leaves", type: "herb" }, { name: "Salt", qty: "pinch", type: "other" }, { name: "Water", qty: "2 cups", type: "mixer" }], steps: ["Boil raw mango until soft, peel and extract pulp.", "Blend pulp with sugar, cumin, mint, and salt.", "Mix with cold water.", "Serve over ice."], prep: 7, diff: "medium", tags: ["refreshing", "budget"] },
  { name: "Nimbu Pani", desc: "Classic Indian lemon water with salt and sugar — simple perfection.", ing: [{ name: "Lemon", qty: "2 whole", type: "fruit" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Salt", qty: "1/4 tsp", type: "other" }, { name: "Water", qty: "2 cups", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Squeeze lemons into water.", "Add sugar and salt, stir until dissolved.", "Add ice and serve."], prep: 2, diff: "easy", tags: ["quick", "budget", "refreshing"] },
  { name: "Badam Milk", desc: "Indian almond milk drink flavored with saffron and cardamom.", ing: [{ name: "Almonds", qty: "15", type: "other" }, { name: "Milk", qty: "2 cups", type: "dairy" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Saffron", qty: "pinch", type: "herb" }, { name: "Cardamom", qty: "1/4 tsp powder", type: "herb" }], steps: ["Soak almonds for 2 hours and peel.", "Grind to a smooth paste.", "Boil milk, add almond paste, sugar, saffron, and cardamom.", "Serve warm or chilled."], prep: 7, diff: "medium", tags: ["creamy", "warm"] },
  { name: "Kokum Sherbet", desc: "A tangy Goan/Konkani cooler made from dried kokum berries.", ing: [{ name: "Kokum", qty: "8 dried", type: "fruit" }, { name: "Sugar", qty: "3 tbsp", type: "sweetener" }, { name: "Cumin Powder", qty: "1/4 tsp", type: "herb" }, { name: "Salt", qty: "pinch", type: "other" }, { name: "Water", qty: "2 cups", type: "mixer" }], steps: ["Soak kokum in 1 cup warm water for 30 min.", "Squeeze and strain juice.", "Add sugar, cumin, salt, and remaining water.", "Chill and serve."], prep: 5, diff: "easy", tags: ["refreshing", "budget"] },
  { name: "Buttermilk (Chaas)", desc: "Light, salted Indian buttermilk with cumin and cilantro.", ing: [{ name: "Yogurt", qty: "1/2 cup", type: "dairy" }, { name: "Water", qty: "1.5 cups", type: "mixer" }, { name: "Cumin Powder", qty: "1/2 tsp", type: "herb" }, { name: "Salt", qty: "1/4 tsp", type: "other" }, { name: "Cilantro", qty: "1 tbsp chopped", type: "herb" }, { name: "Ginger", qty: "1/4 tsp grated", type: "herb" }], steps: ["Whisk yogurt until smooth.", "Add water and whisk until frothy.", "Mix in cumin, salt, ginger.", "Garnish with cilantro and serve cold."], prep: 3, diff: "easy", tags: ["quick", "budget", "refreshing"] },
  { name: "Paneer Soda", desc: "A bright pink fizzy rose-flavored South Indian soda.", ing: [{ name: "Rose Syrup", qty: "30ml", type: "sweetener" }, { name: "Soda Water", qty: "200ml", type: "mixer" }, { name: "Lemon", qty: "1 tbsp juice", type: "fruit" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Pour rose syrup into a glass.", "Add ice and lemon juice.", "Top with soda water.", "Stir gently and serve."], prep: 1, diff: "easy", tags: ["quick", "party", "refreshing"] },
  { name: "Filter Coffee (South Indian)", desc: "Strong, decoction-style coffee with frothed milk.", ing: [{ name: "Coffee", qty: "2 tbsp filter coffee powder", type: "other" }, { name: "Milk", qty: "3/4 cup", type: "dairy" }, { name: "Sugar", qty: "2 tsp", type: "sweetener" }, { name: "Water", qty: "1/4 cup boiling", type: "mixer" }], steps: ["Brew coffee decoction using a filter or French press.", "Boil milk with sugar.", "Mix decoction with hot milk.", "Pour back and forth between two cups to froth."], prep: 5, diff: "medium", tags: ["warm", "classic"] },
  { name: "Solkadhi", desc: "A Maharashtrian pink coconut-kokum digestive drink.", ing: [{ name: "Kokum", qty: "6 dried", type: "fruit" }, { name: "Coconut Cream", qty: "1/2 cup", type: "mixer" }, { name: "Garlic", qty: "1 clove", type: "herb" }, { name: "Cilantro", qty: "2 tbsp", type: "herb" }, { name: "Salt", qty: "to taste", type: "other" }, { name: "Water", qty: "1 cup", type: "mixer" }], steps: ["Soak kokum in warm water for 15 min.", "Blend coconut cream, garlic, and cilantro.", "Mix kokum water with coconut mixture.", "Season with salt, chill, and serve."], prep: 5, diff: "easy", tags: ["refreshing", "budget"] },

  // ═══ MIDDLE EASTERN / MEDITERRANEAN ═══
  { name: "Ayran", desc: "Turkish salted yogurt drink — simple, tangy, and refreshing.", ing: [{ name: "Yogurt", qty: "1 cup", type: "dairy" }, { name: "Water", qty: "1 cup cold", type: "mixer" }, { name: "Salt", qty: "1/4 tsp", type: "other" }, { name: "Mint Leaves", qty: "garnish", type: "herb" }], steps: ["Whisk yogurt until smooth.", "Add cold water and salt.", "Blend or whisk until frothy.", "Serve chilled with mint."], prep: 2, diff: "easy", tags: ["quick", "budget", "refreshing"] },
  { name: "Doogh", desc: "Persian sparkling yogurt drink with dried mint.", ing: [{ name: "Yogurt", qty: "1 cup", type: "dairy" }, { name: "Soda Water", qty: "1 cup", type: "mixer" }, { name: "Dried Mint", qty: "1 tsp", type: "herb" }, { name: "Salt", qty: "1/4 tsp", type: "other" }], steps: ["Mix yogurt until smooth.", "Add soda water and stir gently.", "Season with salt and dried mint.", "Serve cold."], prep: 2, diff: "easy", tags: ["quick", "budget", "refreshing"] },
  { name: "Tamarind Juice", desc: "Sweet and sour tamarind drink popular across the Middle East and Asia.", ing: [{ name: "Tamarind", qty: "2 tbsp paste", type: "fruit" }, { name: "Sugar", qty: "3 tbsp", type: "sweetener" }, { name: "Water", qty: "2 cups", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Dissolve tamarind paste in warm water.", "Strain out any seeds or fiber.", "Add sugar and stir until dissolved.", "Chill and serve over ice."], prep: 4, diff: "easy", tags: ["refreshing", "budget"] },
  { name: "Sahlab", desc: "A warm, creamy Middle Eastern milk drink with orchid powder and cinnamon.", ing: [{ name: "Milk", qty: "2 cups", type: "dairy" }, { name: "Cornstarch", qty: "1 tbsp", type: "other" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Rose Syrup", qty: "1 tsp", type: "sweetener" }, { name: "Cinnamon", qty: "1/4 tsp", type: "herb" }, { name: "Pistachios", qty: "1 tbsp crushed", type: "other" }], steps: ["Mix cornstarch with a little cold milk.", "Heat remaining milk with sugar.", "Add cornstarch mixture and stir until thickened.", "Pour, add rose water, top with cinnamon and pistachios."], prep: 5, diff: "easy", tags: ["warm", "creamy"] },

  // ═══ EAST ASIAN ═══
  { name: "Korean Banana Milk", desc: "Sweet Korean banana-flavored milk — a convenience store favorite.", ing: [{ name: "Banana", qty: "1 ripe", type: "fruit" }, { name: "Milk", qty: "1.5 cups", type: "dairy" }, { name: "Sugar", qty: "1 tbsp", type: "sweetener" }, { name: "Vanilla Extract", qty: "1/4 tsp", type: "other" }], steps: ["Blend banana, milk, sugar, and vanilla.", "Blend until completely smooth.", "Chill for 30 minutes.", "Serve cold."], prep: 2, diff: "easy", tags: ["quick", "creamy"] },
  { name: "Taro Milk Tea", desc: "A purple-hued creamy milk tea with sweet taro flavor.", ing: [{ name: "Taro Powder", qty: "2 tbsp", type: "other" }, { name: "Tea", qty: "1 bag black tea", type: "other" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Tapioca Pearls", qty: "1/4 cup", type: "other" }, { name: "Ice", qty: "1 cup", type: "other" }], steps: ["Cook tapioca pearls per package instructions.", "Brew tea, dissolve taro powder and sugar in it.", "Let cool, add milk.", "Add boba to glass, pour tea, add ice."], prep: 7, diff: "medium", tags: ["creamy", "party"] },
  { name: "Yuzu Soda", desc: "A light Japanese citrus soda — fragrant and refreshing.", ing: [{ name: "Yuzu Juice", qty: "2 tbsp", type: "fruit" }, { name: "Simple Syrup", qty: "1 tbsp", type: "sweetener" }, { name: "Soda Water", qty: "200ml", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Add yuzu juice and syrup to a glass.", "Fill with ice.", "Top with soda water.", "Stir once and garnish with citrus peel."], prep: 1, diff: "easy", tags: ["quick", "refreshing"] },
  { name: "Vietnamese Iced Coffee", desc: "Strong dark roast coffee with sweetened condensed milk over ice.", ing: [{ name: "Coffee", qty: "2 tbsp dark roast ground", type: "other" }, { name: "Condensed Milk", qty: "2 tbsp", type: "dairy" }, { name: "Hot Water", qty: "1/4 cup", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Add condensed milk to a glass.", "Brew coffee with hot water using a phin filter or pour-over.", "Let coffee drip directly onto the condensed milk.", "Stir, add ice, and serve."], prep: 5, diff: "easy", tags: ["creamy", "classic"] },
  { name: "Calamansi Juice", desc: "Filipino citrus juice — like lemonade but more tropical.", ing: [{ name: "Calamansi", qty: "8 fruits (or 3 tbsp juice)", type: "fruit" }, { name: "Sugar", qty: "3 tbsp", type: "sweetener" }, { name: "Water", qty: "2 cups", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Squeeze calamansi juice.", "Mix with water and sugar.", "Stir until sugar dissolves.", "Serve over ice."], prep: 3, diff: "easy", tags: ["quick", "refreshing", "budget"] },

  // ═══ LATIN AMERICAN ═══
  { name: "Horchata", desc: "A creamy Mexican rice drink with cinnamon and vanilla.", ing: [{ name: "Rice", qty: "1 cup", type: "other" }, { name: "Cinnamon", qty: "1 stick", type: "herb" }, { name: "Vanilla Extract", qty: "1 tsp", type: "other" }, { name: "Sugar", qty: "1/2 cup", type: "sweetener" }, { name: "Water", qty: "4 cups", type: "mixer" }, { name: "Milk", qty: "1 cup", type: "dairy" }], steps: ["Soak rice and cinnamon in 2 cups water overnight.", "Blend soaked rice with remaining water.", "Strain through cheesecloth.", "Add sugar, vanilla, milk, and chill."], prep: 5, diff: "medium", tags: ["creamy", "classic"] },
  { name: "Jamaica (Hibiscus Tea)", desc: "A tart, deep-red Mexican hibiscus iced tea.", ing: [{ name: "Dried Hibiscus Flowers", qty: "1 cup", type: "herb" }, { name: "Sugar", qty: "1/2 cup", type: "sweetener" }, { name: "Water", qty: "6 cups", type: "mixer" }, { name: "Lime", qty: "1 tbsp juice", type: "fruit" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Boil water and add hibiscus flowers.", "Steep for 15 minutes, then strain.", "Add sugar and lime juice, stir.", "Chill and serve over ice."], prep: 5, diff: "easy", tags: ["refreshing", "budget", "party"] },
  { name: "Mango Agua Fresca", desc: "Light and sweet Mexican mango water.", ing: [{ name: "Mango", qty: "2 cups cubed", type: "fruit" }, { name: "Water", qty: "3 cups", type: "mixer" }, { name: "Lime", qty: "1 tbsp juice", type: "fruit" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Blend mango with 1 cup water.", "Strain into pitcher.", "Add remaining water, lime, and sugar.", "Serve over ice."], prep: 4, diff: "easy", tags: ["refreshing", "tropical", "budget"] },
  { name: "Champurrado", desc: "A thick Mexican chocolate-corn drink served warm.", ing: [{ name: "Masa Harina", qty: "1/4 cup", type: "other" }, { name: "Milk", qty: "2 cups", type: "dairy" }, { name: "Cocoa Powder", qty: "2 tbsp", type: "other" }, { name: "Sugar", qty: "3 tbsp", type: "sweetener" }, { name: "Cinnamon", qty: "1 stick", type: "herb" }, { name: "Vanilla Extract", qty: "1 tsp", type: "other" }], steps: ["Dissolve masa harina in 1/2 cup water.", "Heat milk with cinnamon stick.", "Add masa mixture, cocoa, and sugar.", "Stir constantly until thick, add vanilla, serve warm."], prep: 7, diff: "medium", tags: ["warm", "creamy"] },
  { name: "Limonada de Coco", desc: "Colombian coconut limeade — tropical and creamy.", ing: [{ name: "Coconut Cream", qty: "1/2 cup", type: "mixer" }, { name: "Lime", qty: "3 whole", type: "fruit" }, { name: "Sugar", qty: "3 tbsp", type: "sweetener" }, { name: "Water", qty: "2 cups", type: "mixer" }, { name: "Ice", qty: "1 cup", type: "other" }], steps: ["Blend coconut cream, lime juice, sugar, water, and ice.", "Blend until smooth.", "Strain if desired.", "Serve immediately."], prep: 3, diff: "easy", tags: ["tropical", "creamy", "refreshing"] },

  // ═══ AFRICAN ═══
  { name: "Bissap (Hibiscus Drink)", desc: "West African hibiscus juice with ginger and mint.", ing: [{ name: "Dried Hibiscus Flowers", qty: "1 cup", type: "herb" }, { name: "Ginger", qty: "1 inch", type: "herb" }, { name: "Mint Leaves", qty: "10 leaves", type: "herb" }, { name: "Sugar", qty: "1/2 cup", type: "sweetener" }, { name: "Water", qty: "6 cups", type: "mixer" }], steps: ["Boil water with hibiscus and sliced ginger for 15 min.", "Strain and add sugar while hot.", "Add mint leaves and let cool.", "Chill and serve cold."], prep: 5, diff: "easy", tags: ["refreshing", "party"] },
  { name: "Sobolo", desc: "Ghanaian spiced hibiscus drink with cloves and ginger.", ing: [{ name: "Dried Hibiscus Flowers", qty: "1 cup", type: "herb" }, { name: "Ginger", qty: "2 inches", type: "herb" }, { name: "Cloves", qty: "5", type: "herb" }, { name: "Sugar", qty: "1/2 cup", type: "sweetener" }, { name: "Pineapple", qty: "1/2 cup chunks", type: "fruit" }, { name: "Water", qty: "6 cups", type: "mixer" }], steps: ["Boil hibiscus, ginger, and cloves in water for 20 min.", "Strain and add sugar.", "Blend pineapple and add juice.", "Chill overnight for best flavor."], prep: 7, diff: "medium", tags: ["refreshing", "party"] },
  { name: "Tangawizi", desc: "East African spicy ginger drink — fiery and refreshing.", ing: [{ name: "Ginger", qty: "3 inches", type: "herb" }, { name: "Lemon", qty: "2 whole", type: "fruit" }, { name: "Sugar", qty: "1/4 cup", type: "sweetener" }, { name: "Water", qty: "4 cups", type: "mixer" }, { name: "Cayenne Pepper", qty: "pinch", type: "herb" }], steps: ["Grate ginger and boil in water for 10 min.", "Strain and add sugar and lemon juice.", "Add a pinch of cayenne.", "Serve chilled or warm."], prep: 5, diff: "easy", tags: ["refreshing"] },

  // ═══ HOT CHOCOLATES & WARM DRINKS ═══
  { name: "Classic Hot Chocolate", desc: "Rich and creamy hot cocoa made from scratch.", ing: [{ name: "Milk", qty: "2 cups", type: "dairy" }, { name: "Cocoa Powder", qty: "2 tbsp", type: "other" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Vanilla Extract", qty: "1/2 tsp", type: "other" }, { name: "Whipped Cream", qty: "topping", type: "dairy" }], steps: ["Whisk cocoa and sugar in a saucepan.", "Add milk and heat over medium, whisking constantly.", "Add vanilla when hot but not boiling.", "Pour and top with whipped cream."], prep: 5, diff: "easy", tags: ["warm", "creamy"] },
  { name: "White Hot Chocolate", desc: "A sweet, creamy white chocolate drink.", ing: [{ name: "White Chocolate", qty: "60g chopped", type: "other" }, { name: "Milk", qty: "2 cups", type: "dairy" }, { name: "Vanilla Extract", qty: "1/2 tsp", type: "other" }, { name: "Whipped Cream", qty: "topping", type: "dairy" }], steps: ["Heat milk in a saucepan until simmering.", "Add white chocolate and stir until melted.", "Add vanilla extract.", "Pour and top with whipped cream."], prep: 5, diff: "easy", tags: ["warm", "creamy"] },
  { name: "Spiced Apple Cider (Hot)", desc: "Warm apple cider with cinnamon, cloves, and orange.", ing: [{ name: "Apple Juice", qty: "4 cups", type: "juice" }, { name: "Cinnamon", qty: "2 sticks", type: "herb" }, { name: "Cloves", qty: "4", type: "herb" }, { name: "Orange", qty: "2 slices", type: "fruit" }, { name: "Honey", qty: "2 tbsp", type: "sweetener" }], steps: ["Combine apple juice, cinnamon, cloves, and orange in a pot.", "Simmer on low for 15 minutes.", "Strain out spices.", "Stir in honey and serve warm."], prep: 7, diff: "easy", tags: ["warm", "classic"] },
  { name: "Golden Milk (Turmeric Latte)", desc: "An anti-inflammatory warm drink with turmeric and spices.", ing: [{ name: "Milk", qty: "1.5 cups", type: "dairy" }, { name: "Turmeric", qty: "1 tsp powder", type: "herb" }, { name: "Ginger", qty: "1/4 tsp powder", type: "herb" }, { name: "Cinnamon", qty: "1/4 tsp", type: "herb" }, { name: "Honey", qty: "1 tbsp", type: "sweetener" }, { name: "Black Pepper", qty: "pinch", type: "other" }], steps: ["Heat milk in a saucepan.", "Whisk in turmeric, ginger, cinnamon, and pepper.", "Simmer for 3-4 minutes.", "Remove from heat, add honey, serve."], prep: 5, diff: "easy", tags: ["warm", "creamy"] },
  { name: "Pumpkin Spice Latte", desc: "The fall classic — espresso with pumpkin puree and warm spices.", ing: [{ name: "Coffee", qty: "2 shots espresso", type: "other" }, { name: "Pumpkin Puree", qty: "2 tbsp", type: "other" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Sugar", qty: "1 tbsp", type: "sweetener" }, { name: "Cinnamon", qty: "1/4 tsp", type: "herb" }, { name: "Nutmeg", qty: "pinch", type: "herb" }], steps: ["Heat milk with pumpkin puree, sugar, and spices.", "Froth until warm and foamy.", "Brew espresso.", "Pour spiced milk over espresso."], prep: 5, diff: "medium", tags: ["warm", "creamy"] },

  // ═══ HEALTH / WELLNESS ═══
  { name: "Turmeric Ginger Shot", desc: "A potent immunity-boosting shot — small but powerful.", ing: [{ name: "Turmeric", qty: "1 inch fresh", type: "herb" }, { name: "Ginger", qty: "1 inch fresh", type: "herb" }, { name: "Lemon", qty: "1/2 whole", type: "fruit" }, { name: "Honey", qty: "1 tsp", type: "sweetener" }, { name: "Black Pepper", qty: "pinch", type: "other" }], steps: ["Juice or grate turmeric and ginger.", "Add lemon juice, honey, and pepper.", "Mix well.", "Take as a shot — no sipping needed."], prep: 2, diff: "easy", tags: ["quick", "budget"] },
  { name: "Beetroot Juice", desc: "Earthy and sweet beetroot juice with apple and ginger.", ing: [{ name: "Beetroot", qty: "1 medium", type: "other" }, { name: "Apple", qty: "1 whole", type: "fruit" }, { name: "Ginger", qty: "1/2 inch", type: "herb" }, { name: "Lemon", qty: "1/2 whole", type: "fruit" }], steps: ["Wash and chop beetroot and apple.", "Run through juicer with ginger.", "Add lemon juice.", "Stir and serve fresh."], prep: 4, diff: "easy", tags: ["refreshing", "budget"] },
  { name: "Aloe Vera Juice", desc: "Hydrating aloe vera drink with lime and honey.", ing: [{ name: "Aloe Vera Gel", qty: "2 tbsp", type: "other" }, { name: "Lime", qty: "1 tbsp juice", type: "fruit" }, { name: "Honey", qty: "1 tbsp", type: "sweetener" }, { name: "Water", qty: "1 cup", type: "mixer" }, { name: "Ice", qty: "1/2 cup", type: "other" }], steps: ["Blend aloe vera gel with water until smooth.", "Add lime juice and honey.", "Stir well.", "Serve over ice."], prep: 3, diff: "easy", tags: ["refreshing", "budget"] },
  { name: "ABC Juice", desc: "Apple, Beetroot, Carrot — the classic detox juice combo.", ing: [{ name: "Apple", qty: "1 whole", type: "fruit" }, { name: "Beetroot", qty: "1 small", type: "other" }, { name: "Carrot", qty: "2 large", type: "other" }, { name: "Ginger", qty: "1/4 inch", type: "herb" }], steps: ["Wash and chop all produce.", "Run through juicer.", "Stir and serve immediately.", "Drink fresh for maximum nutrients."], prep: 4, diff: "easy", tags: ["quick", "budget", "refreshing"] },
  { name: "Wheatgrass Shot", desc: "Intense green shot packed with chlorophyll and vitamins.", ing: [{ name: "Wheatgrass", qty: "1 handful", type: "herb" }, { name: "Lemon", qty: "1 wedge", type: "fruit" }, { name: "Ginger", qty: "small piece", type: "herb" }], steps: ["Run wheatgrass through a juicer.", "Add a squeeze of lemon and ginger juice.", "Mix and drink immediately."], prep: 2, diff: "easy", tags: ["quick", "budget"] },

  // ═══ FRAPPES & FROZEN ═══
  { name: "Mango Frappe", desc: "A thick frozen mango drink — like a mango slushie.", ing: [{ name: "Mango", qty: "1 cup frozen", type: "fruit" }, { name: "Milk", qty: "1/2 cup", type: "dairy" }, { name: "Sugar", qty: "1 tbsp", type: "sweetener" }, { name: "Ice", qty: "1 cup", type: "other" }], steps: ["Add frozen mango, milk, sugar, and ice to blender.", "Blend until thick and slushy.", "Pour into a glass.", "Serve with a wide straw."], prep: 2, diff: "easy", tags: ["quick", "tropical", "creamy"] },
  { name: "Strawberry Lemonade Slush", desc: "Frozen strawberry lemonade — perfect for hot days.", ing: [{ name: "Strawberry", qty: "1 cup frozen", type: "fruit" }, { name: "Lemon", qty: "3 tbsp juice", type: "fruit" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Water", qty: "1/2 cup", type: "mixer" }, { name: "Ice", qty: "1 cup", type: "other" }], steps: ["Blend all ingredients until slushy.", "Pour into a tall glass.", "Garnish with a strawberry."], prep: 2, diff: "easy", tags: ["quick", "refreshing"] },
  { name: "Cookies and Cream Frappe", desc: "Blended iced coffee with cookie chunks and cream.", ing: [{ name: "Coffee", qty: "1 cup brewed, cooled", type: "other" }, { name: "Oreo Cookies", qty: "4", type: "other" }, { name: "Milk", qty: "1/2 cup", type: "dairy" }, { name: "Ice", qty: "1 cup", type: "other" }, { name: "Whipped Cream", qty: "topping", type: "dairy" }], steps: ["Blend coffee, milk, cookies, and ice.", "Blend until thick with cookie chunks.", "Pour and top with whipped cream.", "Crumble extra cookie on top."], prep: 3, diff: "easy", tags: ["creamy"] },
  { name: "Frozen Hot Chocolate", desc: "All the flavor of hot chocolate, but frozen and blended.", ing: [{ name: "Cocoa Powder", qty: "3 tbsp", type: "other" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Ice", qty: "2 cups", type: "other" }, { name: "Whipped Cream", qty: "topping", type: "dairy" }], steps: ["Blend cocoa, sugar, milk, and ice.", "Blend until smooth and frosty.", "Pour into a large glass.", "Top with whipped cream."], prep: 3, diff: "easy", tags: ["creamy"] },

  // ═══ MORE GLOBAL ═══
  { name: "Kefir Smoothie", desc: "Probiotic kefir blended with berries for gut health.", ing: [{ name: "Kefir", qty: "1 cup", type: "dairy" }, { name: "Mixed Berries", qty: "1 cup", type: "fruit" }, { name: "Honey", qty: "1 tbsp", type: "sweetener" }, { name: "Banana", qty: "1/2", type: "fruit" }], steps: ["Add kefir, berries, banana, and honey to blender.", "Blend until smooth.", "Pour and serve immediately."], prep: 2, diff: "easy", tags: ["quick", "creamy", "refreshing"] },
  { name: "Switchel", desc: "An old-fashioned American ginger-vinegar drink — the original energy drink.", ing: [{ name: "Apple Cider Vinegar", qty: "2 tbsp", type: "other" }, { name: "Ginger", qty: "1 tbsp grated", type: "herb" }, { name: "Honey", qty: "2 tbsp", type: "sweetener" }, { name: "Water", qty: "2 cups", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Mix vinegar, grated ginger, and honey in water.", "Stir until honey dissolves.", "Chill for at least 1 hour.", "Serve over ice."], prep: 3, diff: "easy", tags: ["refreshing", "budget"] },
  { name: "Rooibos Vanilla Latte", desc: "Caffeine-free South African red bush tea latte.", ing: [{ name: "Rooibos Tea", qty: "1 bag", type: "other" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Vanilla Extract", qty: "1/2 tsp", type: "other" }, { name: "Honey", qty: "1 tbsp", type: "sweetener" }], steps: ["Steep rooibos tea in 1/4 cup hot water for 5 min.", "Heat and froth milk.", "Add vanilla and honey to tea.", "Top with frothed milk."], prep: 5, diff: "easy", tags: ["warm", "creamy"] },
  { name: "Bandung", desc: "A Singaporean/Malaysian rose milk drink — sweet and pink.", ing: [{ name: "Rose Syrup", qty: "2 tbsp", type: "sweetener" }, { name: "Condensed Milk", qty: "2 tbsp", type: "dairy" }, { name: "Water", qty: "1 cup", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Mix rose syrup with cold water.", "Add condensed milk and stir.", "Pour over ice.", "Stir gently and serve."], prep: 2, diff: "easy", tags: ["quick", "creamy"] },
  { name: "Tepache", desc: "A lightly fermented Mexican pineapple drink — tangy and fizzy.", ing: [{ name: "Pineapple", qty: "peel of 1 whole", type: "fruit" }, { name: "Sugar", qty: "1 cup", type: "sweetener" }, { name: "Cinnamon", qty: "1 stick", type: "herb" }, { name: "Cloves", qty: "3", type: "herb" }, { name: "Water", qty: "8 cups", type: "mixer" }], steps: ["Combine pineapple peel, sugar, cinnamon, and cloves in a jar.", "Cover with water and stir.", "Cover with cloth and let ferment 2-3 days at room temp.", "Strain and serve chilled."], prep: 5, diff: "medium", tags: ["refreshing", "budget"] },
  { name: "Kombucha (Basic)", desc: "A tangy probiotic fermented tea — the wellness favorite.", ing: [{ name: "Tea", qty: "4 bags black tea", type: "other" }, { name: "Sugar", qty: "1 cup", type: "sweetener" }, { name: "SCOBY", qty: "1", type: "other" }, { name: "Water", qty: "8 cups", type: "mixer" }], steps: ["Brew tea, dissolve sugar, let cool to room temp.", "Add SCOBY and starter liquid to a jar.", "Cover with cloth and ferment 7-14 days.", "Bottle and refrigerate."], prep: 5, diff: "hard", tags: ["refreshing"] },
];

async function main() {
  console.log(`Seeding ${drinks.length} non-alcoholic drinks...`);

  const existingDrinks = await sql`SELECT name FROM drinks`;
  const existingNames = new Set(existingDrinks.map((d: any) => d.name.toLowerCase()));

  const existingIngredients = await sql`SELECT id, normalized_name FROM ingredients`;
  const ingredientMap = new Map<string, number>();
  for (const i of existingIngredients) ingredientMap.set(i.normalized_name, i.id);

  const existingTags = await sql`SELECT id, name FROM drink_tags`;
  const tagMap = new Map<string, number>();
  for (const t of existingTags) tagMap.set(t.name, t.id);

  let inserted = 0, skipped = 0, errors = 0;

  for (const d of drinks) {
    if (existingNames.has(d.name.toLowerCase())) { skipped++; continue; }
    try {
      const pop = Math.floor(45 + Math.random() * 45);
      const [drink] = await sql`
        INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty, ingredient_count, popularity_score)
        VALUES (${d.name}, ${d.desc}, ${false}, ${d.prep}, ${d.diff}, ${d.ing.length}, ${pop})
        RETURNING id
      `;

      for (const ing of d.ing) {
        const norm = normalize(ing.name);
        let ingId: number = ingredientMap.get(norm) ?? 0;
        if (ingId === 0) {
          const [c] = await sql`INSERT INTO ingredients (name, normalized_name, type, is_alcoholic) VALUES (${ing.name}, ${norm}, ${ing.type}, ${false}) ON CONFLICT (normalized_name) DO UPDATE SET name = ${ing.name} RETURNING id`;
          ingId = c.id;
          ingredientMap.set(norm, ingId);
        }
        await sql`INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional) VALUES (${drink.id}, ${ingId}, ${ing.qty}, ${false})`;
      }

      for (let i = 0; i < d.steps.length; i++) {
        await sql`INSERT INTO drink_steps (drink_id, step_number, instruction) VALUES (${drink.id}, ${i + 1}, ${d.steps[i]})`;
      }

      for (const tag of d.tags) {
        const tagId = tagMap.get(tag);
        if (tagId) await sql`INSERT INTO drink_tag_map (drink_id, tag_id) VALUES (${drink.id}, ${tagId}) ON CONFLICT DO NOTHING`;
      }

      inserted++;
    } catch (err: any) {
      errors++;
      if (errors < 5) console.error(`Error: ${d.name}:`, err.message);
    }
  }

  const [{ count: total }] = await sql`SELECT COUNT(*) as count FROM drinks`;
  const [{ count: nonAlc }] = await sql`SELECT COUNT(*) as count FROM drinks WHERE is_alcoholic = false`;
  const [{ count: totalIng }] = await sql`SELECT COUNT(*) as count FROM ingredients`;

  console.log("\n══════════════════════════════════════");
  console.log(`  Inserted: ${inserted} new drinks`);
  console.log(`  Skipped:  ${skipped} (already exist)`);
  console.log(`  Errors:   ${errors}`);
  console.log("──────────────────────────────────────");
  console.log(`  Total drinks:          ${total}`);
  console.log(`  Non-alcoholic drinks:  ${nonAlc}`);
  console.log(`  Total ingredients:     ${totalIng}`);
  console.log("══════════════════════════════════════\n");

  await sql.end();
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
