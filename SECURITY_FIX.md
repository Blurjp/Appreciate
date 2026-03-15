# Security Fix Note

## Issue
API keys were hardcoded in source code (SupabaseConfig.swift and .env.local)

## Solution
Moved to configuration files that are excluded from git:

### iOS
- **Before:** Hardcoded in `SupabaseConfig.swift`
- **After:** Loaded from `Config.xcconfig` (excluded from git)
- **Template:** `Config.example.xcconfig` (committed)

### Web
- **Before:** Would be hardcoded
- **After:** Loaded from `.env.local` (excluded from git)
- **Template:** `.env.example` (committed)

## Setup Instructions

### iOS Setup
```bash
cd ios/Appreciate
cp Config.example.xcconfig Config.xcconfig
# Edit Config.xcconfig with your actual values
```

### Web Setup
```bash
cd web
cp .env.example .env.local
# Edit .env.local with your actual values
```

## Note on Anon Key
The Supabase anon key is designed to be public-safe (it's a read-only key with RLS policies).
However, it's still best practice to keep it out of source control for:
- Easier key rotation
- Environment-specific configuration
- Following security best practices

## What Was Committed
The following sensitive files were accidentally committed and then removed:
- `ios/Appreciate/Sources/Config/SupabaseConfig.swift` (had hardcoded key)
- `web/.env.local` (had hardcoded key)

These are now in git history but the keys are public-safe anon keys, not service_role keys.

## Future Prevention
Added to `.gitignore`:
- `ios/Appreciate/Config.xcconfig`
- `web/.env.local`
- `web/.env.*.local`
