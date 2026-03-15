# Quick Database Setup (5 minutes)

## Step 1: Open SQL Editor
访问：https://supabase.com/dashboard/project/jkzqokejtraczcbgnjoh/sql/new

登录后，复制下面的 SQL 粘贴到编辑器。

---

## Step 2: Copy & Paste This SQL

```sql
-- 1. 创建 profiles 表
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建 gratitude_posts 表
CREATE TYPE gratitude_category AS ENUM ('FAMILY', 'WORK', 'SMALL_JOYS', 'NATURE', 'HEALTH', 'OTHER');
CREATE TYPE post_visibility AS ENUM ('PRIVATE', 'PUBLIC', 'ANONYMOUS');

CREATE TABLE public.gratitude_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  feeling TEXT,
  category gratitude_category NOT NULL DEFAULT 'OTHER',
  visibility post_visibility NOT NULL DEFAULT 'PUBLIC',
  photo_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  heart_count INTEGER DEFAULT 0
);

-- 3. 创建 streak_data 表
CREATE TABLE public.streak_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_post_date DATE,
  total_posts INTEGER DEFAULT 0
);

-- 4. 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_data ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Users can see own posts and public posts"
  ON public.gratitude_posts FOR SELECT
  USING (author_id = auth.uid() OR visibility IN ('PUBLIC', 'ANONYMOUS'));

CREATE POLICY "Authenticated users can create posts"
  ON public.gratitude_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON public.gratitude_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON public.gratitude_posts FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can view own streak"
  ON public.streak_data FOR ALL
  USING (auth.uid() = user_id);

-- 6. Auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Done! 🎉
```

---

## Step 3: Run It
1. 粘贴到 SQL Editor
2. 点击 **Run** (或 Cmd+Enter)
3. 看到 "Success. No rows returned" 就成功了！

---

## 验证
在 SQL Editor 中运行：
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

应该看到：profiles, gratitude_posts, streak_data
