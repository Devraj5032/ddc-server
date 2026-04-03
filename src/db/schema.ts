import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── INGREDIENTS ─────────────────────────────────────────────────────

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  normalizedName: varchar("normalized_name", { length: 100 }).unique().notNull(),
  type: varchar("type", { length: 50 }),
  isAlcoholic: boolean("is_alcoholic").default(false),
  aliases: text("aliases").array().default([]),
  isBaseSpirit: boolean("is_base_spirit").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  drinkIngredients: many(drinkIngredients),
}));

// ─── DRINKS ──────────────────────────────────────────────────────────

export const drinks = pgTable("drinks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  isAlcoholic: boolean("is_alcoholic").notNull(),
  prepTimeMinutes: integer("prep_time_minutes").default(5),
  difficulty: varchar("difficulty", { length: 20 }).default("easy"),
  ingredientCount: integer("ingredient_count").default(0),
  popularityScore: integer("popularity_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drinksRelations = relations(drinks, ({ many }) => ({
  drinkImages: many(drinkImages),
  drinkIngredients: many(drinkIngredients),
  drinkSteps: many(drinkSteps),
  drinkTagMap: many(drinkTagMap),
}));

// ─── DRINK IMAGES ───────────────────────────────────────────────────

export const drinkImages = pgTable("drink_images", {
  id: serial("id").primaryKey(),
  drinkId: integer("drink_id")
    .references(() => drinks.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const drinkImagesRelations = relations(drinkImages, ({ one }) => ({
  drink: one(drinks, {
    fields: [drinkImages.drinkId],
    references: [drinks.id],
  }),
}));

// ─── DRINK INGREDIENTS ──────────────────────────────────────────────

export const drinkIngredients = pgTable("drink_ingredients", {
  id: serial("id").primaryKey(),
  drinkId: integer("drink_id")
    .references(() => drinks.id, { onDelete: "cascade" })
    .notNull(),
  ingredientId: integer("ingredient_id")
    .references(() => ingredients.id)
    .notNull(),
  quantity: varchar("quantity", { length: 50 }),
  isOptional: boolean("is_optional").default(false),
});

export const drinkIngredientsRelations = relations(drinkIngredients, ({ one }) => ({
  drink: one(drinks, {
    fields: [drinkIngredients.drinkId],
    references: [drinks.id],
  }),
  ingredient: one(ingredients, {
    fields: [drinkIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));

// ─── DRINK STEPS ─────────────────────────────────────────────────────

export const drinkSteps = pgTable("drink_steps", {
  id: serial("id").primaryKey(),
  drinkId: integer("drink_id")
    .references(() => drinks.id, { onDelete: "cascade" })
    .notNull(),
  stepNumber: integer("step_number").notNull(),
  instruction: text("instruction"),
});

export const drinkStepsRelations = relations(drinkSteps, ({ one }) => ({
  drink: one(drinks, {
    fields: [drinkSteps.drinkId],
    references: [drinks.id],
  }),
}));

// ─── DRINK TAGS ──────────────────────────────────────────────────────

export const drinkTags = pgTable("drink_tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).unique(),
});

export const drinkTagsRelations = relations(drinkTags, ({ many }) => ({
  drinkTagMap: many(drinkTagMap),
}));

// ─── DRINK TAG MAP ──────────────────────────────────────────────────

export const drinkTagMap = pgTable(
  "drink_tag_map",
  {
    drinkId: integer("drink_id")
      .references(() => drinks.id, { onDelete: "cascade" })
      .notNull(),
    tagId: integer("tag_id")
      .references(() => drinkTags.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.drinkId, table.tagId] })]
);

export const drinkTagMapRelations = relations(drinkTagMap, ({ one }) => ({
  drink: one(drinks, {
    fields: [drinkTagMap.drinkId],
    references: [drinks.id],
  }),
  tag: one(drinkTags, {
    fields: [drinkTagMap.tagId],
    references: [drinkTags.id],
  }),
}));

// ─── FAVORITES ──────────────────────────────────────────────────────

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 100 }),
  drinkId: integer("drink_id").references(() => drinks.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── USERS ──────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  dateOfBirth: varchar("date_of_birth", { length: 10 }),
  bio: varchar("bio", { length: 200 }),
  avatarUrl: text("avatar_url"),
  isAlcoholic: boolean("preference_alcoholic").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── OTP CODES ──────────────────────────────────────────────────────

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── ANALYTICS ──────────────────────────────────────────────────────

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});
