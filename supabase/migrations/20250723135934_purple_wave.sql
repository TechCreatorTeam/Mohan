/*
  # Create global settings table for site-wide configuration
  
  1. New Tables
    - `global_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique)
      - `setting_value` (jsonb)
      - `description` (text)
      - `updated_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on global_settings table
    - Add policies for public read access and authenticated write access
    - Insert default color theme setting
*/

CREATE TABLE IF NOT EXISTS global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_global_settings_key ON global_settings(setting_key);

-- Enable RLS
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- Policies for global_settings
CREATE POLICY "Anyone can view global settings"
  ON global_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage global settings"
  ON global_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default global color theme setting
INSERT INTO global_settings (setting_key, setting_value, description, updated_by)
VALUES (
  'global_color_theme',
  '"default"'::jsonb,
  'Global color theme applied to all visitors',
  'system'
) ON CONFLICT (setting_key) DO NOTHING;

-- Insert default site mode setting
INSERT INTO global_settings (setting_key, setting_value, description, updated_by)
VALUES (
  'site_mode',
  '"marketplace"'::jsonb,
  'Global site mode: marketplace or portfolio',
  'system'
) ON CONFLICT (setting_key) DO NOTHING;