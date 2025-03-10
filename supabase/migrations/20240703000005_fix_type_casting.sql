-- Drop all policies from all tables to avoid dependency issues
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies) LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename || ';';
  END LOOP;
END $$;

-- Remove the default constraint if it exists
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Create user_role enum type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('super-admin', 'admin', 'clerk');
  END IF;
END $$;

-- Update users table to use the enum
ALTER TABLE users ALTER COLUMN role TYPE user_role USING 
  CASE 
    WHEN role = 'super-admin' THEN 'super-admin'::user_role
    WHEN role = 'admin' THEN 'admin'::user_role
    ELSE 'clerk'::user_role
  END;

-- Update mosque_admins table to use the enum
ALTER TABLE mosque_admins ALTER COLUMN role TYPE user_role USING 
  CASE 
    WHEN role = 'super-admin' THEN 'super-admin'::user_role
    WHEN role = 'admin' THEN 'admin'::user_role
    ELSE 'clerk'::user_role
  END;

-- Now set the default
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'clerk'::user_role;

-- Ensure all tables have proper permissions
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE givers ENABLE ROW LEVEL SECURITY;
ALTER TABLE zakat_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

-- Create policies for beneficiaries
CREATE POLICY "Super admins can do anything with beneficiaries"
ON beneficiaries
FOR ALL
TO authenticated
USING ((SELECT role::text FROM users WHERE id = auth.uid()) = 'super-admin');

CREATE POLICY "Admins and clerks can manage their mosque's beneficiaries"
ON beneficiaries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mosque_admins ma
    WHERE ma.user_id = auth.uid()
    AND (ma.role::text = 'admin' OR ma.role::text = 'clerk')
  )
);

-- Create policies for givers
CREATE POLICY "Super admins can do anything with givers"
ON givers
FOR ALL
TO authenticated
USING ((SELECT role::text FROM users WHERE id = auth.uid()) = 'super-admin');

CREATE POLICY "Admins and clerks can manage their mosque's givers"
ON givers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mosque_admins ma
    WHERE ma.user_id = auth.uid()
    AND (ma.role::text = 'admin' OR ma.role::text = 'clerk')
  )
);

-- Create policies for distributions
CREATE POLICY "Super admins can do anything with distributions"
ON zakat_distributions
FOR ALL
TO authenticated
USING ((SELECT role::text FROM users WHERE id = auth.uid()) = 'super-admin');

CREATE POLICY "Admins and clerks can manage their mosque's distributions"
ON zakat_distributions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mosque_admins ma
    WHERE ma.user_id = auth.uid()
    AND (ma.role::text = 'admin' OR ma.role::text = 'clerk')
  )
);

-- Create policies for products
CREATE POLICY "Super admins and admins can manage products"
ON product_types
FOR ALL
TO authenticated
USING (
  (SELECT role::text FROM users WHERE id = auth.uid()) IN ('super-admin', 'admin')
);

CREATE POLICY "Clerks can view products"
ON product_types
FOR SELECT
TO authenticated
USING (
  (SELECT role::text FROM users WHERE id = auth.uid()) = 'clerk'
);