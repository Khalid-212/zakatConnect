-- Fix type casting issues in policies

-- Drop all policies from all tables to avoid dependency issues
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies) LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename || ';';
  END LOOP;
END $$;

-- Create policies with proper type casting
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