# 🚀 Railway Backend 快速部署指南

## ✅ 已完成的设置

1. **Backend 项目结构** ✅
   - Express + TypeScript
   - Prisma ORM
   - Zod validation
   - JWT auth
   - Google OAuth

2. **配置文件** ✅
   - `.env.example` - 环境变量模板
   - `.env` - 本地配置（需要数据库密码）
   - `Dockerfile` - Docker 部署
   - `railway.toml` - Railway 配置

3. **文档** ✅
   - `README.md` - 完整文档
   - `ARCHITECTURE_UPDATE.md` - 架构说明

---

## 📋 下一步操作

### Step 1: 获取 Supabase 数据库密码（1 分钟）

1. 访问：https://supabase.com/dashboard/project/jkzqokejtraczcbgnjoh/settings/database
2. 找到 **Connection string** → **URI**
3. 复制完整的连接字符串，或只复制密码部分

**连接字符串格式：**
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@db.jkzqokejtraczcbgnjoh.supabase.co:5432/postgres
```

### Step 2: 更新本地环境变量（30 秒）

编辑 `backend/.env`：

```bash
# 将 [YOUR-PASSWORD] 替换为实际密码
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.jkzqokejtraczcbgnjoh.supabase.co:5432/postgres"
```

### Step 3: 测试本地运行（2 分钟）

```bash
cd /Users/jianpinghuang/.openclaw/workspace/projects/appreciate/backend

# 生成 Prisma Client
npm run prisma:generate

# 运行开发服务器
npm run dev
```

**成功标志：**
```
🚀 Appreciate API running on port 3001
📊 Environment: development
🌐 CORS origin: http://localhost:3000
```

### Step 4: 部署到 Railway（5 分钟）

#### 方法 A: 使用 Railway CLI（推荐）

```bash
# 1. 安装 Railway CLI
npm i -g @railway/cli

# 2. 登录 Railway
railway login

# 3. 初始化项目
cd /Users/jianpinghuang/.openclaw/workspace/projects/appreciate/backend
railway init

# 4. 部署
railway up

# 5. 添加环境变量
railway variables set DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.jkzqokejtraczcbgnjoh.supabase.co:5432/postgres"
railway variables set JWT_SECRET="appreciate-jwt-secret-2026"
railway variables set GOOGLE_CLIENT_ID="your-google-client-id"
railway variables set GOOGLE_CLIENT_SECRET="your-google-client-secret"
railway variables set FRONTEND_URL="http://localhost:3000"
railway variables set NODE_ENV="production"
```

#### 方法 B: 使用 Railway Dashboard

1. **访问 Railway**
   https://railway.app/

2. **创建新项目**
   - Click "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `Blurjp/Appreciate` 仓库
   - 选择 `backend` 目录

3. **配置环境变量**
   在 Variables 标签页添加：
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.jkzqokejtraczcbgnjoh.supabase.co:5432/postgres
   JWT_SECRET=appreciate-jwt-secret-2026
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=production
   ```

4. **部署**
   - Railway 会自动检测 Dockerfile
   - 自动构建和部署
   - 生成一个 URL（例如：`https://appreciate-api.railway.app`）

### Step 5: 测试 API（1 分钟）

```bash
# 健康检查
curl https://your-api.railway.app/health

# 应该返回：
{
  "status": "ok",
  "timestamp": "2026-03-15T22:00:00.000Z",
  "uptime": 123.456
}
```

---

## 🔧 环境变量说明

### 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | Supabase PostgreSQL 连接字符串 | `postgresql://...` |
| `JWT_SECRET` | JWT 签名密钥 | 随机字符串 |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | 从 Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | 从 Google Cloud Console |

### 可选变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 环境 | development |
| `FRONTEND_URL` | 前端 URL（CORS） | http://localhost:3000 |
| `JWT_EXPIRES_IN` | Token 过期时间 | 7d |

---

## 🎯 完整流程（15 分钟）

```bash
# 1. 获取数据库密码
# 访问 Supabase Dashboard

# 2. 更新本地配置
cd /Users/jianpinghuang/.openclaw/workspace/projects/appreciate/backend
# 编辑 .env 文件

# 3. 本地测试
npm run prisma:generate
npm run dev
# 测试 http://localhost:3001/health

# 4. 部署到 Railway
railway login
railway init
railway up
railway variables set DATABASE_URL="..."
# ... 设置其他变量

# 5. 测试生产环境
curl https://your-api.railway.app/health
```

---

## 📊 部署后检查清单

- [ ] API 健康检查通过
- [ ] 数据库连接正常
- [ ] Google OAuth 可以登录
- [ ] CORS 配置正确
- [ ] 环境变量已设置

---

## 🔍 故障排除

### 问题 1: 数据库连接失败

**解决方案：**
1. 检查 DATABASE_URL 格式是否正确
2. 确保 Supabase 项目未暂停
3. 检查 IP 白名单（Supabase 默认允许所有）

### 问题 2: Railway 部署失败

**解决方案：**
1. 检查 Dockerfile 语法
2. 确保 package.json 正确
3. 查看 Railway 日志

### 问题 3: CORS 错误

**解决方案：**
1. 检查 FRONTEND_URL 环境变量
2. 确保 CORS 中间件正确配置

---

## 📝 更新 Frontend 配置

部署完成后，需要更新 Frontend 配置：

### Web App (`web/.env.local`)

```bash
# 替换为 Railway URL
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

### iOS App (`ios/Appreciate/Config.xcconfig`)

```
API_BASE_URL = https://your-api.railway.app
```

---

## 🎉 完成！

部署成功后，你将拥有：

- ✅ Railway 后端 API
- ✅ Supabase PostgreSQL 数据库
- ✅ Google OAuth 集成
- ✅ 可扩展的后端架构

**下一步：** 更新 Frontend 连接 Railway API 并测试！

---

**需要帮助？** 随时告诉我！🚀
