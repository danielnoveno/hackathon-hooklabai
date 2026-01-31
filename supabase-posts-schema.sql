-- Posts table schema for storing scraped Base/Farcaster posts
-- This table stores viral posts from the Base ecosystem for AI analysis

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hash TEXT UNIQUE NOT NULL,
  text TEXT NOT NULL,
  author_display_name TEXT,
  author_username TEXT,
  author_pfp_url TEXT,
  author_fid INTEGER,
  timestamp TIMESTAMP NOT NULL,
  total_engagement INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  recasts_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_hash ON posts(hash);
CREATE INDEX IF NOT EXISTS idx_posts_engagement ON posts(total_engagement DESC);
CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo purposes
-- In production, you would want more restrictive policies
do $$
begin
  if not exists (select * from pg_policies where policyname = 'Allow public read access to posts' and tablename = 'posts') then
    CREATE POLICY "Allow public read access to posts" ON posts FOR SELECT USING (true);
  end if;

  if not exists (select * from pg_policies where policyname = 'Allow all operations on posts' and tablename = 'posts') then
    CREATE POLICY "Allow all operations on posts" ON posts FOR ALL USING (true);
  end if;
end $$;
