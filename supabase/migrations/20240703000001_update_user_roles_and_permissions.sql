-- Create user_role enum type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('super-admin', 'admin', 'clerk');
  END IF;
END $$;

-- Update users table to use the enum
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;

-- Update mosque_admins table to use the enum
ALTER TABLE mosque_admins ALTER COLUMN role TYPE user_role USING role::user_role;

-- Ensure all tables have proper permissions
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE givers ENABLE ROW LEVEL SECURITY;
ALTER TABLE zakat_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to create beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Allow authenticated users to read beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Allow authenticated users to update beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Allow authenticated users to delete beneficiaries" ON beneficiaries;

-- Create policies for beneficiaries
CREATE POLICY "Super admins can do anything with beneficiaries"
ON beneficiaries
FOR ALL
TO authenticated
USING ((SELECT role FROM users WHERE id = auth.uid()) = 'super-admin'::user_role);

CREATE POLICY "Admins and clerks can manage their mosque's beneficiaries"
ON beneficiaries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mosque_admins ma
    WHERE ma.user_id = auth.uid()
    AND (ma.role = 'admin'::user_role OR ma.role = 'clerk'::user_role)
  )
);

-- Create policies for givers
CREATE POLICY "Super admins can do anything with givers"
ON givers
FOR ALL
TO authenticated
USING ((SELECT role FROM users WHERE id = auth.uid()) = 'super-admin'::user_role);

CREATE POLICY "Admins and clerks can manage their mosque's givers"
ON givers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mosque_admins ma
    WHERE ma.user_id = auth.uid()
    AND (ma.role = 'admin'::user_role OR ma.role = 'clerk'::user_role)
  )
);

-- Create policies for distributions
CREATE POLICY "Super admins can do anything with distributions"
ON zakat_distributions
FOR ALL
TO authenticated
USING ((SELECT role FROM users WHERE id = auth.uid()) = 'super-admin'::user_role);

CREATE POLICY "Admins and clerks can manage their mosque's distributions"
ON zakat_distributions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mosque_admins ma
    WHERE ma.user_id = auth.uid()
    AND ma.mosque_id = zakat_distributions.mosque_id
    AND (ma.role = 'admin'::user_role OR ma.role = 'clerk'::user_role)
  )
);

-- Create policies for products
CREATE POLICY "Super admins and admins can manage products"
ON product_types
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('super-admin'::user_role, 'admin'::user_role)
);

CREATE POLICY "Clerks can view products"
ON product_types
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'clerk'::user_role
);