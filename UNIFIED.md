# Appreciate - 统一开发指南

## 🎯 目标

iOS 和 Web 版本在**功能、界面、数据模型**上完全统一，用户在不同平台获得一致体验。

---

## 📱 + 🌐 平台对照表

| 功能模块 | iOS 实现 | Web 实现 | 状态 |
|---------|---------|---------|------|
| **数据模型** | SwiftData Models | Prisma Schema | ✅ 统一 |
| **用户认证** | Sign in with Apple | NextAuth.js | ⏳ 进行中 |
| **创建笔记** | CreatePostView (3步向导) | CreatePostForm | ⏳ 进行中 |
| **我的墙** | MyWallView | /my-wall | ⏳ 进行中 |
| **公开 Feed** | FeedView | /feed | ⏳ 进行中 |
| **打卡统计** | StreakService | API + React Query | ⏳ 进行中 |
| **分类过滤** | CategoryFilterBar | CategoryFilterBar | ⏳ 进行中 |
| **匿名模式** | PostVisibility enum | PostVisibility enum | ✅ 统一 |
| **确认动画** | ConfirmationOverlay | ConfirmationOverlay | ⏳ 进行中 |

---

## 🎨 统一设计系统

### 颜色

```swift
// iOS (AppTheme.swift)
static let primary = Color(hex: "FF6B6B")      // 温暖珊瑚色
static let secondary = Color(hex: "4ECDC4")   // 蓝绿色
static let background = Color(hex: "F7F7F7")  // 浅灰背景
static let text = Color(hex: "2C3E50")        // 深灰文字
static let warmGold = Color(hex: "FFB84D")    // 暖金色
```

```typescript
// Web (tailwind.config.ts)
colors: {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#F7F7F7',
  text: '#2C3E50',
  warmGold: '#FFB84D',
}
```

### 字体

| 样式 | iOS | Web (Tailwind) |
|------|-----|---------------|
| **标题** | 28px Bold | `text-3xl font-bold` |
| **副标题** | 22px Semibold | `text-2xl font-semibold` |
| **正文** | 16px Regular | `text-base` |
| **说明** | 14px Light | `text-sm font-light` |

### 间距

| 名称 | 值 | iOS | Web |
|------|----|----|-----|
| XS | 4px | `spacingXS` | `gap-1` |
| S | 8px | `spacingS` | `gap-2` |
| M | 16px | `spacingM` | `gap-4` |
| L | 24px | `spacingL` | `gap-6` |
| XL | 32px | `spacingXL` | `gap-8` |

---

## 📊 统一数据模型

### User (用户)

```swift
// iOS
@Model
final class UserProfile {
    var id: String
    var email: String
    var name: String
    var avatarURL: URL?
    var createdAt: Date
}
```

```prisma
// Web (Prisma)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatarUrl String?
  createdAt DateTime @default(now())
}
```

### GratitudePost (感恩笔记)

```swift
// iOS
@Model
final class GratitudePost {
    var id: UUID
    var content: String
    var feeling: String
    var category: GratitudeCategory
    var visibility: PostVisibility
    var photoData: Data?
    var authorId: String
    var authorName: String
    var createdAt: Date
    var heartCount: Int
}
```

```prisma
// Web
model GratitudePost {
  id         String           @id @default(cuid())
  content    String
  feeling    String?
  category   GratitudeCategory
  visibility PostVisibility
  photoUrl   String?
  authorId   String
  author     User             @relation(fields: [authorId], references: [id])
  createdAt  DateTime         @default(now())
  heartCount Int              @default(0)
}
```

### 枚举类型

```swift
// iOS
enum GratitudeCategory: String, Codable {
    case family = "Family"
    case work = "Work"
    case smallJoys = "Small Joys"
    case nature = "Nature"
    case health = "Health"
    case other = "Other"
}

enum PostVisibility: String, Codable {
    case privatePost = "private"
    case publicPost = "public"
    case anonymousPublic = "anonymous"
}
```

```prisma
// Web
enum GratitudeCategory {
  FAMILY
  WORK
  SMALL_JOYS
  NATURE
  HEALTH
  OTHER
}

enum PostVisibility {
  PRIVATE
  PUBLIC
  ANONYMOUS
}
```

---

## 🔄 统一用户流程

### 创建感恩笔记（3步向导）

**Step 1: 内容输入**
- iOS: `Step1ContentView` (TextField + PhotoPicker)
- Web: `<Step1Content />` (Textarea + File Upload)

**Step 2: 分类选择**
- iOS: `Step2CategoryView` (6个分类按钮)
- Web: `<Step2Category />` (相同样式按钮)

**Step 3: 隐私设置**
- iOS: `Step3VisibilityView` (3个选项)
- Web: `<Step3Visibility />` (相同样式)

**完成确认:**
- iOS: `ConfirmationOverlay` (显示 "Beautiful! You just shared light 💫")
- Web: `<ConfirmationOverlay />` (相同动画和文字)

### 打卡统计

**显示逻辑:**
- 计算连续天数
- 显示火焰图标 🔥
- 记录最长连续天数
- 鼓励语: "You've posted X days in a row!"

**iOS:**
```swift
struct StreakCard: View {
    let currentStreak: Int
    let longestStreak: Int
}
```

**Web:**
```tsx
export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  // 相同 UI 结构
}
```

---

## 🚀 开发工作流

### 1. 功能开发顺序

```
Week 1: 核心数据模型 + 认证
├── iOS: SwiftData models + Sign in with Apple
└── Web: Prisma schema + NextAuth

Week 2: 创建笔记流程
├── iOS: CreatePostView (3步向导)
└── Web: CreatePostForm (相同流程)

Week 3: Feed 和 我的墙
├── iOS: FeedView + MyWallView
└── Web: /feed + /my-wall

Week 4: 打卡统计 + 优化
├── iOS: StreakService + 动画
└── Web: Streak API + Framer Motion
```

### 2. 同步检查清单

**每次提交前检查:**
- [ ] iOS 和 Web 的数据模型是否一致？
- [ ] 颜色/字体是否使用统一设计系统？
- [ ] 功能是否在两个平台都实现？
- [ ] 用户流程是否相同？

### 3. 测试策略

**跨平台测试:**
1. 在 iOS 创建笔记 → Web 应该能看到
2. 在 Web 设置隐私 → iOS 应该同步
3. 打卡统计应该一致
4. 分类过滤应该工作相同

---

## 📦 项目结构

```
appreciate/
├── ios/                    # iOS SwiftUI App
│   ├── Appreciate.xcodeproj
│   └── Appreciate/
│       ├── Sources/
│       │   ├── Models/
│       │   ├── Views/
│       │   ├── ViewModels/
│       │   └── Services/
│       └── Resources/
│
├── web/                    # Next.js Web App
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── prisma/
│
├── docs/
│   ├── DESIGN.md          # 产品设计文档
│   └── UNIFIED.md         # 本文档
│
└── README.md
```

---

## 🎯 成功标准

### 功能一致性
- ✅ 所有8个核心功能在两个平台都可用
- ✅ 用户流程完全相同
- ✅ 数据模型一致

### 视觉一致性
- ✅ 相同的颜色方案
- ✅ 相同的字体大小/权重
- ✅ 相同的间距和布局
- ✅ 相同的动画效果

### 用户体验
- ✅ 用户在任一平台都能无缝使用
- ✅ 学习一个平台后，另一个平台无需重新学习
- ✅ 数据在平台间同步（未来：云同步）

---

## 📝 更新日志

### 2026-03-14
- ✅ 创建 UNIFIED.md
- ⏳ iOS 基础结构完成（28个文件）
- ⏳ Web 开发进行中

---

## 🔗 相关文档

- [产品设计文档](./DESIGN.md)
- [iOS README](../ios/README.md)
- [Web README](../web/README.md) (待创建)

---

**维护者:** blurjp  
**最后更新:** 2026-03-14
