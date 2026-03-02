-- ============================================================================
-- Migration: Add file upload support to documents
-- ============================================================================

-- 1. Add file_url column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_url text;

-- 2. Create storage bucket for document files (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS policies for authenticated users (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload documents' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload documents"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read documents' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can read documents"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update documents' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can update documents"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete documents' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can delete documents"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'documents');
  END IF;
END $$;
