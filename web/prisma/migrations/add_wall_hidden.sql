-- Add wall_hidden column to profiles for wall-level privacy
-- When true, only the owner can view their wall at /tree/[userId]
-- (per-post visibility still applies; this is a coarser kill-switch over the aggregated wall)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS wall_hidden BOOLEAN NOT NULL DEFAULT FALSE;
