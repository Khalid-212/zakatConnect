-- Add missing columns to beneficiaries table
ALTER TABLE beneficiaries ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE beneficiaries ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE beneficiaries ADD COLUMN IF NOT EXISTS sub_city text;
ALTER TABLE beneficiaries ADD COLUMN IF NOT EXISTS woreda text;
ALTER TABLE beneficiaries ADD COLUMN IF NOT EXISTS remark text;
