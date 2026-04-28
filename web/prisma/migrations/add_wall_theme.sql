-- Add wall_theme column to profiles for visualization theme selection
-- Valid values: 'starry' (default), 'tree', 'zen', 'polaroid', 'glass'

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS wall_theme VARCHAR(20) DEFAULT 'starry';

-- Optional: add check constraint for valid theme values
ALTER TABLE profiles
ADD CONSTRAINT valid_wall_theme
CHECK (wall_theme IN ('starry', 'tree', 'zen', 'polaroid', 'glass'));
