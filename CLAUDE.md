# Appreciate Project - Claude Code Guide

## Project Overview
A gratitude journaling application with multiple frontend options and a Node.js backend.

## Project Structure

```
appreciate/
├── src/                    # Vite + React frontend (legacy)
│   ├── components/         # React components
│   ├── context/            # React context providers
│   └── types.ts            # TypeScript types
├── web/                    # Next.js frontend (main)
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities and API clients
│   └── middleware.ts       # Next.js middleware (auth)
├── backend/                # Node.js + Express API
│   ├── server.mjs          # Main server entry
│   ├── validation.mjs      # Zod validation schemas
│   └── src/                # TypeScript source files
└── prisma/                 # Database schema
```

## Server Ports

| Service    | Port  | URL                        | Notes                                  |
|------------|-------|----------------------------|----------------------------------------|
| Backend    | 3001  | http://localhost:3001      | Express API (from backend/.env.local)  |
| Frontend   | 3172  | http://localhost:3172      | Next.js (main frontend)                |
| Vite       | 5173  | http://localhost:5173      | Vite dev server (legacy)               |

**Important**: Run backend commands from the `backend/` directory to ensure `.env.local` is loaded correctly.

## Common Commands

```bash
# Start backend server (port 3001) - MUST run from backend/ directory
cd backend && PGSSLMODE=disable node server.mjs

# Start Next.js frontend (port 3172)
cd web && npm run dev

# Start Vite frontend (port 5173) - legacy
npm run dev

# Run tests
npm test

# Database operations (from backend/ directory)
cd backend && PGSSLMODE=disable node db/migrate.mjs  # Run migrations
cd backend && PGSSLMODE=disable node db/seed.mjs     # Seed database
cd backend && PGSSLMODE=disable node db/verify.mjs   # Verify connection
```

## Authentication

- Uses Supabase Auth for the Next.js frontend (`web/`)
- Backend uses session-based auth with Express

## Key Files

- `web/middleware.ts` - Auth middleware for protected routes
- `backend/server.mjs` - Main API server
- `backend/validation.mjs` - Request validation schemas
- `src/context/AuthContext.tsx` - Auth context for Vite frontend

## Environment Variables

Required in `backend/.env.local`:
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Set to 'development' for local dev

**Note**: Use `PGSSLMODE=disable` when running locally if you get SSL connection errors with Supabase pooler.

## Testing

Tests use Vitest with @testing-library/react. See `vitest.config.ts` and `src/test/setup.ts`.

Run tests:
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```
