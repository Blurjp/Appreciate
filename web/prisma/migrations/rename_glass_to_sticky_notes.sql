-- Rename wall_theme 'glass' to 'sticky-notes'
-- Run after updating valid_wall_theme constraint to include 'sticky-notes'

-- Step 1: Add 'sticky-notes' to allowed values (alongside 'glass')
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_wall_theme;
ALTER TABLE profiles ADD CONSTRAINT valid_wall_theme
  CHECK (wall_theme IN ('starry', 'tree', 'zen', 'polaroid', 'glass', 'sticky-notes'));

-- Step 2: Migrate existing data
UPDATE profiles SET wall_theme = 'sticky-notes' WHERE wall_theme = 'glass';

-- Step 3: Remove 'glass' from allowed values
ALTER TABLE profiles DROP CONSTRAINT valid_wall_theme;
ALTER TABLE profiles ADD CONSTRAINT valid_wall_theme
  CHECK (wall_theme IN ('starry', 'tree', 'zen', 'polaroid', 'sticky-notes'));
