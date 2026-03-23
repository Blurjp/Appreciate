# Next.js Upgrade Plan: 14.2.15 → 16.2.0

## 🎯 Upgrade Overview

**Current Versions:**
- Next.js: 14.2.15
- React: 18.3.1
- React DOM: 18.3.1

**Target Versions:**
- Next.js: 16.2.0 (latest stable)
- React: 19.2.4 (latest stable)
- React DOM: 19.2.4 (latest stable)

## ⚠️ Breaking Changes to Address

### 1. **Async searchParams** (Critical)
Next.js 16 requires `searchParams` to be awaited:

**Before:**
```ts
interface PageProps {
  searchParams: { category?: string }
}
export default function Page({ searchParams }: PageProps) {
  const category = searchParams.category
  // ...
}
```

**After:**
```ts
interface PageProps {
  searchParams: Promise<{ category?: string }>
}
export default async function Page({ searchParams }: PageProps) {
  const { category } = await searchParams
  // ...
}
```

### 2. **Supabase Dependencies**
Need to upgrade:
- `@supabase/supabase-js`: ^2.45.0 → ^2.97.0+
- `@supabase/ssr`: ^0.5.0 → Check latest
- `@supabase/auth-helpers-nextjs`: ^0.10.0 → May need replacement

### 3. **Middleware → Proxy**
- Next.js 16 renames `middleware.ts` → `proxy.ts`
- Slight API changes

### 4. **React 19 Changes**
- Updated TypeScript types
- JSX Transform changes (handled automatically)

## 📋 Files Using searchParams

Need to update these 6 files:
1. ✅ `app/(main)/feed/page.tsx` - ALREADY UPDATED (uses Promise)
2. ⚠️ `app/(auth)/welcome/page.tsx` - NEEDS UPDATE
3. ⚠️ `app/auth/callback/route.ts` - NEEDS UPDATE
4. ⚠️ `app/(main)/settings/page.tsx` - NEEDS UPDATE
5. ⚠️ `app/api/posts/route.ts` - NEEDS UPDATE
6. ⚠️ `app/api/my-wall/route.ts` - NEEDS UPDATE

## 🔄 Upgrade Steps

### Step 1: Update Dependencies
```bash
npm install next@16.2.0 react@19.2.4 react-dom@19.2.4
npm install @types/react@^19.0.0 @types/react-dom@^19.0.0 --save-dev
npm install @next/bundle-analyzer@16.2.0 --save-dev
```

### Step 2: Update Supabase Dependencies
```bash
npm install @supabase/supabase-js@^2.97.0
npm install @supabase/ssr@latest
```

### Step 3: Update TypeScript Config
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"]
  }
}
```

### Step 4: Fix searchParams Files
Update each file to use `await searchParams`

### Step 5: Rename Middleware (if exists)
```bash
mv app/middleware.ts app/proxy.ts
```

### Step 6: Test Build
```bash
npm run build
```

## 🚨 Rollback Plan

If upgrade fails:
```bash
# Revert to previous versions
npm install next@14.2.15 react@18.3.1 react-dom@18.3.1
npm install @types/react@^18.0.0 @types/react-dom@^18.0.0 --save-dev
git checkout package.json package-lock.json
```

## 📊 Expected Benefits

- **50% faster server startup** (Turbopack improvements)
- **30% faster builds** (better caching)
- **Better React 19 performance**
- **Improved TypeScript support**
- **Better error messages**

## ⏱️ Estimated Time: 15-30 minutes
