# Daily Drink Companion — Server

Backend API for the Daily Drink Companion mobile app. Built with Node.js, Express, TypeScript, Drizzle ORM, and Supabase (PostgreSQL).

## Features

- **Drink Matching Engine** — find drinks by ingredients with match percentage scoring
- **Email OTP Auth** — passwordless login via Gmail
- **Full-text Search** — PostgreSQL tsvector with ilike fallback
- **In-memory Caching** — 60–120s TTL on high-traffic endpoints
- **Analytics Tracking** — ingredient selections, drink views, searches
- **Usage-based Suggestions** — personalized "For You" recommendations

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **ORM**: Drizzle ORM
- **Database**: Supabase (PostgreSQL)
- **Driver**: postgres.js with SSL
- **Email**: Nodemailer (Gmail SMTP)

## Database (11 tables)

`users`, `otp_codes`, `ingredients`, `drinks`, `drink_images`, `drink_ingredients`, `drink_steps`, `drink_tags`, `drink_tag_map`, `favorites`, `analytics_events`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP, return user |
| GET | `/api/auth/me?email=` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/ingredients` | List all ingredients |
| GET | `/api/ingredients/search?q=` | Fuzzy search (name + aliases) |
| GET | `/api/ingredients/suggested` | Common starting ingredients |
| GET | `/api/drinks/match?ingredients=1,2,3` | Core matching engine |
| GET | `/api/drinks/quick` | Drinks under 2 min |
| GET | `/api/drinks/popular` | Top by popularity |
| GET | `/api/drinks/random` | Weighted random |
| GET | `/api/drinks/search?q=` | Full-text search |
| GET | `/api/drinks/for-you` | Usage-based suggestions |
| GET | `/api/drinks/:id` | Drink detail |
| POST | `/api/analytics/track` | Track events |
| GET | `/api/health` | Health check |

## Setup

```bash
cp .env.example .env
# Fill in DATABASE_URL, GMAIL_USER, GMAIL_APP_PASSWORD

npm install
npm run dev
```

## Environment Variables

```
PORT=3000
DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-[REGION].pooler.supabase.com:6543/postgres
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (hot reload) |
| `npm run build` | Compile TypeScript |
| `npm start` | Production |
| `npm run db:push` | Push schema to DB |
| `npm run db:studio` | Visual DB browser |

## Seed Data

```bash
npx ts-node scripts/seed-drinks.ts    # 435 cocktails from TheCocktailDB
npx ts-node scripts/seed-mocktails.ts  # 41 mocktails, smoothies, coffees
npx ts-node scripts/seed-nonalc.ts     # 45 global non-alcoholic drinks
```

**Total: 536 drinks, 357 ingredients, 900+ images**
