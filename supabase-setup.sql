-- ============================================
-- Appreciate Database Setup
-- Copy and paste this into Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Users Table (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile when user signs up
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. Gratitude Posts Table
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

CREATE INDEX idx_posts_author_created ON public.gratitude_posts(author_id, created_at DESC);
CREATE INDEX idx_posts_visibility_created ON public.gratitude_posts(visibility, created_at DESC);
CREATE INDEX idx_posts_category ON public.gratitude_posts(category);

-- ============================================
-- 3. Streak Data Table
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
-- 4. Hearts (Likes) Table
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
-- 5. Row Level Security (RLS) Policies
-- ============================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Gratitude Posts
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

-- Streak Data
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

-- Hearts
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
-- 6. Database Functions (RPC)
-- ============================================

-- Update streak calculation
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_post_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT MAX(created_at::date) INTO v_last_post_date
  FROM public.gratitude_posts
  WHERE author_id = p_user_id;

  IF v_last_post_date = CURRENT_DATE THEN
    SELECT current_streak INTO v_current_streak
    FROM public.streak_data
    WHERE user_id = p_user_id;
    IF v_current_streak IS NULL THEN
      v_current_streak := 1;
    END IF;
  ELSIF v_last_post_date = CURRENT_DATE - 1 THEN
    SELECT COALESCE(current_streak, 0) + 1 INTO v_current_streak
    FROM public.streak_data
    WHERE user_id = p_user_id;
  ELSE
    v_current_streak := 1;
  END IF;

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

-- Trigger: auto-update streak when post created
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
-- 7. Storage Bucket for Photos
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

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

-- ============================================
-- Done! 🎉
-- ============================================
