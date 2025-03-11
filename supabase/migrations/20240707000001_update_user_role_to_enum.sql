-- Create the user_role enum type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('super-admin', 'admin', 'clerk');
  END IF;
END $$;

-- Alter the users table to use the enum type
ALTER TABLE users 
  ALTER COLUMN role TYPE user_role USING role::user_role;

-- Add a constraint to ensure role is one of the allowed values
ALTER TABLE users
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super-admin', 'admin', 'clerk'));
