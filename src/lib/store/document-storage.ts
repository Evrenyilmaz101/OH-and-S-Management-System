import { createClient } from '@/lib/supabase/client';

const BUCKET = 'documents';

export interface UploadResult {
  path: string | null;
  error?: string;
}

/**
 * Upload a file to Supabase Storage under documents/{documentId}/{filename}
 */
export async function uploadDocumentFile(
  file: File,
  documentId: string
): Promise<UploadResult> {
  const supabase = createClient();
  const filePath = `${documentId}/${file.name}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('[storage] Upload error:', error.message);
    return { path: null, error: error.message };
  }

  return { path: data.path };
}

/**
 * Get a signed URL for downloading/viewing a document file (1 hour expiry).
 */
export async function getDocumentFileUrl(filePath: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600);

  if (error) {
    console.error('[storage] Signed URL error:', error.message);
    return null;
  }

  return data.signedUrl;
}

/**
 * Upload an employee profile photo to Supabase Storage.
 * Stored under employee-photos/{employeeId}/photo.{ext}
 */
export async function uploadEmployeePhoto(
  file: File,
  employeeId: string
): Promise<UploadResult> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `employee-photos/${employeeId}/photo.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('[storage] Photo upload error:', error.message);
    return { path: null, error: error.message };
  }

  return { path: data.path };
}

/**
 * Get a signed URL for an employee photo (1 hour expiry).
 */
export async function getEmployeePhotoUrl(filePath: string): Promise<string | null> {
  return getDocumentFileUrl(filePath);
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteDocumentFile(filePath: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('[storage] Delete error:', error.message);
    return false;
  }

  return true;
}
