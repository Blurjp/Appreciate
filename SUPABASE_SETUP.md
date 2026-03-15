# Appreciate - Supabase 集成指南

## 🚀 快速开始（3 天完成）

---

## Day 1: 创建 Supabase 项目（1 小时）

### Step 1: 创建项目

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 登录
4. 创建新组织（如果还没有）
5. 创建新项目：
   - **Name:** appreciate
   - **Database Password:** （自动生成或自己设置，保存好！）
   - **Region:** West US (Oregon) - 选择离你最近的
   - **Pricing Plan:** Free
6. 等待 2-3 分钟项目初始化

### Step 2: 获取 API Keys

项目创建后，进入 **Settings > API**：

```
Project URL: https://xxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (⚠️ 保密！)
```

**保存这些值，后面会用到！**

---

## Step 3: 配置数据库 Schema

### 方法 1: 使用 SQL Editor（推荐）

1. 进入 **SQL Editor**
2. 点击 "New query"
3. 复制粘贴以下 SQL：

```sql
-- ============================================
-- Appreciate Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users Table (扩展 Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 自动创建 profile 当用户注册时
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Gratitude Posts Table
-- ============================================
CREATE TYPE gratitude_category AS ENUM ('FAMILY', 'WORK', 'SMALL_JOYS', 'NATURE', 'HEALTH', 'OTHER');
CREATE TYPE post_visibility AS ENUM ('PRIVATE', 'PUBLIC', 'ANONYMOUS');

CREATE TABLE public.gratitude_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  feeling TEXT,
  category gratitude_category NOT NULL DEFAULT 'OTHER',
  visibility post_visibility NOT NULL DEFAULT 'PUBLIC',
  photo_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  heart_count INTEGER DEFAULT 0,
  is_bookmarked BOOLEAN DEFAULT FALSE
);

-- 索引
CREATE INDEX idx_posts_author_created ON public.gratitude_posts(author_id, created_at DESC);
CREATE INDEX idx_posts_visibility_created ON public.gratitude_posts(visibility, created_at DESC);
CREATE INDEX idx_posts_category ON public.gratitude_posts(category);

-- ============================================
-- Streak Data Table
-- ============================================
CREATE TABLE public.streak_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_post_date DATE,
  total_posts INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Hearts (Likes) Table
-- ============================================
CREATE TABLE public.hearts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.gratitude_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_hearts_post ON public.hearts(post_id);
CREATE INDEX idx_hearts_user ON public.hearts(user_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Profiles: 用户可以查看所有 profile，但只能修改自己的
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Gratitude Posts: 复杂的可见性规则
ALTER TABLE public.gratitude_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own posts and public posts"
  ON public.gratitude_posts FOR SELECT
  USING (
    author_id = auth.uid() OR
    visibility IN ('PUBLIC', 'ANONYMOUS')
  );

CREATE POLICY "Authenticated users can create posts"
  ON public.gratitude_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON public.gratitude_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON public.gratitude_posts FOR DELETE
  USING (auth.uid() = author_id);

-- Streak Data: 只有所有者可以访问
ALTER TABLE public.streak_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
  ON public.streak_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON public.streak_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.streak_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Hearts: 用户可以查看所有点赞，但只能管理自己的
ALTER TABLE public.hearts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hearts are viewable by everyone"
  ON public.hearts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can heart"
  ON public.hearts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unheart own hearts"
  ON public.hearts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Database Functions (RPC)
-- ============================================

-- 更新打卡统计
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_post_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- 获取最后一次发帖日期
  SELECT MAX(created_at::date) INTO v_last_post_date
  FROM public.gratitude_posts
  WHERE author_id = p_user_id;
  
  -- 计算当前 streak
  IF v_last_post_date = CURRENT_DATE THEN
    -- 今天已发帖，保持 streak
    SELECT current_streak INTO v_current_streak
    FROM public.streak_data
    WHERE user_id = p_user_id;
    
    IF v_current_streak IS NULL THEN
      v_current_streak := 1;
    END IF;
  ELSIF v_last_post_date = CURRENT_DATE - 1 THEN
    -- 昨天发帖，streak +1
    SELECT COALESCE(current_streak, 0) + 1 INTO v_current_streak
    FROM public.streak_data
    WHERE user_id = p_user_id;
  ELSE
    -- 中断了，重置为 1
    v_current_streak := 1;
  END IF;
  
  -- 更新或插入
  INSERT INTO public.streak_data (user_id, current_streak, longest_streak, last_post_date, total_posts)
  VALUES (
    p_user_id,
    v_current_streak,
    v_current_streak,
    v_last_post_date,
    (SELECT COUNT(*) FROM public.gratitude_posts WHERE author_id = p_user_id)
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_streak = v_current_streak,
    longest_streak = GREATEST(streak_data.longest_streak, v_current_streak),
    last_post_date = v_last_post_date,
    total_posts = (SELECT COUNT(*) FROM public.gratitude_posts WHERE author_id = p_user_id),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器：创建笔记时自动更新 streak
CREATE OR REPLACE FUNCTION public.handle_new_post()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_streak(NEW.author_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_created
  AFTER INSERT ON public.gratitude_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_post();

-- ============================================
-- Storage Buckets
-- ============================================

-- 创建 photos bucket 用于存储图片
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);

-- Storage policies
CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

4. 点击 "Run" 执行
5. 等待执行完成（应该显示 "Success. No rows returned"）

### 方法 2: 使用 Table Editor（手动创建）

如果 SQL 有问题，可以手动创建表：
1. 进入 **Table Editor**
2. 逐个创建表（参考上面的 schema）
3. 设置字段类型和约束
4. 启用 RLS 并添加 policies

---

## Step 4: 配置 Sign in with Apple

### 4.1 在 Apple Developer 创建 Service ID

1. 访问 https://developer.apple.com/account
2. 进入 **Certificates, Identifiers & Profiles**
3. 点击 **Identifiers** > "+" 按钮
4. 选择 **Services IDs**，点击 Continue
5. 填写：
   - **Description:** Appreciate App
   - **Identifier:** `com.yourcompany.appreciate.web`（反向域名）
6. 勾选 "Sign in with Apple"，点击 Configure
7. 填写：
   - **Primary App ID:** 选择你的 iOS app ID（如果没有，需要先创建）
   - **Domains and Subdomains:** `your-project.vercel.app`（Web 域名）
   - **Return URLs:** `https://your-project.vercel.app/api/auth/callback/apple`
8. 点击 Save > Continue > Register

### 4.2 生成 Private Key

1. 在 Apple Developer，进入 **Keys**
2. 点击 "+" 创建新 key
3. 勾选 "Sign in with Apple"
4. 点击 Configure，选择刚才的 Primary App ID
5. 点击 Continue > Register
6. **下载 .p8 文件**（⚠️ 只能下载一次，保存好！）
7. 记录 **Key ID**

### 4.3 在 Supabase 配置 Apple Auth

1. 进入 Supabase **Authentication > Providers**
2. 找到 **Apple**，点击 Enable
3. 填写：
   - **Services ID:** `com.yourcompany.appreciate.web`
   - **Team ID:** （在 Apple Developer 右上角，10 位字符）
   - **Key ID:** （刚才生成的 key ID）
   - **Private Key:** （打开 .p8 文件，复制全部内容，包括 BEGIN/END 行）
4. 点击 Save

---

## Step 5: 配置环境变量

### iOS (Xcode)

1. 打开 `ios/Appreciate/Appreciate/Config/SupabaseConfig.swift`
2. 替换为你的值：

```swift
enum SupabaseConfig {
    static let supabaseURL = URL(string: "https://xxxxxx.supabase.co")!
    static let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Web (Next.js)

1. 打开 `web/.env.local`
2. 添加：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 验证设置

### 测试数据库连接

在 Supabase **SQL Editor** 中运行：

```sql
-- 测试：查看所有表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 应该看到：profiles, gratitude_posts, streak_data, hearts

-- 测试：查看 RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 测试 API

在终端运行：

```bash
# 替换 YOUR_URL 和 YOUR_KEY
curl "https://xxxxxx.supabase.co/rest/v1/gratitude_posts" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 应该返回: [] (空数组，因为还没有数据)
```

---

## ✅ Day 1 完成检查清单

- [ ] Supabase 项目已创建
- [ ] API keys 已保存
- [ ] 数据库 schema 已创建
- [ ] RLS policies 已启用
- [ ] Sign in with Apple 已配置
- [ ] 环境变量已设置
- [ ] API 连接测试通过

---

## 📚 参考资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase Swift SDK](https://github.com/supabase/supabase-swift)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Sign in with Apple 指南](https://developer.apple.com/sign-in-with-apple/)

---

**下一步：** Day 2 - iOS 集成

**维护者:** blurjp  
**最后更新:** 2026-03-14
