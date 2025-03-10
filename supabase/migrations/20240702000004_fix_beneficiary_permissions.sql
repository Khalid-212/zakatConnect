-- Temporarily disable RLS for beneficiaries table to allow operations during development
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to create beneficiaries
CREATE POLICY "Allow authenticated users to create beneficiaries"
ON beneficiaries
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create a policy that allows all authenticated users to read beneficiaries
CREATE POLICY "Allow authenticated users to read beneficiaries"
ON beneficiaries
FOR SELECT
TO authenticated
USING (true);

-- Create a policy that allows all authenticated users to update beneficiaries
CREATE POLICY "Allow authenticated users to update beneficiaries"
ON beneficiaries
FOR UPDATE
TO authenticated
USING (true);

-- Create a policy that allows all authenticated users to delete beneficiaries
CREATE POLICY "Allow authenticated users to delete beneficiaries"
ON beneficiaries
FOR DELETE
TO authenticated
USING (true);
