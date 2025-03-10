-- Drop the existing check constraint on mosque_admins.role
ALTER TABLE mosque_admins DROP CONSTRAINT IF EXISTS mosque_admins_role_check;

-- Add a new check constraint that allows 'admin' and 'clerk' values
ALTER TABLE mosque_admins ADD CONSTRAINT mosque_admins_role_check 
  CHECK (role IN ('super-admin', 'admin', 'clerk', 'reporter'));
