-- ============================================
-- Fix streak computation + recompute on delete + bump updated_at on edit
--
-- 1. Replaces the broken update_streak() (stuck at 1: MAX(created_at) always
--    included the just-inserted row so the +1 branch was unreachable) with a
--    correct gaps-and-islands recompute of consecutive posting days.
-- 2. Adds an AFTER DELETE trigger so deletes also refresh streak_data.
-- 3. Adds a BEFORE UPDATE trigger to set updated_at = NOW() on post edits
--    (lets the UI memoization detect changes).
-- 4. Backfills streak_data for all existing users with the corrected logic.
-- ============================================

CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_last_post_date DATE;
  v_total_posts INTEGER;
BEGIN
  -- Current streak: the run of consecutive posting days ending today or yesterday
  WITH distinct_days AS (
    SELECT DISTINCT created_at::date AS d
    FROM public.gratitude_posts
    WHERE author_id = p_user_id
  ),
  grouped AS (
    SELECT d, (d - (ROW_NUMBER() OVER (ORDER BY d))::int) AS grp
    FROM distinct_days
  ),
  runs AS (
    SELECT MAX(d) AS end_d, COUNT(*) AS len
    FROM grouped
    GROUP BY grp
  )
  SELECT COALESCE((
    SELECT len FROM runs WHERE end_d >= CURRENT_DATE - 1 ORDER BY end_d DESC LIMIT 1
  ), 0) INTO v_current_streak;

  -- Longest streak: the longest run of consecutive posting days ever
  WITH distinct_days AS (
    SELECT DISTINCT created_at::date AS d
    FROM public.gratitude_posts
    WHERE author_id = p_user_id
  ),
  grouped AS (
    SELECT d, (d - (ROW_NUMBER() OVER (ORDER BY d))::int) AS grp
    FROM distinct_days
  ),
  runs AS (
    SELECT COUNT(*) AS len FROM grouped GROUP BY grp
  )
  SELECT COALESCE(MAX(len), 0) INTO v_longest_streak FROM runs;

  SELECT MAX(created_at::date) INTO v_last_post_date
  FROM public.gratitude_posts
  WHERE author_id = p_user_id;

  SELECT COUNT(*) INTO v_total_posts
  FROM public.gratitude_posts
  WHERE author_id = p_user_id;

  INSERT INTO public.streak_data (user_id, current_streak, longest_streak, last_post_date, total_posts)
  VALUES (p_user_id, v_current_streak, v_longest_streak, v_last_post_date, v_total_posts)
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    longest_streak = GREATEST(streak_data.longest_streak, EXCLUDED.longest_streak),
    last_post_date = EXCLUDED.last_post_date,
    total_posts = EXCLUDED.total_posts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recompute streak when a post is deleted
CREATE OR REPLACE FUNCTION public.handle_deleted_post()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_streak(OLD.author_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_deleted ON public.gratitude_posts;
CREATE TRIGGER on_post_deleted
  AFTER DELETE ON public.gratitude_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_post();

-- Keep updated_at fresh on edits
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_posts_updated_at ON public.gratitude_posts;
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.gratitude_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Backfill streak_data for all existing users with the corrected logic
DO $$
DECLARE u UUID;
BEGIN
  FOR u IN SELECT DISTINCT author_id FROM public.gratitude_posts LOOP
    PERFORM public.update_streak(u);
  END LOOP;
END $$;
