# Appreciate - Social Appreciation Platform

> Making the world a more appreciative place, one note at a time. 🙏

## Project Overview

**Appreciate** is a social platform for recognizing and appreciating acts of kindness. Built **iOS-first** with SwiftUI.

---

## 📱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **iOS** | Swift 5.9 + SwiftUI + iOS 17+ |
| **Backend** | Vapor (Swift) / Node.js |
| **Database** | PostgreSQL + Redis |
| **Auth** | Firebase Auth / Auth0 |
| **Payments** | Apple Pay + Stripe |
| **Push** | APNs / Firebase |
| **Cloud** | AWS / GCP |

---

## 🏗️ iOS Architecture

```
AppreciateApp/
├── App/
│   ├── AppreciateApp.swift          # App entry point
│   └── AppDelegate.swift            # App lifecycle
├── Models/                          # Data models
│   ├── User.swift
│   ├── Appreciation.swift
│   ├── Gift.swift
│   └── Workspace.swift
├── ViewModels/                      # MVVM pattern
│   ├── FeedViewModel.swift
│   ├── WallViewModel.swift
│   └── SendAppreciationViewModel.swift
├── Views/                           # SwiftUI views
│   ├── Feed/
│   │   ├── FeedView.swift
│   │   └── FeedCardView.swift
│   ├── Wall/
│   │   ├── WallView.swift
│   │   └── WallHeaderView.swift
│   ├── Send/
│   │   ├── SendAppreciationView.swift
│   │   └── GiftSelectionView.swift
│   ├── Profile/
│   │   └── ProfileView.swift
│   └── Components/
│       ├── AppreciationCard.swift
│       └── GiftBadge.swift
├── Services/                        # API & business logic
│   ├── APIClient.swift
│   ├── AuthService.swift
│   ├── PaymentService.swift
│   └── PushNotificationService.swift
├── Networking/
│   ├── Endpoints.swift
│   └── NetworkManager.swift
├── Storage/
│   ├── CoreDataStack.swift
│   └── KeychainManager.swift
├── Utils/
│   ├── Extensions/
│   └── Helpers/
└── Resources/
    ├── Assets.xcassets
    └── Localizable.strings
```

---

## 🎯 Core Features (iOS)

### Phase 1: MVP
- [ ] User authentication (Sign in with Apple)
- [ ] Send appreciation to anyone
- [ ] Personal appreciation wall
- [ ] Public daily feed
- [ ] Anonymous mode

### Phase 2: Monetization
- [ ] Apple Pay integration
- [ ] Gift cards (in-app purchase)
- [ ] Premium subscription (StoreKit 2)

### Phase 3: Enterprise
- [ ] Workspace creation
- [ ] Team management
- [ ] Admin dashboard

---

## 📋 Data Models (Swift)

### User
```swift
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let avatarURL: URL?
    let wallSlug: String
    let createdAt: Date
    let appreciationCount: Int
    let giftCount: Int
}
```

### Appreciation
```swift
struct Appreciation: Codable, Identifiable {
    let id: String
    let fromUserId: String?
    let toUserId: String
    let content: String
    let isAnonymous: Bool
    let isPublic: Bool
    let gift: Gift?
    let likeCount: Int
    let createdAt: Date
}
```

### Gift
```swift
struct Gift: Codable, Identifiable {
    let id: String
    let type: GiftType
    let amount: Decimal
    let currency: String
    let status: GiftStatus
    
    enum GiftType: String, Codable {
        case venmo = "venmo"
        case starbucks = "starbucks"
        case amazon = "amazon"
        case applePay = "apple_pay"
    }
    
    enum GiftStatus: String, Codable {
        case pending = "pending"
        case sent = "sent"
        case claimed = "claimed"
    }
}
```

---

## 🎨 Design System

### Colors
```swift
extension Color {
    static let appreciatePrimary = Color(hex: "FF6B6B")
    static let appreciateSecondary = Color(hex: "4ECDC4")
    static let appreciateBackground = Color(hex: "F7F7F7")
    static let appreciateCard = Color.white
    static let appreciateText = Color(hex: "2C3E50")
}
```

### Typography
```swift
extension Font {
    static let appreciateTitle = Font.system(size: 28, weight: .bold)
    static let appreciateHeading = Font.system(size: 22, weight: .semibold)
    static let appreciateBody = Font.system(size: 16, weight: .regular)
    static let appreciateCaption = Font.system(size: 14, weight: .light)
}
```

---

## 🔗 API Endpoints

### Base URL
```
Production: https://api.appreciate.app/v1
Staging: https://api-staging.appreciate.app/v1
```

### Endpoints
```
POST   /auth/apple-sign-in              - Sign in with Apple
GET    /users/me                        - Get current user
GET    /users/:id/wall                  - Get user's wall
GET    /feed/public                     - Public feed
POST   /appreciations                   - Create appreciation
GET    /appreciations/:id               - Get appreciation
POST   /appreciations/:id/like          - Like appreciation
POST   /gifts                           - Send gift
GET    /workspaces                      - List workspaces
POST   /workspaces                      - Create workspace
```

---

## 💰 Monetization (iOS)

### In-App Purchases (StoreKit 2)
```swift
enum SubscriptionProduct: String, CaseIterable {
    case premium = "com.appreciate.premium.monthly"
    case pro = "com.appreciate.pro.monthly"
}

enum GiftProduct: String, CaseIterable {
    case starbucks5 = "com.appreciate.gift.starbucks.5"
    case starbucks10 = "com.appreciate.gift.starbucks.10"
    case amazon10 = "com.appreciate.gift.amazon.10"
    case amazon25 = "com.appreciate.gift.amazon.25"
}
```

### Pricing
| Product | Price |
|---------|-------|
| Premium Monthly | $4.99 |
| Pro Monthly | $9.99 |
| Starbucks $5 | $5.00 |
| Starbucks $10 | $10.00 |
| Amazon $10 | $10.00 |
| Amazon $25 | $25.00 |

---

## 🔐 Security (iOS)

### Keychain Storage
```swift
// Store sensitive data in Keychain
enum KeychainKey {
    static let accessToken = "access_token"
    static let refreshToken = "refresh_token"
    static let userId = "user_id"
}
```

### Privacy
- Sign in with Apple (privacy-focused)
- Anonymous mode for appreciations
- Local data encryption
- Secure API communication (TLS 1.3)

---

## 📦 Dependencies

### Swift Package Manager
```swift
dependencies: [
    .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0"),
    .package(url: "https://github.com/SnapKit/SnapKit.git", from: "5.6.0"),
    .package(url: "https://github.com/onevcat/Kingfisher.git", from: "7.10.0"),
    .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "10.0.0"),
]
```

---

## 🚀 Getting Started

### Prerequisites
- Xcode 15+
- iOS 17+ SDK
- Swift 5.9+
- CocoaPods or SPM

### Setup
```bash
# Clone repo
git clone https://github.com/blurjp/appreciate-ios.git

# Open in Xcode
cd appreciate-ios
open Appreciate.xcodeproj

# Install dependencies
swift package resolve

# Configure Firebase
# Download GoogleService-Info.plist from Firebase console
# Add to project
```

---

## 📊 Success Metrics

| Metric | Target (Year 1) |
|--------|-----------------|
| **MAU** | 100,000 |
| **Appreciations Sent** | 1,000,000 |
| **IAP Revenue** | $500,000 |
| **App Store Rating** | 4.7+ ⭐ |

---

## 🗓️ Roadmap

### Q2 2026 (MVP)
- [ ] iOS app (SwiftUI)
- [ ] Basic appreciation flow
- [ ] Personal wall
- [ ] Public feed

### Q3 2026 (Monetization)
- [ ] Apple Pay
- [ ] In-app purchases
- [ ] Premium subscriptions

### Q4 2026 (Enterprise)
- [ ] Workspace features
- [ ] Admin dashboard
- [ ] Team analytics

---

## 📞 Contact

**Project Lead:** blurjp  
**Email:** blurjp@gmail.com  
**Start Date:** March 13, 2026
