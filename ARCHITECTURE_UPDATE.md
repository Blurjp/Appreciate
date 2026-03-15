# Appreciate 架构变更

## 新架构：Railway Backend + Supabase Database

### 架构对比

#### 之前：Supabase 全栈
```
iOS App ──┐
          ├── Supabase (Auth + DB + Storage)
Web App  ─┘
```

#### 现在：Railway Backend + Supabase DB
```
iOS App ──┐
          ├── Railway Backend (API + Auth) ──┐
Web App  ─┘                                  ├── Supabase PostgreSQL
                                             └── Supabase Storage
```

---

## 架构优势

### Railway Backend 优势
1. **完全控制** - 自定义 API 逻辑
2. **灵活性** - 可以添加任何后端功能
3. **AI 集成** - 内容审核更容易实现
4. **性能** - 可以优化查询和缓存

### Supabase Database 优势
1. **托管数据库** - 无需管理 PostgreSQL
2. **自动备份** - 数据安全
3. **连接池** - 性能优化
4. **RLS 可选** - 在后端处理权限

---

## 技术栈

### Backend (Railway)
- **Runtime:** Node.js / TypeScript
- **Framework:** Express / Fastify / NestJS
- **ORM:** Prisma (连接 Supabase PostgreSQL)
- **Auth:** JWT + Google OAuth
- **Validation:** Zod
- **API:** RESTful / GraphQL

### Database (Supabase)
- **PostgreSQL** - 主数据库
- **Storage** - 照片存储（可选）
- **Connection String** - 从 Railway 连接

### Frontend
- **Web:** Next.js 14 → Railway API
- **iOS:** SwiftUI → Railway API

---

## 数据库连接

### Supabase Connection String
```
postgresql://postgres.[password]@db.jkzqokejtraczcbgnjoh.supabase.co:5432/postgres
```

**注意：** 使用端口 `5432`（直接连接）或 `6543`（连接池）

---

## Railway 项目结构

```
backend/
├── src/
│   ├── index.ts              # 入口
│   ├── app.ts                # Express/Fastify app
│   ├── config/
│   │   ├── database.ts       # Prisma client
│   │   ├── jwt.ts           # JWT config
│   │   └── oauth.ts         # Google OAuth
│   ├── routes/
│   │   ├── auth.ts          # 认证路由
│   │   ├── posts.ts         # 笔记 CRUD
│   │   ├── streak.ts        # 打卡统计
│   │   └── user.ts          # 用户信息
│   ├── middleware/
│   │   ├── auth.ts          # JWT 验证
│   │   ├── validation.ts    # 请求验证
│   │   └── errorHandler.ts  # 错误处理
│   ├── services/
│   │   ├── authService.ts
│   │   ├── postService.ts
│   │   ├── streakService.ts
│   │   └── moderationService.ts  # AI 内容审核
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma        # 数据库 schema
├── package.json
├── tsconfig.json
├── .env                     # Railway 环境变量
└── Dockerfile              # Railway 部署
```

---

## API Endpoints

### Auth
```
POST   /auth/register         # 注册
POST   /auth/login            # 登录
POST   /auth/google           # Google OAuth
POST   /auth/refresh          # 刷新 token
GET    /auth/me               # 当前用户
```

### Posts
```
GET    /api/posts             # 获取 feed
GET    /api/posts/:id         # 获取单篇
POST   /api/posts             # 创建笔记
PUT    /api/posts/:id         # 更新笔记
DELETE /api/posts/:id         # 删除笔记
POST   /api/posts/:id/heart   # 点赞
```

### Streak
```
GET    /api/streak            # 获取打卡数据
POST   /api/streak/update     # 更新打卡（自动调用）
```

### User
```
GET    /api/user/profile      # 用户资料
PUT    /api/user/profile      # 更新资料
GET    /api/user/posts        # 用户的笔记
```

---

## 环境变量 (Railway)

```bash
# Database
DATABASE_URL=postgresql://postgres:[password]@db.jkzqokejtraczcbgnjoh.supabase.co:5432/postgres

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:3000

# API
PORT=3001
NODE_ENV=production
```

---

## 迁移计划

### Phase 1: 设置 Railway Backend（现在）
1. ✅ 创建 backend 文件夹
2. ✅ 设置 Express + Prisma
3. ✅ 连接 Supabase DB
4. ✅ 实现 Auth API
5. ✅ 实现 Posts API
6. ✅ 实现 Streak API
7. ✅ 部署到 Railway

### Phase 2: 更新 Frontend（之后）
1. 更新 Web app 调用 Railway API
2. 更新 iOS app 调用 Railway API
3. 移除 Supabase Auth（保留 DB）

### Phase 3: 添加功能（未来）
1. AI 内容审核
2. 推送通知
3. Email 通知
4. 高级搜索

---

## 优势总结

### 相比 Supabase 全栈
1. ✅ **更灵活** - 自定义 API 逻辑
2. ✅ **AI 友好** - 可以集成 OpenAI/Claude
3. ✅ **控制权** - 完全控制后端
4. ✅ **可扩展** - 添加任何功能

### 相比纯 Railway
1. ✅ **省时间** - 不用管理数据库
2. ✅ **更安全** - 托管数据库有备份
3. ✅ **性能** - Supabase 连接池

---

## 下一步

1. **创建 Backend 项目** - Express + Prisma
2. **配置 Supabase DB** - 连接字符串
3. **实现 Auth API** - Google OAuth + JWT
4. **实现 CRUD API** - Posts, Streak, User
5. **部署到 Railway** - 设置环境变量
6. **更新 Frontend** - 连接 Railway API
7. **测试** - 端到端测试

---

**准备好开始了吗？** 🚀

我可以立即帮你创建 Railway backend 项目！
