# Appreciate — Web App

Web version of the Appreciate gratitude platform, built with Next.js 14 to match the iOS app pixel-for-pixel.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and fill in Supabase credentials
cp .env.example .env

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (matching iOS design tokens)
- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** Supabase Auth (Sign in with Apple, anonymous)
- **State:** React Query
- **Legacy:** Prisma + SQLite (kept for reference, not actively used)

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `SUPABASE_SETUP.md` in the SQL Editor
3. Copy your project URL and anon key to `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Test the connection: `npx tsx test-supabase.ts`

### How Auth Works
- Supabase Auth handles Sign in with Apple and session management
- The middleware (`middleware.ts`) refreshes auth tokens on every request
- Browser client (`lib/supabase/client.ts`) is used in React components
- Server client (`lib/supabase/server.ts`) is used in API routes

### How RLS Works
- Row Level Security policies are defined in the SQL schema
- The Supabase client automatically includes the user's JWT with every request
- Users can only see/edit their own private posts
- Public and anonymous posts are visible to everyone
- Streak data is only visible to the owning user

## Features

1. **Gratitude Post Creation** — 3-step wizard (content -> category -> visibility)
2. **Private/Public Toggle** — Private, Public, or Anonymous visibility
3. **My Wall** — Private reflection page with all your posts
4. **Streak Tracking** — Consecutive day tracking with emoji milestones
5. **Category System** — Family, Work, Small Joys, Nature, Health, Other
6. **Public Feed** — Browse and filter public appreciations
7. **Anonymous Mode** — Share publicly without revealing your name
8. **Positive Confirmations** — Motivational messages after posting

## Design System

Matches the iOS app exactly:

| Token | Value |
|-------|-------|
| Primary (Gold) | `#F5A623` |
| Secondary (Coral) | `#FF6F61` |
| Background | `#FEFCF9` |
| Text Primary | `#2C2C2E` |
| Text Secondary | `#8E8E93` |

## Project Structure

```
web/
├── app/
│   ├── (auth)/welcome/    # Auth/onboarding flow
│   ├── (main)/            # Authenticated routes
│   │   ├── feed/          # Public feed
│   │   ├── my-wall/       # Private journal
│   │   ├── create/        # Post creation
│   │   └── settings/      # User settings
│   └── api/               # API routes (thin wrappers around Supabase)
├── components/            # Reusable UI components
├── hooks/                 # React Query hooks (usePosts, useMyWall, useStreak)
├── lib/
│   ├── supabase/          # Supabase clients (client.ts, server.ts, middleware.ts)
│   ├── db/                # Database layer (posts.ts, streak.ts)
│   ├── auth.ts            # NextAuth config (legacy)
│   └── utils.ts           # Utility functions
├── types/                 # TypeScript types
└── prisma/                # Database schema (legacy reference)
```

## Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Legacy (kept for backwards compatibility)
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Migration Notes

The web app was migrated from Prisma + SQLite to Supabase. Key changes:
- API routes now use Supabase server client instead of Prisma
- Auth uses Supabase Auth instead of NextAuth credentials
- Streak calculation is handled by a Supabase database trigger
- Hearts use a dedicated `hearts` table with unique constraint
- RLS policies enforce data access at the database level
