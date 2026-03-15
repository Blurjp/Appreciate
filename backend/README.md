# Appreciate Backend API

Production-ready Express + Prisma + TypeScript backend running on Railway with Supabase PostgreSQL.

## 🏗️ Architecture

```
Client (Web/iOS)
    ↓
Railway Backend API (Express)
    ↓
Supabase PostgreSQL Database
```

## 🚀 Features

- ✅ **Google OAuth** - Secure authentication
- ✅ **JWT Tokens** - Stateless authentication
- ✅ **Prisma ORM** - Type-safe database access
- ✅ **Zod Validation** - Request validation
- ✅ **Rate Limiting** - DDoS protection
- ✅ **Error Handling** - Comprehensive error management
- ✅ **TypeScript** - Full type safety

## 📦 Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** JWT + Google OAuth
- **Validation:** Zod
- **Language:** TypeScript

## 🔧 Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account

### Setup

1. **Clone and install**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase database URL
   ```

3. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

4. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Database Commands

```bash
# View database in Prisma Studio
npm run prisma:studio

# Create a migration
npm run prisma:migrate

# Deploy migrations
npm run prisma:deploy

# Seed database
npm run prisma:seed
```

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Posts
- `GET /api/posts` - Get feed (paginated)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/heart` - Toggle heart

### Streak
- `GET /api/streak` - Get user streak data

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/posts` - Get user's posts

## 🚢 Deployment (Railway)

### Option 1: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Connect Railway to GitHub repo
3. Configure environment variables
4. Deploy automatically on push

### Environment Variables (Railway)

Set these in Railway Dashboard:

```bash
DATABASE_URL=<from-supabase>
JWT_SECRET=<generate-secure-secret>
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

## 🔐 Authentication Flow

### Email/Password

1. User registers with email/password
2. Password hashed with bcrypt
3. User created in database
4. JWT token generated
5. Token returned to client

### Google OAuth

1. User clicks "Sign in with Google"
2. Frontend gets Google ID token
3. Backend verifies token with Google
4. User created/retrieved from database
5. JWT token generated
6. Token returned to client

## 📊 Database Schema

### Profiles
```prisma
- id (UUID, PK)
- email (String, unique)
- name (String)
- avatarUrl (String?)
- createdAt (DateTime)
```

### GratitudePosts
```prisma
- id (UUID, PK)
- content (Text)
- category (Enum)
- visibility (Enum)
- photoUrl (String?)
- authorId (UUID, FK)
- heartCount (Int)
- createdAt (DateTime)
```

### StreakData
```prisma
- id (UUID, PK)
- userId (UUID, FK)
- currentStreak (Int)
- longestStreak (Int)
- lastPostDate (Date?)
- totalPosts (Int)
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run migrations
- `npm run prisma:studio` - Open Prisma Studio

## 🔍 Health Check

```bash
curl https://your-api.railway.app/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-15T22:00:00.000Z",
  "uptime": 3600
}
```

## 🚨 Error Handling

All errors follow this format:

```json
{
  "error": "ErrorType",
  "message": "Human-readable message",
  "details": {}
}
```

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Railway Docs](https://docs.railway.app/)
- [Supabase Docs](https://supabase.com/docs)

## 📄 License

MIT

---

**Built with ❤️ for Appreciate**
