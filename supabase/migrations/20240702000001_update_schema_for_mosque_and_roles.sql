-- Add sub_city, woreda, contact_person, and contact_phone to mosques table
ALTER TABLE mosques
ADD COLUMN IF NOT EXISTS sub_city TEXT,
ADD COLUMN IF NOT EXISTS woreda TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Create enum type for user roles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('super-admin', 'admin', 'clerk');
  END IF;
END $$;

-- Update users table to use the enum type
ALTER TABLE users
ALTER COLUMN role TYPE user_role USING role::user_role;

-- Add status field to beneficiaries table with default 'pending'
ALTER TABLE beneficiaries
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Create RLS policies for mosque-specific access

-- For beneficiaries table
CREATE OR REPLACE FUNCTION get_user_mosque_ids(user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT mosque_id FROM mosque_admins WHERE user_id = get_user_mosque_ids.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on tables
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE givers ENABLE ROW LEVEL SECURITY;
ALTER TABLE zakat_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE zakat_distributions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can see all beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Admins and clerks can only see their mosque's beneficiaries" ON beneficiaries;

DROP POLICY IF EXISTS "Super admins can see all givers" ON givers;
DROP POLICY IF EXISTS "Admins and clerks can only see their mosque's givers" ON givers;

DROP POLICY IF EXISTS "Super admins can see all collections" ON zakat_collections;
DROP POLICY IF EXISTS "Admins and clerks can only see their mosque's collections" ON zakat_collections;

DROP POLICY IF EXISTS "Super admins can see all distributions" ON zakat_distributions;
DROP POLICY IF EXISTS "Admins and clerks can only see their mosque's distributions" ON zakat_distributions;

-- Create policies for beneficiaries
CREATE POLICY "Super admins can see all beneficiaries"
ON beneficiaries
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'super-admin'
);

CREATE POLICY "Admins and clerks can only see their mosque's beneficiaries"
ON beneficiaries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM zakat_distributions zd
    JOIN mosque_admins ma ON zd.mosque_id = ma.mosque_id
    WHERE zd.beneficiary_id = beneficiaries.id
    AND ma.user_id = auth.uid()
  )
);

-- Create policies for givers
CREATE POLICY "Super admins can see all givers"
ON givers
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'super-admin'
);

CREATE POLICY "Admins and clerks can only see their mosque's givers"
ON givers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM zakat_collections zc
    JOIN mosque_admins ma ON zc.mosque_id = ma.mosque_id
    WHERE zc.giver_id = givers.id
    AND ma.user_id = auth.uid()
  )
);

-- Create policies for zakat_collections
CREATE POLICY "Super admins can see all collections"
ON zakat_collections
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'super-admin'
);

CREATE POLICY "Admins and clerks can only see their mosque's collections"
ON zakat_collections
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mosque_admins ma
    WHERE ma.mosque_id = zakat_collections.mosque_id
    AND ma.user_id = auth.uid()
  )
);

-- Create policies for zakat_distributions
CREATE POLICY "Super admins can see all distributions"
ON zakat_distributions
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'super-admin'
);

CREATE POLICY "Admins and clerks can only see their mosque's distributions"
ON zakat_distributions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mosque_admins ma
    WHERE ma.mosque_id = zakat_distributions.mosque_id
    AND ma.user_id = auth.uid()
  )
);

-- Add realtime publication for all tables
alter publication supabase_realtime add table mosques;
alter publication supabase_realtime add table beneficiaries;
alter publication supabase_realtime add table givers;
alter publication supabase_realtime add table zakat_collections;
alter publication supabase_realtime add table zakat_distributions;
alter publication supabase_realtime add table mosque_admins;
alter publication supabase_realtime add table users;
