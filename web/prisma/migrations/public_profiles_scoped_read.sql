-- ============================================
-- Public, scoped read access on profiles
--
-- Problem: production profiles SELECT policy was auth.uid() = id, so anon and
-- authenticated users could not read OTHER users' profiles -> public walls and
-- feed author joins returned null ("Unknown"). But a blanket USING(true) would
-- expose email, password hashes, OAuth IDs and Stripe IDs via the public REST API.
--
-- Fix:
--   1. self_profile() SECURITY DEFINER RPC — lets the caller read their OWN full
--      profile (including email/stripe). Used by /api/user (self read/update).
--   2. Public SELECT policy USING(true) — all rows visible (unblocks walls/feed).
--   3. Column-level grant of ONLY safe columns; table-level SELECT revoked so the
--      sensitive columns (email, password, *_id OAuth, stripe_*, provider,
--      is_anonymous) cannot be read cross-user.
-- ============================================

CREATE OR REPLACE FUNCTION public.self_profile()
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  avatar_url text,
  created_at timestamptz,
  is_pro boolean,
  stripe_customer_id text,
  wall_theme character varying,
  wall_hidden boolean
) AS $$
SELECT id, email, name, avatar_url, created_at, is_pro, stripe_customer_id, wall_theme, wall_hidden
FROM public.profiles
WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.self_profile() TO anon, authenticated;

-- All profile rows visible (public walls + feed joins)
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT
  USING (true);

-- Restrict to safe columns only: drop table-level SELECT, grant column-level
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, name, avatar_url, created_at, is_pro, wall_theme, wall_hidden)
  ON public.profiles TO anon, authenticated;
