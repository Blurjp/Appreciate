# Appreciate — Web App

Web version of the Appreciate gratitude platform, built with Next.js 14 to match the iOS app pixel-for-pixel.

## Quick Start

```bash
# Install dependencies
npm install

# Set up the database
npx prisma db push

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (matching iOS design tokens)
- **Database:** Prisma + SQLite
- **Auth:** NextAuth.js (credentials + guest mode)
- **State:** React Query

## Features

1. **Gratitude Post Creation** — 3-step wizard (content → category → visibility)
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
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Utilities, auth, db
├── types/                 # TypeScript types
└── prisma/                # Database schema
```

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```
