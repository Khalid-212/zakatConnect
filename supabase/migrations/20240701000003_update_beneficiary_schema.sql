-- Update beneficiaries table to add new fields and remove category
ALTER TABLE beneficiaries
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS address,
ADD COLUMN IF NOT EXISTS region VARCHAR,
ADD COLUMN IF NOT EXISTS city VARCHAR,
ADD COLUMN IF NOT EXISTS sub_city VARCHAR,
ADD COLUMN IF NOT EXISTS woreda VARCHAR,
ADD COLUMN IF NOT EXISTS remark TEXT;

-- Beneficiaries table is already in the realtime publication
