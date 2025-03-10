-- Add code column to givers table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'givers' AND column_name = 'code') THEN
    ALTER TABLE givers ADD COLUMN code TEXT;
  END IF;
END $$;

-- Add staff_code column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'staff_code') THEN
    ALTER TABLE users ADD COLUMN staff_code TEXT;
  END IF;
END $$;
