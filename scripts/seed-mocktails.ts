/**
 * Seed script — adds hundreds of non-alcoholic drinks: mocktails, smoothies,
 * milkshakes, teas, coffees, juices, lemonades, lassis, coolers, sodas.
 * Run: npx ts-node scripts/seed-mocktails.ts
 */
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

function normalize(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

interface DrinkDef {
  name: string;
  description: string;
  ingredients: { name: string; qty: string; type: string }[];
  steps: string[];
  prepTime: number;
  difficulty: string;
  tags: string[];
  imageSearch: string; // for Unsplash-style URL
}

// ─── Drink Definitions ───────────────────────────────────────────────

const drinks: DrinkDef[] = [
  // ═══ SMOOTHIES ═══
  { name: "Strawberry Banana Smoothie", description: "A classic creamy smoothie with fresh strawberries and ripe banana.", ingredients: [{ name: "Strawberry", qty: "1 cup", type: "fruit" }, { name: "Banana", qty: "1 whole", type: "fruit" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Honey", qty: "1 tbsp", type: "sweetener" }, { name: "Ice", qty: "1/2 cup", type: "other" }], steps: ["Add all ingredients to a blender.", "Blend until smooth and creamy.", "Pour into a glass and serve immediately."], prepTime: 3, difficulty: "easy", tags: ["quick", "creamy"], imageSearch: "strawberry-banana-smoothie" },
  { name: "Green Detox Smoothie", description: "A nutrient-packed green smoothie with spinach, apple, and ginger.", ingredients: [{ name: "Spinach", qty: "2 cups", type: "herb" }, { name: "Apple", qty: "1 whole", type: "fruit" }, { name: "Banana", qty: "1/2", type: "fruit" }, { name: "Ginger", qty: "1 inch", type: "herb" }, { name: "Lemon", qty: "1 tbsp juice", type: "fruit" }, { name: "Water", qty: "1 cup", type: "mixer" }], steps: ["Chop apple and peel ginger.", "Add all ingredients to blender.", "Blend until smooth.", "Strain if desired and serve."], prepTime: 4, difficulty: "easy", tags: ["refreshing", "budget"], imageSearch: "green-smoothie" },
  { name: "Blueberry Blast Smoothie", description: "Antioxidant-rich blueberry smoothie with yogurt.", ingredients: [{ name: "Blueberry", qty: "1 cup", type: "fruit" }, { name: "Yogurt", qty: "1/2 cup", type: "dairy" }, { name: "Honey", qty: "1 tbsp", type: "sweetener" }, { name: "Milk", qty: "1/2 cup", type: "dairy" }, { name: "Ice", qty: "1/2 cup", type: "other" }], steps: ["Combine all ingredients in a blender.", "Blend until smooth.", "Pour and enjoy."], prepTime: 2, difficulty: "easy", tags: ["quick", "creamy"], imageSearch: "blueberry-smoothie" },
  { name: "Tropical Paradise Smoothie", description: "A tropical blend of mango, pineapple, and coconut.", ingredients: [{ name: "Mango", qty: "1 cup", type: "fruit" }, { name: "Pineapple Juice", qty: "1/2 cup", type: "juice" }, { name: "Coconut Cream", qty: "2 tbsp", type: "mixer" }, { name: "Banana", qty: "1/2", type: "fruit" }, { name: "Ice", qty: "1 cup", type: "other" }], steps: ["Add all ingredients to blender.", "Blend on high for 30 seconds.", "Pour into a tall glass.", "Garnish with pineapple slice."], prepTime: 3, difficulty: "easy", tags: ["tropical", "creamy"], imageSearch: "tropical-smoothie" },
  { name: "Avocado Smoothie", description: "A rich and creamy avocado smoothie with a hint of vanilla.", ingredients: [{ name: "Avocado", qty: "1/2", type: "fruit" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Honey", qty: "2 tbsp", type: "sweetener" }, { name: "Vanilla Extract", qty: "1/2 tsp", type: "other" }, { name: "Ice", qty: "1/2 cup", type: "other" }], steps: ["Scoop out avocado flesh.", "Blend with milk, honey, vanilla, and ice.", "Blend until velvety smooth.", "Serve chilled."], prepTime: 3, difficulty: "easy", tags: ["creamy"], imageSearch: "avocado-smoothie" },
  { name: "PB&J Smoothie", description: "Peanut butter and jelly flavors in a thick smoothie.", ingredients: [{ name: "Peanut Butter", qty: "2 tbsp", type: "other" }, { name: "Strawberry", qty: "1 cup", type: "fruit" }, { name: "Banana", qty: "1 whole", type: "fruit" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Honey", qty: "1 tbsp", type: "sweetener" }], steps: ["Add all ingredients to blender.", "Blend until thick and creamy.", "Pour and serve."], prepTime: 3, difficulty: "easy", tags: ["creamy", "budget"], imageSearch: "peanut-butter-smoothie" },
  { name: "Peach Mango Smoothie", description: "Sweet peach and mango blended to perfection.", ingredients: [{ name: "Peach", qty: "1 cup", type: "fruit" }, { name: "Mango", qty: "1/2 cup", type: "fruit" }, { name: "Orange Juice", qty: "1/2 cup", type: "juice" }, { name: "Yogurt", qty: "1/4 cup", type: "dairy" }, { name: "Ice", qty: "1/2 cup", type: "other" }], steps: ["Combine all ingredients in blender.", "Blend until smooth.", "Serve in a chilled glass."], prepTime: 3, difficulty: "easy", tags: ["tropical", "refreshing"], imageSearch: "peach-mango-smoothie" },
  { name: "Chocolate Banana Smoothie", description: "A rich chocolate smoothie that tastes like a milkshake.", ingredients: [{ name: "Banana", qty: "1 whole", type: "fruit" }, { name: "Cocoa Powder", qty: "2 tbsp", type: "other" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Honey", qty: "1 tbsp", type: "sweetener" }, { name: "Ice", qty: "1/2 cup", type: "other" }], steps: ["Add banana, cocoa, milk, honey, and ice to blender.", "Blend until smooth and frothy.", "Pour and enjoy."], prepTime: 3, difficulty: "easy", tags: ["creamy", "quick"], imageSearch: "chocolate-banana-smoothie" },

  // ═══ MILKSHAKES ═══
  { name: "Classic Vanilla Milkshake", description: "A thick and creamy vanilla milkshake.", ingredients: [{ name: "Vanilla Ice Cream", qty: "3 scoops", type: "dairy" }, { name: "Milk", qty: "1/2 cup", type: "dairy" }, { name: "Vanilla Extract", qty: "1 tsp", type: "other" }, { name: "Whipped Cream", qty: "topping", type: "dairy" }], steps: ["Blend ice cream, milk, and vanilla until thick.", "Pour into a tall glass.", "Top with whipped cream."], prepTime: 2, difficulty: "easy", tags: ["quick", "creamy"], imageSearch: "vanilla-milkshake" },
  { name: "Chocolate Milkshake", description: "Rich, indulgent chocolate milkshake.", ingredients: [{ name: "Chocolate Ice Cream", qty: "3 scoops", type: "dairy" }, { name: "Milk", qty: "1/2 cup", type: "dairy" }, { name: "Chocolate Syrup", qty: "2 tbsp", type: "sweetener" }, { name: "Whipped Cream", qty: "topping", type: "dairy" }], steps: ["Blend ice cream, milk, and chocolate syrup.", "Pour into glass.", "Drizzle extra syrup and add whipped cream."], prepTime: 2, difficulty: "easy", tags: ["quick", "creamy"], imageSearch: "chocolate-milkshake" },
  { name: "Strawberry Milkshake", description: "Fresh strawberry milkshake, sweet and pink.", ingredients: [{ name: "Strawberry", qty: "1 cup", type: "fruit" }, { name: "Vanilla Ice Cream", qty: "2 scoops", type: "dairy" }, { name: "Milk", qty: "1/2 cup", type: "dairy" }, { name: "Sugar", qty: "1 tbsp", type: "sweetener" }], steps: ["Blend strawberries, ice cream, milk, and sugar.", "Blend until thick and smooth.", "Pour and garnish with a strawberry."], prepTime: 3, difficulty: "easy", tags: ["quick", "creamy"], imageSearch: "strawberry-milkshake" },
  { name: "Oreo Milkshake", description: "Cookies and cream milkshake with crushed Oreos.", ingredients: [{ name: "Oreo Cookies", qty: "6 cookies", type: "other" }, { name: "Vanilla Ice Cream", qty: "3 scoops", type: "dairy" }, { name: "Milk", qty: "1/2 cup", type: "dairy" }, { name: "Whipped Cream", qty: "topping", type: "dairy" }], steps: ["Crush 4 Oreos and add to blender with ice cream and milk.", "Blend until chunky-smooth.", "Pour, top with whipped cream and remaining crushed Oreos."], prepTime: 3, difficulty: "easy", tags: ["creamy", "party"], imageSearch: "oreo-milkshake" },

  // ═══ COFFEES ═══
  { name: "Cold Brew Coffee", description: "Smooth, low-acid cold brew coffee steeped overnight.", ingredients: [{ name: "Coffee", qty: "1 cup coarse ground", type: "other" }, { name: "Water", qty: "4 cups cold", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Combine coarse coffee grounds with cold water.", "Stir and refrigerate for 12-24 hours.", "Strain through a fine mesh filter.", "Serve over ice, dilute to taste."], prepTime: 5, difficulty: "easy", tags: ["refreshing"], imageSearch: "cold-brew-coffee" },
  { name: "Vanilla Latte", description: "A smooth espresso drink with steamed milk and vanilla.", ingredients: [{ name: "Coffee", qty: "2 shots espresso", type: "other" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Vanilla Extract", qty: "1 tsp", type: "other" }, { name: "Sugar", qty: "1 tbsp", type: "sweetener" }], steps: ["Brew espresso shots.", "Heat and froth milk.", "Mix vanilla and sugar into espresso.", "Pour frothed milk over espresso."], prepTime: 4, difficulty: "medium", tags: ["warm", "creamy"], imageSearch: "vanilla-latte" },
  { name: "Caramel Frappuccino", description: "Blended iced coffee with caramel and whipped cream.", ingredients: [{ name: "Coffee", qty: "1 cup brewed, cooled", type: "other" }, { name: "Milk", qty: "1/2 cup", type: "dairy" }, { name: "Caramel Syrup", qty: "2 tbsp", type: "sweetener" }, { name: "Ice", qty: "1 cup", type: "other" }, { name: "Whipped Cream", qty: "topping", type: "dairy" }], steps: ["Add coffee, milk, caramel, and ice to blender.", "Blend until slushy.", "Pour into glass and top with whipped cream.", "Drizzle caramel on top."], prepTime: 3, difficulty: "easy", tags: ["creamy", "refreshing"], imageSearch: "caramel-frappuccino" },
  { name: "Mocha", description: "Espresso with chocolate and steamed milk.", ingredients: [{ name: "Coffee", qty: "2 shots espresso", type: "other" }, { name: "Cocoa Powder", qty: "1 tbsp", type: "other" }, { name: "Sugar", qty: "1 tbsp", type: "sweetener" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Whipped Cream", qty: "topping", type: "dairy" }], steps: ["Mix cocoa powder and sugar with hot espresso.", "Steam milk and pour over the mocha mix.", "Top with whipped cream."], prepTime: 4, difficulty: "medium", tags: ["warm", "creamy"], imageSearch: "mocha-coffee" },
  { name: "Matcha Latte", description: "Japanese green tea latte with frothy milk.", ingredients: [{ name: "Matcha Powder", qty: "2 tsp", type: "other" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Honey", qty: "1 tbsp", type: "sweetener" }, { name: "Hot Water", qty: "2 tbsp", type: "mixer" }], steps: ["Whisk matcha powder with hot water until smooth.", "Heat and froth milk.", "Pour matcha into a cup.", "Add frothed milk and honey."], prepTime: 3, difficulty: "easy", tags: ["warm", "refreshing"], imageSearch: "matcha-latte" },
  { name: "Dalgona Coffee", description: "Whipped instant coffee over iced milk — the viral Korean coffee.", ingredients: [{ name: "Instant Coffee", qty: "2 tbsp", type: "other" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Hot Water", qty: "2 tbsp", type: "mixer" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Whip coffee, sugar, and hot water until fluffy (3-5 min).", "Fill a glass with ice and milk.", "Spoon whipped coffee on top.", "Stir before drinking."], prepTime: 5, difficulty: "medium", tags: ["creamy", "party"], imageSearch: "dalgona-coffee" },

  // ═══ TEAS ═══
  { name: "Masala Chai", description: "Indian spiced tea with milk — warm, aromatic, and comforting.", ingredients: [{ name: "Tea", qty: "2 tsp black tea", type: "other" }, { name: "Milk", qty: "1 cup", type: "dairy" }, { name: "Ginger", qty: "1 inch", type: "herb" }, { name: "Cinnamon", qty: "1 stick", type: "herb" }, { name: "Sugar", qty: "2 tsp", type: "sweetener" }, { name: "Water", qty: "1 cup", type: "mixer" }], steps: ["Boil water with ginger and cinnamon for 2 minutes.", "Add tea leaves and simmer 2 minutes.", "Add milk and sugar, bring to a boil.", "Strain and serve hot."], prepTime: 5, difficulty: "easy", tags: ["warm", "classic"], imageSearch: "masala-chai" },
  { name: "Iced Peach Tea", description: "Sweet and fruity iced tea with fresh peach flavor.", ingredients: [{ name: "Tea", qty: "2 bags black tea", type: "other" }, { name: "Peach", qty: "1 ripe, sliced", type: "fruit" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Lemon", qty: "1 wedge", type: "fruit" }, { name: "Ice", qty: "full glass", type: "other" }, { name: "Water", qty: "2 cups", type: "mixer" }], steps: ["Brew tea in hot water for 5 minutes.", "Add sugar and stir to dissolve.", "Let cool, then add peach slices.", "Serve over ice with lemon."], prepTime: 5, difficulty: "easy", tags: ["refreshing"], imageSearch: "iced-peach-tea" },
  { name: "Bubble Tea (Boba)", description: "Taiwanese milk tea with chewy tapioca pearls.", ingredients: [{ name: "Tea", qty: "2 bags black tea", type: "other" }, { name: "Milk", qty: "1/2 cup", type: "dairy" }, { name: "Tapioca Pearls", qty: "1/4 cup", type: "other" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Ice", qty: "1 cup", type: "other" }], steps: ["Cook tapioca pearls according to package (15-20 min).", "Brew tea, add sugar, let cool.", "Add cooked boba to glass.", "Pour tea, add milk and ice, stir."], prepTime: 7, difficulty: "medium", tags: ["party", "creamy"], imageSearch: "bubble-tea" },
  { name: "Mint Green Tea", description: "Light and refreshing green tea with fresh mint.", ingredients: [{ name: "Green Tea", qty: "1 bag", type: "other" }, { name: "Mint Leaves", qty: "8 leaves", type: "herb" }, { name: "Honey", qty: "1 tsp", type: "sweetener" }, { name: "Hot Water", qty: "1 cup", type: "mixer" }], steps: ["Steep green tea bag in hot water for 3 minutes.", "Add mint leaves and honey.", "Let steep 2 more minutes.", "Remove tea bag and serve."], prepTime: 5, difficulty: "easy", tags: ["warm", "refreshing"], imageSearch: "mint-green-tea" },
  { name: "Thai Iced Tea", description: "Creamy, sweet, and bright orange Thai tea over ice.", ingredients: [{ name: "Thai Tea Mix", qty: "3 tbsp", type: "other" }, { name: "Sugar", qty: "3 tbsp", type: "sweetener" }, { name: "Condensed Milk", qty: "2 tbsp", type: "dairy" }, { name: "Ice", qty: "full glass", type: "other" }, { name: "Water", qty: "1 cup", type: "mixer" }], steps: ["Brew Thai tea mix in boiling water for 5 min.", "Strain and add sugar while hot.", "Let cool completely.", "Pour over ice and top with condensed milk."], prepTime: 5, difficulty: "easy", tags: ["creamy", "refreshing"], imageSearch: "thai-iced-tea" },

  // ═══ JUICES & LEMONADES ═══
  { name: "Orange Carrot Juice", description: "A vibrant, vitamin-packed fresh juice.", ingredients: [{ name: "Orange", qty: "2 whole", type: "fruit" }, { name: "Carrot", qty: "2 large", type: "other" }, { name: "Ginger", qty: "1/2 inch", type: "herb" }], steps: ["Peel oranges and chop carrots.", "Run through a juicer with ginger.", "Stir and serve fresh."], prepTime: 4, difficulty: "easy", tags: ["quick", "refreshing", "budget"], imageSearch: "orange-carrot-juice" },
  { name: "Watermelon Mint Juice", description: "Hydrating watermelon juice with fresh mint.", ingredients: [{ name: "Watermelon", qty: "3 cups cubed", type: "fruit" }, { name: "Mint Leaves", qty: "10 leaves", type: "herb" }, { name: "Lime", qty: "1 tbsp juice", type: "fruit" }, { name: "Ice", qty: "1 cup", type: "other" }], steps: ["Blend watermelon chunks until smooth.", "Add mint and lime, blend briefly.", "Strain and serve over ice."], prepTime: 3, difficulty: "easy", tags: ["refreshing", "budget"], imageSearch: "watermelon-mint-juice" },
  { name: "Pineapple Ginger Juice", description: "A spicy-sweet tropical juice with a ginger kick.", ingredients: [{ name: "Pineapple Juice", qty: "2 cups", type: "juice" }, { name: "Ginger", qty: "1 inch", type: "herb" }, { name: "Lime", qty: "1 tbsp juice", type: "fruit" }, { name: "Honey", qty: "1 tbsp", type: "sweetener" }], steps: ["Blend pineapple juice with fresh ginger.", "Strain through a mesh strainer.", "Add lime juice and honey.", "Serve chilled."], prepTime: 3, difficulty: "easy", tags: ["tropical", "refreshing"], imageSearch: "pineapple-ginger-juice" },
  { name: "Pink Lemonade", description: "Classic lemonade with a pink twist from cranberry or raspberry.", ingredients: [{ name: "Lemon", qty: "4 whole", type: "fruit" }, { name: "Cranberry Juice", qty: "1/4 cup", type: "juice" }, { name: "Sugar", qty: "1/2 cup", type: "sweetener" }, { name: "Water", qty: "4 cups", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Squeeze lemons and mix with sugar and water.", "Add cranberry juice for color.", "Stir well and serve over ice.", "Garnish with lemon slices."], prepTime: 5, difficulty: "easy", tags: ["refreshing", "party"], imageSearch: "pink-lemonade" },
  { name: "Cucumber Lime Agua Fresca", description: "A light and hydrating Mexican-style refresher.", ingredients: [{ name: "Cucumber", qty: "1 large", type: "fruit" }, { name: "Lime", qty: "2 whole", type: "fruit" }, { name: "Sugar", qty: "3 tbsp", type: "sweetener" }, { name: "Water", qty: "3 cups", type: "mixer" }, { name: "Mint Leaves", qty: "5 leaves", type: "herb" }], steps: ["Peel and chop cucumber.", "Blend with water, lime juice, and sugar.", "Strain, add mint leaves.", "Chill and serve over ice."], prepTime: 5, difficulty: "easy", tags: ["refreshing", "budget"], imageSearch: "cucumber-agua-fresca" },

  // ═══ LASSIS & INDIAN DRINKS ═══
  { name: "Rose Lassi", description: "Fragrant rose-flavored yogurt drink.", ingredients: [{ name: "Yogurt", qty: "1 cup", type: "dairy" }, { name: "Rose Syrup", qty: "2 tbsp", type: "sweetener" }, { name: "Sugar", qty: "1 tbsp", type: "sweetener" }, { name: "Ice", qty: "1/2 cup", type: "other" }, { name: "Cardamom", qty: "1/4 tsp powder", type: "herb" }], steps: ["Blend yogurt, rose syrup, sugar, and ice.", "Add cardamom powder.", "Blend until frothy.", "Serve chilled with rose petals."], prepTime: 2, difficulty: "easy", tags: ["quick", "creamy", "refreshing"], imageSearch: "rose-lassi" },
  { name: "Sweet Lassi", description: "Classic Indian sweet yogurt drink.", ingredients: [{ name: "Yogurt", qty: "1 cup", type: "dairy" }, { name: "Sugar", qty: "3 tbsp", type: "sweetener" }, { name: "Cardamom", qty: "1/4 tsp", type: "herb" }, { name: "Ice", qty: "1/2 cup", type: "other" }], steps: ["Blend yogurt, sugar, cardamom, and ice.", "Blend until smooth and frothy.", "Pour and serve immediately."], prepTime: 2, difficulty: "easy", tags: ["quick", "creamy", "budget"], imageSearch: "sweet-lassi" },
  { name: "Jaljeera", description: "A tangy Indian spiced cumin water — perfect digestive.", ingredients: [{ name: "Cumin Powder", qty: "1 tsp", type: "herb" }, { name: "Mint Leaves", qty: "10 leaves", type: "herb" }, { name: "Lemon", qty: "2 tbsp juice", type: "fruit" }, { name: "Salt", qty: "1/2 tsp", type: "other" }, { name: "Water", qty: "2 cups", type: "mixer" }, { name: "Sugar", qty: "1 tsp", type: "sweetener" }], steps: ["Blend mint leaves with a little water.", "Mix cumin powder, lemon juice, salt, and sugar.", "Add to cold water and stir.", "Serve chilled."], prepTime: 3, difficulty: "easy", tags: ["refreshing", "budget"], imageSearch: "jaljeera-drink" },
  { name: "Thandai", description: "A rich Indian festive milk drink with nuts and saffron.", ingredients: [{ name: "Milk", qty: "2 cups", type: "dairy" }, { name: "Almonds", qty: "10", type: "other" }, { name: "Cardamom", qty: "3 pods", type: "herb" }, { name: "Saffron", qty: "pinch", type: "herb" }, { name: "Sugar", qty: "3 tbsp", type: "sweetener" }, { name: "Rose Syrup", qty: "1 tbsp", type: "sweetener" }], steps: ["Soak almonds for 2 hours and peel.", "Grind almonds and cardamom to a paste.", "Boil milk, add paste, saffron, and sugar.", "Cool, add rose syrup, and serve chilled."], prepTime: 7, difficulty: "medium", tags: ["creamy", "party"], imageSearch: "thandai-drink" },

  // ═══ MOCKTAILS ═══
  { name: "Nojito", description: "A refreshing mint and lime mocktail — mojito's sober cousin.", ingredients: [{ name: "Lime", qty: "1 whole", type: "fruit" }, { name: "Mint Leaves", qty: "12 leaves", type: "herb" }, { name: "Sugar", qty: "2 tsp", type: "sweetener" }, { name: "Soda Water", qty: "200ml", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Muddle mint and sugar in a glass.", "Squeeze lime and add juice.", "Fill with ice.", "Top with soda water and stir."], prepTime: 2, difficulty: "easy", tags: ["quick", "refreshing", "party"], imageSearch: "nojito-mocktail" },
  { name: "Fruit Punch", description: "A vibrant party punch with mixed fruit juices.", ingredients: [{ name: "Orange Juice", qty: "1 cup", type: "juice" }, { name: "Pineapple Juice", qty: "1 cup", type: "juice" }, { name: "Cranberry Juice", qty: "1/2 cup", type: "juice" }, { name: "Sprite/7Up", qty: "1 cup", type: "mixer" }, { name: "Orange", qty: "slices", type: "fruit" }, { name: "Ice", qty: "plenty", type: "other" }], steps: ["Mix all juices in a large pitcher.", "Add ice and orange slices.", "Top with Sprite just before serving.", "Stir gently and serve."], prepTime: 3, difficulty: "easy", tags: ["party", "refreshing", "tropical"], imageSearch: "fruit-punch" },
  { name: "Cinderella Mocktail", description: "A classic non-alcoholic cocktail with tropical juices.", ingredients: [{ name: "Orange Juice", qty: "30ml", type: "juice" }, { name: "Pineapple Juice", qty: "30ml", type: "juice" }, { name: "Lemon", qty: "30ml juice", type: "fruit" }, { name: "Grenadine", qty: "10ml", type: "sweetener" }, { name: "Soda Water", qty: "top up", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Shake orange juice, pineapple juice, and lemon juice with ice.", "Strain into a glass.", "Add grenadine for color.", "Top with soda water."], prepTime: 3, difficulty: "easy", tags: ["classic", "party"], imageSearch: "cinderella-mocktail" },
  { name: "Arnold Palmer", description: "Half iced tea, half lemonade — a timeless refresher.", ingredients: [{ name: "Tea", qty: "1 cup brewed, cooled", type: "other" }, { name: "Lemon", qty: "1/2 cup juice", type: "fruit" }, { name: "Sugar", qty: "2 tbsp", type: "sweetener" }, { name: "Ice", qty: "full glass", type: "other" }, { name: "Water", qty: "1/2 cup", type: "mixer" }], steps: ["Brew tea and let cool completely.", "Mix lemon juice, sugar, and water to make lemonade.", "Fill glass with ice.", "Pour half tea and half lemonade."], prepTime: 5, difficulty: "easy", tags: ["classic", "refreshing"], imageSearch: "arnold-palmer-drink" },
  { name: "Blue Lagoon Mocktail", description: "A striking blue drink with citrus and lemonade.", ingredients: [{ name: "Blue Curacao Syrup", qty: "30ml (non-alcoholic)", type: "sweetener" }, { name: "Lemon", qty: "30ml juice", type: "fruit" }, { name: "Sprite/7Up", qty: "200ml", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Add blue curacao syrup and lemon juice to a glass.", "Fill with ice.", "Top with Sprite.", "Garnish with a lemon wheel."], prepTime: 2, difficulty: "easy", tags: ["party", "quick", "refreshing"], imageSearch: "blue-lagoon-mocktail" },
  { name: "Sunset Mocktail", description: "A layered orange and red drink that looks like a sunset.", ingredients: [{ name: "Orange Juice", qty: "150ml", type: "juice" }, { name: "Grenadine", qty: "30ml", type: "sweetener" }, { name: "Soda Water", qty: "50ml", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Fill glass with ice.", "Pour orange juice.", "Add soda water.", "Slowly pour grenadine down the side — it will sink and create a gradient."], prepTime: 2, difficulty: "easy", tags: ["party", "quick"], imageSearch: "sunset-mocktail" },
  { name: "Piña Colada Mocktail", description: "Creamy tropical mocktail with pineapple and coconut.", ingredients: [{ name: "Pineapple Juice", qty: "150ml", type: "juice" }, { name: "Coconut Cream", qty: "60ml", type: "mixer" }, { name: "Ice", qty: "1 cup", type: "other" }, { name: "Pineapple", qty: "1 slice", type: "fruit" }], steps: ["Blend pineapple juice, coconut cream, and ice.", "Blend until smooth and frothy.", "Pour into a tall glass.", "Garnish with pineapple slice."], prepTime: 3, difficulty: "easy", tags: ["tropical", "creamy", "party"], imageSearch: "virgin-pina-colada" },

  // ═══ SODAS & FIZZY ═══
  { name: "Homemade Ginger Ale", description: "Spicy, sweet homemade ginger ale with real ginger.", ingredients: [{ name: "Ginger", qty: "2 inches", type: "herb" }, { name: "Lemon", qty: "1 whole", type: "fruit" }, { name: "Sugar", qty: "1/4 cup", type: "sweetener" }, { name: "Soda Water", qty: "2 cups", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Grate ginger and simmer with sugar and 1/2 cup water for 10 min.", "Strain the ginger syrup and let cool.", "Add lemon juice.", "Mix with soda water over ice."], prepTime: 7, difficulty: "medium", tags: ["refreshing"], imageSearch: "homemade-ginger-ale" },
  { name: "Italian Cream Soda", description: "A fizzy, creamy soda in any flavor you like.", ingredients: [{ name: "Flavored Syrup", qty: "30ml (any flavor)", type: "sweetener" }, { name: "Soda Water", qty: "200ml", type: "mixer" }, { name: "Cream", qty: "2 tbsp", type: "dairy" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Add syrup to a glass.", "Fill with ice and soda water.", "Stir gently.", "Float cream on top."], prepTime: 1, difficulty: "easy", tags: ["quick", "creamy", "party"], imageSearch: "italian-cream-soda" },
  { name: "Lavender Lemonade", description: "Floral and refreshing lemonade with dried lavender.", ingredients: [{ name: "Lemon", qty: "4 whole", type: "fruit" }, { name: "Dried Lavender", qty: "2 tbsp", type: "herb" }, { name: "Sugar", qty: "1/2 cup", type: "sweetener" }, { name: "Water", qty: "4 cups", type: "mixer" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Make lavender syrup: simmer lavender, sugar, and 1 cup water for 5 min.", "Strain and let cool.", "Squeeze lemons and mix with syrup and remaining water.", "Serve over ice."], prepTime: 7, difficulty: "medium", tags: ["refreshing"], imageSearch: "lavender-lemonade" },
  { name: "Sparkling Apple Cider", description: "A festive non-alcoholic sparkling apple drink.", ingredients: [{ name: "Apple Juice", qty: "2 cups", type: "juice" }, { name: "Soda Water", qty: "1 cup", type: "mixer" }, { name: "Cinnamon", qty: "1 stick", type: "herb" }, { name: "Lemon", qty: "1 tbsp juice", type: "fruit" }, { name: "Ice", qty: "full glass", type: "other" }], steps: ["Chill apple juice.", "Pour into glasses over ice.", "Add lemon juice and top with soda water.", "Garnish with cinnamon stick."], prepTime: 2, difficulty: "easy", tags: ["party", "refreshing", "quick"], imageSearch: "sparkling-apple-cider" },
];

// ─── Main Seeder ─────────────────────────────────────────────────────

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

  let inserted = 0;
  let skipped = 0;

  for (const d of drinks) {
    if (existingNames.has(d.name.toLowerCase())) { skipped++; continue; }

    try {
      const popularity = Math.floor(50 + Math.random() * 40);

      const [drink] = await sql`
        INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty, ingredient_count, popularity_score)
        VALUES (${d.name}, ${d.description}, ${false}, ${d.prepTime}, ${d.difficulty}, ${d.ingredients.length}, ${popularity})
        RETURNING id
      `;

      // Ingredients
      for (const ing of d.ingredients) {
        const normName = normalize(ing.name);
        let ingId: number = ingredientMap.get(normName) ?? 0;
        if (ingId === 0) {
          const [created] = await sql`
            INSERT INTO ingredients (name, normalized_name, type, is_alcoholic)
            VALUES (${ing.name}, ${normName}, ${ing.type}, ${false})
            ON CONFLICT (normalized_name) DO UPDATE SET name = ${ing.name}
            RETURNING id
          `;
          ingId = created.id;
          ingredientMap.set(normName, ingId);
        }
        await sql`INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional) VALUES (${drink.id}, ${ingId}, ${ing.qty}, ${false})`;
      }

      // Steps
      for (let i = 0; i < d.steps.length; i++) {
        await sql`INSERT INTO drink_steps (drink_id, step_number, instruction) VALUES (${drink.id}, ${i + 1}, ${d.steps[i]})`;
      }

      // Tags
      for (const tag of d.tags) {
        const tagId = tagMap.get(tag);
        if (tagId) {
          await sql`INSERT INTO drink_tag_map (drink_id, tag_id) VALUES (${drink.id}, ${tagId}) ON CONFLICT DO NOTHING`;
        }
      }

      inserted++;
    } catch (err: any) {
      console.error(`Error: ${d.name}:`, err.message);
    }
  }

  const [{ count: total }] = await sql`SELECT COUNT(*) as count FROM drinks`;
  const [{ count: nonAlc }] = await sql`SELECT COUNT(*) as count FROM drinks WHERE is_alcoholic = false`;
  const [{ count: totalIng }] = await sql`SELECT COUNT(*) as count FROM ingredients`;

  console.log("\n══════════════════════════════════════");
  console.log(`  Inserted: ${inserted} new drinks`);
  console.log(`  Skipped:  ${skipped} (already exist)`);
  console.log("──────────────────────────────────────");
  console.log(`  Total drinks:          ${total}`);
  console.log(`  Non-alcoholic drinks:  ${nonAlc}`);
  console.log(`  Total ingredients:     ${totalIng}`);
  console.log("══════════════════════════════════════\n");

  await sql.end();
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
