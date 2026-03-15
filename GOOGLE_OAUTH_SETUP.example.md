# Google OAuth Setup Guide

## Overview
This project uses Google OAuth for authentication. Follow these steps to set it up.

## Google Cloud Console Setup

### Step 1: Create Google Cloud Project
1. Visit: https://console.cloud.google.com/
2. Create a new project or use existing one

### Step 2: Create OAuth Clients

#### Web App Client
1. Go to APIs & Services → Credentials
2. Click "Create credentials" → "OAuth client ID"
3. Select "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - Your production URL
5. Add authorized redirect URIs:
   - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

#### iOS App Client
1. Click "Create credentials" → "OAuth client ID"
2. Select "iOS"
3. Enter your Bundle ID (e.g., `com.appreciate.app`)

### Step 3: Configure Supabase
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Enter your Google OAuth Client ID and Client Secret
4. Save

## Configuration Files

### Web App
Create `web/.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

### iOS App
Add to `ios/Appreciate/Config.xcconfig`:
```
GOOGLE_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_URL_SCHEME=com.googleusercontent.apps.your-ios-client-id
```

And configure Info.plist:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.your-ios-client-id</string>
        </array>
    </dict>
</array>
```

## Testing
1. Web: Click "Continue with Google" on the login page
2. iOS: Run app and tap Google Sign-in button

## Troubleshooting
- **"Access blocked"**: Configure OAuth consent screen and add test users
- **"Redirect URI mismatch"**: Check authorized redirect URIs in Google Cloud Console
- **iOS login fails**: Verify Info.plist URL scheme configuration

## Resources
- [Supabase Google Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Sign-In for Web](https://developers.google.com/identity/gsi/web/guides/overview)
- [Google Sign-In for iOS](https://developers.google.com/identity/sign-in/ios/start-integrating)

---

**Note:** Keep your OAuth credentials secure and never commit them to git!
