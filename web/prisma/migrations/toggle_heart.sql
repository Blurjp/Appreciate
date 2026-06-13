-- Atomic heart toggle function
-- Uses SECURITY DEFINER so any authenticated user can toggle hearts
-- on other users' posts (updates heart_count on gratitude_posts).
-- Race-safe: both branches guard heart_count change with FOUND check.

CREATE OR REPLACE FUNCTION toggle_heart(post_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM hearts WHERE post_id = post_id_param AND user_id = user_id_param;
  IF FOUND THEN
    UPDATE gratitude_posts SET heart_count = GREATEST(heart_count - 1, 0) WHERE id = post_id_param;
    RETURN FALSE;
  END IF;

  INSERT INTO hearts (post_id, user_id) VALUES (post_id_param, user_id_param)
  ON CONFLICT (post_id, user_id) DO NOTHING;
  IF FOUND THEN
    UPDATE gratitude_posts SET heart_count = heart_count + 1 WHERE id = post_id_param;
  END IF;
  RETURN TRUE;
END;
$$;
