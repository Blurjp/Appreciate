# Railway + Postgres Setup

## Services

Create two Railway services:

1. `appreciate-web` using this repo
2. `Postgres` using Railway's database template

Railway will expose `DATABASE_URL` from the Postgres service. Attach that variable to `appreciate-web`.

## Required Variables

Set these on the web service:

- `DATABASE_URL` - provided by Railway Postgres
- `PORT` - Railway sets this automatically
- `NODE_ENV=production`
- `APP_ENV=production`
- `PGSSLMODE=disable` only if you are connecting to a local Postgres instead of Railway

## First Deploy

Run migrations:

```bash
npm run db:migrate
```

Seed demo data:

```bash
npm run db:seed
```

Optional smoke check:

```bash
npm run db:smoke
```

Seed verification check:

```bash
npm run db:verify
```

Then start the service:

```bash
npm run start
```

## Demo Accounts

- `maya@appreciation.dev` / `maya1234`
- `alina@appreciation.dev` / `alina1234`

## Recommended Railway Flow

- Build command: `npm install && npm run build`
- Start command: `npm run start`
- After attaching Postgres, run `npm run db:migrate` and `npm run db:seed` once from the Railway shell

## Notes

- The frontend calls `/api/*` through the Vite proxy locally and same-origin routes in production.
- Session state is stored in Postgres via `session_token`.
- Mutating requests require the server-issued CSRF token returned by login or bootstrap.
- `POST /api/admin/reset-demo` is available only outside production and only for moderator sessions.
- Startup now fails early with clear errors if `DATABASE_URL` or `PORT` is invalid.
- Login, reporting, and demo reset actions now have server-side rate limits.
- Audit events are persisted in `audit_log` for auth, moderation, and demo reset actions.
