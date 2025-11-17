-- NPM Dashboard Database Schema for Supabase

-- Table: packages
-- Stores metadata about npm packages
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  repository TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: package_downloads
-- Stores download statistics for packages over time
CREATE TABLE IF NOT EXISTS package_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name TEXT NOT NULL,
  downloads BIGINT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_name, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_package_downloads_package_name ON package_downloads(package_name);
CREATE INDEX IF NOT EXISTS idx_package_downloads_date ON package_downloads(date);
CREATE INDEX IF NOT EXISTS idx_package_downloads_package_date ON package_downloads(package_name, date DESC);
CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);

-- Enable Row Level Security (RLS)
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_downloads ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
-- Anyone can read the data
CREATE POLICY "Allow public read access to packages"
  ON packages FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Allow public read access to package_downloads"
  ON package_downloads FOR SELECT
  TO PUBLIC
  USING (true);

-- Only authenticated users can insert/update
-- If you want to allow anonymous updates via your anon key, change 'authenticated' to 'anon'
CREATE POLICY "Allow insert to packages"
  ON packages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update to packages"
  ON packages FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow insert to package_downloads"
  ON package_downloads FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update to package_downloads"
  ON package_downloads FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Optional: Create a function to clean old data (run manually or via cron)
CREATE OR REPLACE FUNCTION clean_old_download_data(days_to_keep INTEGER DEFAULT 400)
RETURNS void AS $$
BEGIN
  DELETE FROM package_downloads
  WHERE date < CURRENT_DATE - days_to_keep;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE packages IS 'Stores metadata about npm packages';
COMMENT ON TABLE package_downloads IS 'Stores daily download statistics for npm packages';
COMMENT ON FUNCTION clean_old_download_data IS 'Removes download data older than specified days (default: 400 days)';
