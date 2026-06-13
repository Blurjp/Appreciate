# Phase 2 Plan — Appreciate

## Overview

Phase 1 shipped: simplified creation flow, 5 wall themes, feed with hearts, share cards, Stripe Pro subscriptions. Phase 2 focuses on unlocking the card designer (already built but not surfaced), fixing technical debt, and polishing the experience.

---

## A. Card Designer Integration ~~[ ]~~ -> [x]

- [x] Add "Design Card" button to `CreatePostForm` post-submission confirmation overlay (private posts)
- [x] Add "Design a Beautiful Card" button to `PostSharePrompt` (public posts)
- [x] Wire `AppreciationCardGenerator` as a dynamic modal triggered from both flows
- [ ] Photo upload: connect to `/api/uploads/post-image` endpoint for S3/storage upload
- [ ] AI Remix: verify Runware API key is configured in production
- [ ] PNG export via `html2canvas` — verify it works on mobile Safari

---

## B. Pro Monetization Polish

Stripe checkout and portal are implemented. Test-mode bypass is active (no `STRIPE_SECRET_KEY` → auto-grants Pro).

- [x] Fix `handleUpgrade` stuck "Redirecting..." — added `res.ok` check in settings page
- [x] Fix `handleManageSubscription` same issue
- [x] AI Remix already shows `UpgradeModal` for non-Pro users in `AppreciationCardGenerator`
- [ ] Configure `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` in production env
- [ ] Test full checkout → webhook → `is_pro` update flow end-to-end
- [ ] Consider free tier limits (e.g., N card exports per month) — currently unlimited for all

---

## C. Timezone Accuracy ~~[ ]~~ -> [x]

- [x] Pass client timezone from browser via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- [x] Move `todayCount` calculation to client component (`FeedHeader` in `feed-client.tsx`)
- [x] Pass `tz` query param to `/api/streak` from `useStreak` hook
- [x] Fix `fetchWeekActivity` in `lib/db/streak.ts` — convert UTC dates to user's local timezone before comparing
- [x] Fix `fetchStreak` signature to accept optional `tz` parameter

---

## D. Heart Toggle Atomicity ~~[ ]~~ -> [x]

- [x] Deploy `toggle_heart()` PostgreSQL function
- [x] Replace 3-call JS implementation with single `supabase.rpc('toggle_heart', ...)`
- [ ] Add optimistic UI update for heart toggle (rollback on error)

---

## E. DB Cleanup: Rename `glass` → `sticky-notes` ~~[ ]~~ -> [x]

- [x] Update DB constraint: `valid_wall_theme` now allows `'sticky-notes'`, not `'glass'`
- [x] Migrate existing data: `UPDATE profiles SET wall_theme = 'sticky-notes' WHERE wall_theme = 'glass'`
- [x] Remove `DB_THEME_MAP` / `RENDER_TO_DB` from `ThemeContext.tsx`
- [x] Remove `dbId` / `dbToRender` from `ThemePicker.tsx`
- [x] Remove glass mapping from `my-wall/page.tsx` `ExactWallEmbed`
- [x] Remove glass fallback from `tree/[userId]/page.tsx`
- [x] Remove `'glass'` from `StreakCard.tsx` theme check
- [x] Remove `'glass'` from `settings/page.tsx` theme emoji/label maps
- [x] Simplify CSS: `[data-theme="glass"], [data-theme="sticky-notes"]` → just `[data-theme="sticky-notes"]`
- [x] Remove `applyTheme` glass→sticky-notes mapping in `ThemeContext`

---

## F. Next.js 16 Upgrade ~~[ ]~~ -> [x] (already done)

- [x] Project already on Next.js 16.2.0 + React 19
- [x] All `searchParams` usage is correct (API routes use `req.url`, pages use `useSearchParams` hook)
- [x] Middleware is fine as `middleware.ts` (not renamed to `proxy.ts` — that was not a real requirement)

---

## G. Polish & UX

- [ ] Add pull-to-refresh on feed and My Wall (mobile)
- [x] Skeleton loading states already exist for wall embed and feed
- [ ] Empty state illustrations for feed (no public posts yet)
- [ ] Haptic feedback on heart toggle (mobile, `navigator.vibrate`)
- [ ] Share card OG image — verify `opengraph-image.tsx` renders correctly on all platforms

---

## Bug Fixes (from Phase 2 batch)

- [x] ThemePicker revert shows wrong theme on error — map through `currentTheme` before reverting
- [x] UpgradeModal stuck "Redirecting..." — check `res.ok`, handle missing URL, show error message
- [x] ShareLinkActions clipboard crash — wrap `navigator.clipboard.writeText` in try/catch
- [x] useUpdatePost missing `my-wall-all` and `feed` invalidation
- [x] useToggleHeart missing `my-wall-all` and `feed` invalidation
- [x] handleEditSave premature toast — moved to mutation `onSuccess`
- [x] handleToggleVisibility premature toast — moved to mutation `onSuccess`
- [x] PATCH /api/user can't clear name — `if (body.name)` → `if ('name' in body)`
- [x] Stripe webhook deleted customer — check `customer.deleted` before accessing metadata
- [x] Settings page glass theme references — removed `'glass'` from emoji/label maps

---

## Remaining Work (Phase 3)

- Photo upload in card designer (S3/storage integration)
- Optimistic heart toggle UI
- Pull-to-refresh on mobile
- Haptic feedback
- OG image verification across platforms
- Free tier limits for monetization
