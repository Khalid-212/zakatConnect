-- Create product_types table
CREATE TABLE IF NOT EXISTS product_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add family_members field to givers table
ALTER TABLE givers
ADD COLUMN IF NOT EXISTS family_members INTEGER DEFAULT 0;

-- Add family_members field to beneficiaries table
ALTER TABLE beneficiaries
ADD COLUMN IF NOT EXISTS family_members INTEGER DEFAULT 0;

-- Add code field to beneficiaries table for unique identifier
ALTER TABLE beneficiaries
ADD COLUMN IF NOT EXISTS code VARCHAR;

-- Add product_type_id to zakat_collections
ALTER TABLE zakat_collections
ADD COLUMN IF NOT EXISTS product_type_id UUID REFERENCES product_types(id);

-- Add status field to zakat_distributions
ALTER TABLE zakat_distributions
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';

-- Add role field to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'clerk';

-- Enable realtime for new tables
alter publication supabase_realtime add table product_types;
