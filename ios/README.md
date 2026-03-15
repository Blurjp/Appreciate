# Appreciate — iOS App

Native iOS gratitude journaling app built with SwiftUI, powered by Supabase backend.

## Quick Start

1. Install [XcodeGen](https://github.com/yonaskolb/XcodeGen): `brew install xcodegen`
2. Generate the Xcode project: `xcodegen generate`
3. Open `Appreciate.xcodeproj` in Xcode
4. Resolve Swift packages (Xcode will do this automatically)
5. Update `Sources/Config/SupabaseConfig.swift` with your Supabase credentials
6. Build and run on simulator or device

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `SUPABASE_SETUP.md` in the SQL Editor
3. Get your credentials from **Settings > API** in the Supabase dashboard
4. Update `SupabaseConfig.swift`:

```swift
enum SupabaseConfig {
    static let supabaseURL = URL(string: "https://your-project.supabase.co")!
    static let supabaseAnonKey = "your-anon-key"
}
```

### How Auth Works
1. User taps "Sign in with Apple"
2. iOS gets an Apple identity token via AuthenticationServices
3. Token is sent to Supabase Auth via `signInWithIdToken`
4. Supabase verifies the token and creates/finds the user in `auth.users`
5. A database trigger creates a profile in `public.profiles`
6. The Supabase SDK stores the session and auto-refreshes tokens

### How RLS Works
- Every Supabase request includes the user's JWT automatically
- The database's Row Level Security policies control access:
  - Users see their own posts + public/anonymous posts
  - Users can only modify their own posts
  - Streak data is private to each user

## Tech Stack

- **UI:** SwiftUI + iOS 17+
- **Data:** SwiftData (local cache) + Supabase (remote)
- **Auth:** Supabase Auth (Sign in with Apple)
- **Architecture:** MVVM
- **Package Manager:** Swift Package Manager (via XcodeGen)

## Dependencies

- [supabase-swift](https://github.com/supabase/supabase-swift) v2.0+ — Supabase client SDK

## Project Structure

```
ios/
├── project.yml                    # XcodeGen configuration
└── Appreciate/
    └── Sources/
        ├── App/
        │   ├── AppreciateApp.swift     # Entry point
        │   ├── RootView.swift          # Auth routing
        │   └── MainTabView.swift       # Tab navigation
        ├── Config/
        │   └── SupabaseConfig.swift    # Supabase URL and keys
        ├── Models/
        │   ├── GratitudePost.swift     # Post model + Supabase DTOs
        │   ├── UserProfile.swift       # Profile model + DTO
        │   └── StreakData.swift        # Streak model + DTO
        ├── Services/
        │   ├── SupabaseService.swift   # Singleton Supabase client
        │   ├── AuthService.swift       # Auth via Supabase
        │   ├── PostService.swift       # CRUD via Supabase
        │   └── StreakService.swift      # Streak fetch via Supabase
        ├── ViewModels/
        │   ├── AuthViewModel.swift
        │   ├── FeedViewModel.swift
        │   ├── MyWallViewModel.swift
        │   └── CreatePostViewModel.swift
        ├── Views/
        │   ├── Auth/
        │   ├── Feed/
        │   ├── MyWall/
        │   ├── CreatePost/
        │   ├── Settings/
        │   ├── Onboarding/
        │   └── Components/
        ├── Theme/
        │   └── AppTheme.swift
        └── Extensions/
            └── HapticFeedback.swift
```

## Migration Notes

The app was migrated from local-only SwiftData to Supabase backend:
- Services no longer take `ModelContext` — they use `SupabaseService.shared`
- All CRUD operations are async (services use `async throws`)
- ViewModels now handle async calls via `Task { }` blocks
- Enum raw values changed to match Supabase: `FAMILY`, `PUBLIC`, etc.
- SwiftData models are kept for potential offline caching
- Streak calculation is handled server-side by a database trigger
