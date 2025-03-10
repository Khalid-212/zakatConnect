-- Create mosques table
CREATE TABLE IF NOT EXISTS mosques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mosque_admins table to link users to mosques with admin role
CREATE TABLE IF NOT EXISTS mosque_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  mosque_id UUID NOT NULL REFERENCES mosques(id),
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'mosque_admin', 'clerk')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mosque_id)
);

-- Create givers table (people who give zakat)
CREATE TABLE IF NOT EXISTS givers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create beneficiaries table (people who receive zakat)
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create zakat_collections table
CREATE TABLE IF NOT EXISTS zakat_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mosque_id UUID NOT NULL REFERENCES mosques(id),
  giver_id UUID REFERENCES givers(id),
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'in_kind')),
  description TEXT,
  collected_by UUID REFERENCES users(id),
  collection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create zakat_distributions table
CREATE TABLE IF NOT EXISTS zakat_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mosque_id UUID NOT NULL REFERENCES mosques(id),
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id),
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'in_kind')),
  description TEXT,
  distributed_by UUID REFERENCES users(id),
  distribution_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add realtime support for all tables
alter publication supabase_realtime add table mosques;
alter publication supabase_realtime add table mosque_admins;
alter publication supabase_realtime add table givers;
alter publication supabase_realtime add table beneficiaries;
alter publication supabase_realtime add table zakat_collections;
alter publication supabase_realtime add table zakat_distributions;
