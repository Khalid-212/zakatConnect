-- Disable RLS for zakat_collections table
ALTER TABLE zakat_collections DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all access" ON zakat_collections;

-- Create a public access policy
CREATE POLICY "Allow all access"
ON zakat_collections
FOR ALL
USING (true);
