/**
 * Seed script — fetches all drinks from TheCocktailDB API and inserts into DB.
 * Run: npx ts-node scripts/seed-drinks.ts
 */
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

const API_BASE = "https://www.thecocktaildb.com/api/json/v1/1";

// ─── Helpers ─────────────────────────────────────────────────────────

function normalize(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function classifyIngredient(name: string): { type: string; isAlcoholic: boolean } {
  const n = name.toLowerCase();
  const spirits = ["vodka", "rum", "gin", "tequila", "whiskey", "whisky", "bourbon",
    "brandy", "cognac", "mezcal", "absinthe", "sake", "scotch", "rye"];
  const liqueurs = ["kahlua", "baileys", "amaretto", "cointreau", "triple sec",
    "curacao", "schnapps", "campari", "vermouth", "chartreuse", "chambord",
    "frangelico", "galliano", "midori", "ouzo", "sambuca", "maraschino",
    "benedictine", "drambuie", "pernod", "pastis", "aperol", "limoncello",
    "grand marnier", "blue curacao", "creme de", "sloe gin"];
  const beer = ["beer", "ale", "lager", "stout", "guinness"];
  const wine = ["wine", "champagne", "prosecco", "port", "sherry"];
  const juices = ["juice", "nectar"];
  const dairy = ["milk", "cream", "yogurt", "egg", "half-and-half"];
  const herbs = ["mint", "basil", "rosemary", "thyme", "cilantro", "cinnamon", "nutmeg", "clove"];
  const fruits = ["lemon", "lime", "orange", "cherry", "strawberry", "raspberry",
    "blueberry", "banana", "pineapple", "mango", "peach", "apple", "grape",
    "watermelon", "coconut", "kiwi", "passion fruit", "grapefruit", "cranberry",
    "pomegranate", "blackberry", "olive"];
  const sweeteners = ["sugar", "syrup", "honey", "agave", "grenadine", "molasses"];
  const mixers = ["soda", "tonic", "cola", "ginger ale", "ginger beer", "sprite",
    "7-up", "club soda", "sparkling", "water", "energy drink", "red bull"];

  if (spirits.some(s => n.includes(s))) return { type: "alcohol", isAlcoholic: true };
  if (liqueurs.some(s => n.includes(s))) return { type: "liqueur", isAlcoholic: true };
  if (beer.some(s => n.includes(s))) return { type: "beer", isAlcoholic: true };
  if (wine.some(s => n.includes(s))) return { type: "wine", isAlcoholic: true };
  if (n.includes("bitters")) return { type: "alcohol", isAlcoholic: true };
  if (n.includes("liqueur") || n.includes("schnapps")) return { type: "liqueur", isAlcoholic: true };
  if (juices.some(s => n.includes(s))) return { type: "juice", isAlcoholic: false };
  if (dairy.some(s => n.includes(s))) return { type: "dairy", isAlcoholic: false };
  if (herbs.some(s => n.includes(s))) return { type: "herb", isAlcoholic: false };
  if (fruits.some(s => n.includes(s))) return { type: "fruit", isAlcoholic: false };
  if (sweeteners.some(s => n.includes(s))) return { type: "sweetener", isAlcoholic: false };
  if (mixers.some(s => n.includes(s))) return { type: "mixer", isAlcoholic: false };
  if (n.includes("coffee") || n.includes("tea") || n.includes("cocoa") || n.includes("chocolate"))
    return { type: "other", isAlcoholic: false };
  if (n.includes("ice")) return { type: "other", isAlcoholic: false };

  // Default: check if it sounds alcoholic
  const alcoholKeywords = ["liquor", "spirit", "alcohol", "proof", "aperitif", "digestif"];
  if (alcoholKeywords.some(s => n.includes(s))) return { type: "alcohol", isAlcoholic: true };

  return { type: "other", isAlcoholic: false };
}

function parseDifficulty(ingredientCount: number): string {
  if (ingredientCount <= 3) return "easy";
  if (ingredientCount <= 6) return "medium";
  return "hard";
}

function estimatePrepTime(ingredientCount: number, instructions: string): number {
  const words = instructions.split(/\s+/).length;
  if (ingredientCount <= 2 && words < 30) return 1;
  if (ingredientCount <= 4 && words < 60) return 3;
  if (ingredientCount <= 6) return 5;
  return 7;
}

// ─── Tag Assignment ──────────────────────────────────────────────────

function assignTags(drink: any, ingredientCount: number, prepTime: number): string[] {
  const tags: string[] = [];
  const name = (drink.strDrink || "").toLowerCase();
  const cat = (drink.strCategory || "").toLowerCase();
  const instructions = (drink.strInstructions || "").toLowerCase();

  if (prepTime <= 2) tags.push("quick");
  if (ingredientCount <= 3) tags.push("budget");

  if (cat.includes("party") || cat.includes("punch") || cat.includes("shot"))
    tags.push("party");
  if (name.includes("tropical") || name.includes("colada") || name.includes("daiquiri") ||
      name.includes("mai tai") || instructions.includes("pineapple") || instructions.includes("coconut"))
    tags.push("tropical");
  if (instructions.includes("cream") || instructions.includes("milk") || instructions.includes("baileys"))
    tags.push("creamy");
  if (instructions.includes("hot") || instructions.includes("warm") || instructions.includes("heat") ||
      name.includes("hot") || name.includes("toddy") || name.includes("coffee"))
    tags.push("warm");
  if (instructions.includes("refresh") || instructions.includes("cool") ||
      name.includes("cooler") || name.includes("spritz"))
    tags.push("refreshing");
  if (["martini", "manhattan", "old fashioned", "negroni", "daiquiri", "sour",
       "gimlet", "sidecar", "alexander"].some(c => name.includes(c)))
    tags.push("classic");

  return [...new Set(tags)];
}

// ─── Fetch from TheCocktailDB ────────────────────────────────────────

async function fetchAllDrinks(): Promise<any[]> {
  const allDrinks: any[] = [];
  const letters = "abcdefghijklmnopqrstuvwxyz0123456789".split("");

  for (const letter of letters) {
    try {
      const res = await fetch(`${API_BASE}/search.php?f=${letter}`);
      const data: any = await res.json();
      if (data && data.drinks) {
        allDrinks.push(...data.drinks);
      }
    } catch (err) {
      console.error(`Failed to fetch letter ${letter}:`, err);
    }
    // Rate limit: small delay
    await new Promise(r => setTimeout(r, 200));
  }

  return allDrinks;
}

// ─── Extract Ingredients from CocktailDB drink object ────────────────

function extractIngredients(drink: any): { name: string; measure: string }[] {
  const ingredients: { name: string; measure: string }[] = [];
  for (let i = 1; i <= 15; i++) {
    const name = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({
        name: name.trim(),
        measure: (measure || "").trim(),
      });
    }
  }
  return ingredients;
}

// ─── Parse Instructions into Steps ───────────────────────────────────

function parseSteps(instructions: string): string[] {
  if (!instructions) return ["Prepare and serve."];

  // Try splitting by numbered steps
  const numbered = instructions.split(/\d+[\.\)]\s*/g).filter(s => s.trim());
  if (numbered.length > 1) return numbered.map(s => s.trim().replace(/\.$/, "").trim() + ".");

  // Try splitting by sentences
  const sentences = instructions
    .split(/\.\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 3)
    .map(s => s.endsWith(".") ? s : s + ".");

  if (sentences.length > 1) return sentences;

  // Single block: split into ~2-3 steps
  if (instructions.length > 100) {
    const mid = Math.floor(instructions.length / 2);
    const breakPoint = instructions.indexOf(".", mid);
    if (breakPoint > 0 && breakPoint < instructions.length - 5) {
      return [
        instructions.slice(0, breakPoint + 1).trim(),
        instructions.slice(breakPoint + 1).trim(),
      ];
    }
  }

  return [instructions.trim()];
}

// ─── Main Seeder ─────────────────────────────────────────────────────

async function main() {
  console.log("Fetching drinks from TheCocktailDB...");
  const rawDrinks = await fetchAllDrinks();
  console.log(`Fetched ${rawDrinks.length} drinks from API`);

  // Deduplicate by name
  const seen = new Set<string>();
  const drinks = rawDrinks.filter(d => {
    const name = d.strDrink?.toLowerCase().trim();
    if (!name || seen.has(name)) return false;
    // Skip if instructions not in English
    if (!d.strInstructions) return false;
    seen.add(name);
    return true;
  });
  console.log(`${drinks.length} unique drinks with English instructions`);

  // ─── Get existing data ──────────────────────────────────
  const existingDrinks = await sql`SELECT name FROM drinks`;
  const existingNames = new Set(existingDrinks.map((d: any) => d.name.toLowerCase()));

  const existingIngredients = await sql`SELECT id, normalized_name FROM ingredients`;
  const ingredientMap = new Map<string, number>();
  for (const i of existingIngredients) {
    ingredientMap.set(i.normalized_name, i.id);
  }

  const existingTags = await sql`SELECT id, name FROM drink_tags`;
  const tagMap = new Map<string, number>();
  for (const t of existingTags) {
    tagMap.set(t.name, t.id);
  }

  // Ensure all needed tags exist
  const allTagNames = ["quick", "budget", "party", "tropical", "creamy", "warm", "refreshing", "classic"];
  for (const tagName of allTagNames) {
    if (!tagMap.has(tagName)) {
      const [created] = await sql`INSERT INTO drink_tags (name) VALUES (${tagName}) ON CONFLICT (name) DO UPDATE SET name = ${tagName} RETURNING id, name`;
      tagMap.set(created.name, created.id);
    }
  }

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const raw of drinks) {
    const drinkName = raw.strDrink?.trim();
    if (!drinkName || existingNames.has(drinkName.toLowerCase())) {
      skipped++;
      continue;
    }

    try {
      const rawIngredients = extractIngredients(raw);
      const isAlcoholic = raw.strAlcoholic?.toLowerCase() !== "non alcoholic";
      const ingredientCount = rawIngredients.length;
      const instructions = raw.strInstructions || "";
      const prepTime = estimatePrepTime(ingredientCount, instructions);
      const difficulty = parseDifficulty(ingredientCount);
      const imageUrl = raw.strDrinkThumb || null;
      const thumbUrl = imageUrl ? `${imageUrl}/preview` : null;
      const steps = parseSteps(instructions);
      const tags = assignTags(raw, ingredientCount, prepTime);

      // Popularity: random 40-85
      const popularity = Math.floor(40 + Math.random() * 45);

      // Insert drink
      const [drink] = await sql`
        INSERT INTO drinks (name, description, is_alcoholic, prep_time_minutes, difficulty, image_url, thumbnail_url, ingredient_count, popularity_score)
        VALUES (${drinkName}, ${raw.strInstructions?.slice(0, 200) || ""}, ${isAlcoholic}, ${prepTime}, ${difficulty}, ${imageUrl}, ${thumbUrl}, ${ingredientCount}, ${popularity})
        RETURNING id
      `;

      // Insert image
      if (imageUrl) {
        await sql`INSERT INTO drink_images (drink_id, image_url, sort_order) VALUES (${drink.id}, ${imageUrl}, ${0})`;
        // Also add the /preview variant as second image
        if (thumbUrl) {
          await sql`INSERT INTO drink_images (drink_id, image_url, sort_order) VALUES (${drink.id}, ${thumbUrl}, ${1})`;
        }
      }

      // Insert ingredients
      for (const ing of rawIngredients) {
        const normName = normalize(ing.name);
        let ingId: number = ingredientMap.get(normName) ?? 0;

        if (ingId === 0) {
          const info = classifyIngredient(ing.name);
          const [created] = await sql`
            INSERT INTO ingredients (name, normalized_name, type, is_alcoholic)
            VALUES (${ing.name}, ${normName}, ${info.type}, ${info.isAlcoholic})
            ON CONFLICT (normalized_name) DO UPDATE SET name = ${ing.name}
            RETURNING id
          `;
          ingId = created.id;
          ingredientMap.set(normName, ingId);
        }

        await sql`
          INSERT INTO drink_ingredients (drink_id, ingredient_id, quantity, is_optional)
          VALUES (${drink.id}, ${ingId}, ${ing.measure || null}, ${false})
        `;
      }

      // Insert steps
      for (let i = 0; i < steps.length; i++) {
        await sql`
          INSERT INTO drink_steps (drink_id, step_number, instruction)
          VALUES (${drink.id}, ${i + 1}, ${steps[i]})
        `;
      }

      // Insert tags
      for (const tag of tags) {
        const tagId = tagMap.get(tag);
        if (tagId) {
          await sql`
            INSERT INTO drink_tag_map (drink_id, tag_id)
            VALUES (${drink.id}, ${tagId})
            ON CONFLICT DO NOTHING
          `;
        }
      }

      inserted++;
      if (inserted % 50 === 0) {
        console.log(`  ... ${inserted} drinks inserted`);
      }
    } catch (err: any) {
      errors++;
      if (errors < 5) console.error(`Error inserting "${drinkName}":`, err.message);
    }
  }

  // ─── Final stats ────────────────────────────────────────
  const [{ count: totalDrinks }] = await sql`SELECT COUNT(*) as count FROM drinks`;
  const [{ count: totalIngredients }] = await sql`SELECT COUNT(*) as count FROM ingredients`;
  const [{ count: totalImages }] = await sql`SELECT COUNT(*) as count FROM drink_images`;
  const [{ count: totalSteps }] = await sql`SELECT COUNT(*) as count FROM drink_steps`;

  console.log("\n══════════════════════════════════════");
  console.log(`  Inserted: ${inserted} new drinks`);
  console.log(`  Skipped:  ${skipped} (already exist)`);
  console.log(`  Errors:   ${errors}`);
  console.log("──────────────────────────────────────");
  console.log(`  Total drinks:      ${totalDrinks}`);
  console.log(`  Total ingredients: ${totalIngredients}`);
  console.log(`  Total images:      ${totalImages}`);
  console.log(`  Total steps:       ${totalSteps}`);
  console.log("══════════════════════════════════════\n");

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
