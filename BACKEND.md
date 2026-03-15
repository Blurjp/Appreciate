# Appreciate - Backend 架构设计 (Railway + PostgreSQL)

## 🎯 架构概览

```
┌─────────────────────────────────────────────────────┐
│        Railway (Cloud Platform)                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │   Backend API (Node.js + Express)          │    │
│  │   • RESTful API                            │    │
│  │   • JWT Authentication                     │    │
│  │   • Rate Limiting                          │    │
│  │   • CORS configured                        │    │
│  └────────────────────────────────────────────┘    │
│                   ↕                                  │
│  ┌────────────────────────────────────────────┐    │
│  │   PostgreSQL Database                       │    │
│  │   • Prisma ORM                             │    │
│  │   • Connection pooling                     │    │
│  │   • Automatic backups                      │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │   Redis (Optional - Caching & Sessions)    │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
         ↑                        ↑
         │                        │
    ┌────┴─────┐            ┌────┴─────┐
    │ iOS App  │            │ Web App  │
    │URLSession│            │  Fetch   │
    └──────────┘            └──────────┘
```

---

## 💰 Railway 成本

### 免费额度
- $5/月 免费额度
- 512 MB RAM
- Shared CPU
- 1 GB 数据库存储
- 100 GB 出站流量

### 预计 MVP 使用量
- 后端 API: $3-5/月
- PostgreSQL: $1-2/月（1GB 内免费）
- **总计：免费额度内**

### Pro Plan ($20/月)
- 8 GB RAM
- 4 vCPU
- 100 GB 数据库
- 适合 10,000+ 用户

---

## 📁 Backend 项目结构

```
backend/
├── prisma/
│   ├── schema.prisma          # 数据库 schema
│   ├── migrations/             # 数据库迁移
│   └── seed.ts                 # 初始数据
│
├── src/
│   ├── index.ts                # 入口文件
│   ├── app.ts                  # Express app 配置
│   ├── config/
│   │   ├── database.ts         # Prisma client
│   │   ├── jwt.ts              # JWT 配置
│   │   └── cors.ts             # CORS 配置
│   │
│   ├── middleware/
│   │   ├── auth.ts             # JWT 验证
│   │   ├── errorHandler.ts     # 错误处理
│   │   ├── rateLimit.ts        # 速率限制
│   │   └── validate.ts         # 请求验证
│   │
│   ├── routes/
│   │   ├── auth.ts             # 认证路由
│   │   ├── posts.ts            # 笔记路由
│   │   ├── streak.ts           # 打卡路由
│   │   └── users.ts            # 用户路由
│   │
│   ├── services/
│   │   ├── authService.ts      # 认证逻辑
│   │   ├── postService.ts      # 笔记逻辑
│   │   └── streakService.ts    # 打卡计算
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript 类型
│   │
│   └── utils/
│       ├── jwt.ts              # JWT 工具
│       ├── validation.ts       # 验证工具
│       └── response.ts         # 响应格式化
│
├── .env                        # 环境变量
├── .env.example                # 环境变量示例
├── package.json
├── tsconfig.json
├── Dockerfile                  # Docker 配置
├── railway.toml                # Railway 配置
└── README.md
```

---

## 🗄️ 数据库 Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String?  // Hashed password
  avatarUrl String?
  provider  String   @default("email") // email, apple, google
  
  // Apple Sign In
  appleId   String?  @unique
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  posts     GratitudePost[]
  streak    StreakData?
  
  @@index([email])
  @@index([appleId])
}

model GratitudePost {
  id          String   @id @default(cuid())
  content     String   @db.Text
  feeling     String?  @db.Text
  category    String   // FAMILY, WORK, SMALL_JOYS, NATURE, HEALTH, OTHER
  visibility  String   // PRIVATE, PUBLIC, ANONYMOUS
  photoUrl    String?
  
  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  heartCount    Int     @default(0)
  isBookmarked  Boolean @default(false)
  
  @@index([authorId, createdAt(sort: Desc)])
  @@index([visibility, createdAt(sort: Desc)])
  @@index([category])
}

model StreakData {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  currentStreak Int       @default(0)
  longestStreak Int       @default(0)
  lastPostDate  DateTime? @db.Date
  totalPosts    Int       @default(0)
  
  updatedAt     DateTime  @updatedAt
}
```

---

## 🔌 API Endpoints

### Base URL
```
Production: https://appreciate-api.up.railway.app
Development: http://localhost:3001
```

### Authentication
```
POST   /api/v1/auth/register       - 注册新用户
POST   /api/v1/auth/login          - 登录
POST   /api/v1/auth/apple          - Sign in with Apple
POST   /api/v1/auth/refresh        - 刷新 token
POST   /api/v1/auth/logout         - 登出
GET    /api/v1/auth/me             - 获取当前用户信息
```

### Posts
```
GET    /api/v1/posts               - 获取公开 feed
  ?category=FAMILY                 - 按分类过滤
  ?page=1&limit=20                 - 分页
  
POST   /api/v1/posts               - 创建新笔记
GET    /api/v1/posts/:id           - 获取单条笔记
PATCH  /api/v1/posts/:id           - 更新笔记
DELETE /api/v1/posts/:id           - 删除笔记
POST   /api/v1/posts/:id/heart     - 点赞
```

### My Wall (需要认证)
```
GET    /api/v1/my-wall             - 获取当前用户的所有笔记
  ?visibility=PRIVATE              - 按可见性过滤
```

### Streak (需要认证)
```
GET    /api/v1/streak              - 获取打卡数据
```

### Users (需要认证)
```
GET    /api/v1/users/:id           - 获取用户公开信息
GET    /api/v1/users/:id/wall      - 获取用户公开墙
PATCH  /api/v1/users/profile       - 更新个人资料
```

---

## 🔐 认证流程

### 1. Email/Password 注册

```typescript
// Request
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxxx",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600
    }
  }
}
```

### 2. Sign in with Apple

```typescript
// iOS 客户端获取 identityToken 后发送到后端
POST /api/v1/auth/apple
{
  "identityToken": "eyJraWQiOiJ...",
  "user": {
    "email": "user@privaterelay.appleid.com",
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}

// Response (同上)
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

### 3. 使用 Access Token

```typescript
// 在所有需要认证的请求中添加 header
GET /api/v1/my-wall
Headers: {
  "Authorization": "Bearer eyJhbGc..."
}
```

---

## 🚀 Railway 部署步骤

### 1. 安装 Railway CLI

```bash
npm install -g @railway/cli
```

### 2. 登录 Railway

```bash
railway login
```

### 3. 创建新项目

```bash
cd backend
railway init
# 选择 "Empty Project"
# 命名为 "appreciate-api"
```

### 4. 添加 PostgreSQL

```bash
railway add --plugin postgresql
```

### 5. 配置环境变量

```bash
# 在 Railway Dashboard 中设置：
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
```

### 6. 部署

```bash
railway up
```

### 7. 运行数据库迁移

```bash
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### 8. 获取 URL

```bash
railway domain
# 输出: https://appreciate-api.up.railway.app
```

---

## 📱 iOS 集成

### 1. 创建 API Client

```swift
// Services/APIClient.swift
import Foundation

class APIClient {
    static let shared = APIClient()
    
    private let baseURL = "https://appreciate-api.up.railway.app/api/v1"
    private var accessToken: String?
    
    // 通用请求方法
    func request<T: Codable>(
        _ endpoint: String,
        method: String = "GET",
        body: Encodable? = nil
    ) async throws -> T {
        var request = URLRequest(url: URL(string: baseURL + endpoint)!)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(httpResponse.statusCode)
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

### 2. Sign in with Apple

```swift
// Services/AuthService.swift
import AuthenticationServices

@Observable
class AuthService {
    private let api = APIClient.shared
    var currentUser: User?
    var isAuthenticated = false
    
    // Sign in with Apple
    func signInWithApple(identityToken: String, user: ASAuthorizationAppleIDCredential) async throws {
        let request = AppleSignInRequest(
            identityToken: identityToken,
            user: AppleUser(
                email: user.email,
                name: AppleUserName(
                    firstName: user.fullName?.givenName,
                    lastName: user.fullName?.familyName
                )
            )
        )
        
        let response: AuthResponse = try await api.request(
            "/auth/apple",
            method: "POST",
            body: request
        )
        
        self.currentUser = response.user
        self.isAuthenticated = true
        KeychainManager.saveToken(response.tokens.accessToken)
    }
}
```

---

## 🌐 Web 集成

### 1. 更新 Next.js API Routes

```typescript
// lib/apiClient.ts
import { getSession } from 'next-auth/react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const session = await getSession()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}

// 使用示例
export function usePosts(category?: string) {
  return useQuery({
    queryKey: ['posts', category],
    queryFn: () => {
      const url = category ? `/posts?category=${category}` : '/posts'
      return apiRequest(url)
    },
  })
}
```

---

## 🧪 测试

### 单元测试

```bash
npm test
```

### API 测试

```bash
# 注册
curl -X POST https://appreciate-api.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# 登录
curl -X POST https://appreciate-api.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 获取 Feed
curl https://appreciate-api.up.railway.app/api/v1/posts

# 创建笔记 (需要 token)
curl -X POST https://appreciate-api.up.railway.app/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"Grateful for coffee today!","category":"SMALL_JOYS","visibility":"PUBLIC"}'
```

---

## 📊 监控和日志

### Railway Dashboard
- 实时日志
- CPU/内存使用
- 网络流量
- 自动重启

### 环境变量管理
- 生产/预览环境分离
- 安全存储敏感信息
- 轻松回滚

---

## 🔧 维护

### 数据库备份
Railway 自动每日备份（Pro Plan）

### 更新部署
```bash
git push
railway up
```

### 查看日志
```bash
railway logs
```

### 数据库迁移
```bash
# 创建迁移
npx prisma migrate dev --name describe_change

# 部署到生产
railway run npx prisma migrate deploy
```

---

## 📚 技术栈

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL 15
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Rate Limiting:** express-rate-limit

### Deployment
- **Platform:** Railway
- **CI/CD:** Railway auto-deploy
- **Monitoring:** Railway Dashboard

---

## 🚀 快速开始

```bash
# 1. 克隆项目
cd backend

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 4. 初始化数据库
npx prisma migrate dev
npx prisma db seed

# 5. 启动开发服务器
npm run dev

# 6. 部署到 Railway
railway up
```

---

**维护者:** blurjp  
**最后更新:** 2026-03-14
