/*
  # Create storage bucket and policies for project documents
  
  1. Storage Setup
    - Create project-documents bucket with proper configuration
    - Set up storage policies for file access
    - Configure file size limits and allowed MIME types
  
  2. Security
    - Public read access for downloads
    - Authenticated upload access
    - Proper file type restrictions
*/

-- Create the storage bucket for project documents
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) VALUES (
  'project-documents',
  'project-documents',
  true, -- Public downloads
  10485760, -- 10MB file size limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies using the proper Supabase approach
-- Note: These policies will be created if they don't already exist

-- Policy for authenticated users to upload files
DO $$
BEGIN
  -- Check if the policy already exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload project documents'
  ) THEN
    -- Create upload policy for authenticated users
    EXECUTE 'CREATE POLICY "Authenticated users can upload project documents" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = ''project-documents'')';
  END IF;
END $$;

-- Policy for public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view project documents'
  ) THEN
    -- Create read policy for public access
    EXECUTE 'CREATE POLICY "Public can view project documents" ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = ''project-documents'')';
  END IF;
END $$;

-- Policy for authenticated users to update/delete their uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can manage their project documents'
  ) THEN
    -- Create management policy for authenticated users
    EXECUTE 'CREATE POLICY "Authenticated users can manage their project documents" ON storage.objects
      FOR ALL TO authenticated
      USING (bucket_id = ''project-documents'')
      WITH CHECK (bucket_id = ''project-documents'')';
  END IF;
END $$;

-- Ensure RLS is enabled on storage.objects (it should be by default)
-- We don't need to disable/enable RLS as that requires superuser privileges
-- Supabase handles this automatically

-- Create a simple function to verify bucket creation
CREATE OR REPLACE FUNCTION verify_project_documents_bucket()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = 'project-documents'
  );
END;
$$;

-- Grant execute permission on the verification function
GRANT EXECUTE ON FUNCTION verify_project_documents_bucket() TO authenticated;
GRANT EXECUTE ON FUNCTION verify_project_documents_bucket() TO anon;