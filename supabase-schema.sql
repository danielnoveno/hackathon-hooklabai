-- HookLab AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);

-- Quotas table
CREATE TABLE IF NOT EXISTS quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  remaining_credits INTEGER DEFAULT 5,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on wallet_address
CREATE INDEX IF NOT EXISTS idx_quotas_wallet ON quotas(wallet_address);

-- Usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  topic TEXT,
  selected_hook TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on wallet_address and created_at for analytics
CREATE INDEX IF NOT EXISTS idx_usage_logs_wallet ON usage_logs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at DESC);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for hackathon demo
-- In production, you would want more restrictive policies
do $$
begin
  if not exists (select * from pg_policies where policyname = 'Allow all operations on users' and tablename = 'users') then
    CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
  end if;

  if not exists (select * from pg_policies where policyname = 'Allow all operations on quotas' and tablename = 'quotas') then
    CREATE POLICY "Allow all operations on quotas" ON quotas FOR ALL USING (true);
  end if;

  if not exists (select * from pg_policies where policyname = 'Allow all operations on usage_logs' and tablename = 'usage_logs') then
    CREATE POLICY "Allow all operations on usage_logs" ON usage_logs FOR ALL USING (true);
  end if;
end $$;

-- Optional: Create a view for analytics
CREATE OR REPLACE VIEW usage_analytics WITH (security_invoker = true) AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_hooks_selected,
  COUNT(DISTINCT wallet_address) as unique_users
FROM usage_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;
