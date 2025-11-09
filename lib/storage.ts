import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize MinIO client (S3-compatible)
const s3Client = new S3Client({
  region: 'us-east-1', // MinIO doesn't use regions, but SDK requires it
  endpoint: `http${process.env.MINIO_USE_SSL === 'true' ? 's' : ''}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.MINIO_SECRET_KEY || '',
  },
  forcePathStyle: true, // Required for MinIO
});

/**
 * Upload a file to MinIO
 */
export async function uploadFile(
  bucket: string,
  key: string,
  file: Buffer | Uint8Array | Blob,
  contentType?: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the public URL
    return `${process.env.NEXT_PUBLIC_MINIO_URL}/${bucket}/${key}`;
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Delete a file from MinIO
 */
export async function deleteFile(bucket: string, key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Generate a presigned URL for temporary access (for private files)
 */
export async function getPresignedUrl(
  bucket: string,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

/**
 * Upload project image
 */
export async function uploadProjectImage(
  projectId: string,
  file: Buffer,
  contentType: string,
  index?: number
): Promise<string> {
  const bucket = process.env.MINIO_BUCKET_PROJECTS || 'project-images';
  const extension = contentType.split('/')[1] || 'jpg';
  const key = index !== undefined
    ? `${projectId}/gallery-${index}-${Date.now()}.${extension}`
    : `${projectId}/main-${Date.now()}.${extension}`;

  return uploadFile(bucket, key, file, contentType);
}

/**
 * Upload employee avatar
 */
export async function uploadEmployeeAvatar(
  employeeId: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const bucket = process.env.MINIO_BUCKET_EMPLOYEES || 'employee-avatars';
  const extension = contentType.split('/')[1] || 'jpg';
  const key = `${employeeId}-${Date.now()}.${extension}`;

  return uploadFile(bucket, key, file, contentType);
}

/**
 * Upload document (invoice, receipt, etc.)
 */
export async function uploadDocument(
  type: string,
  id: string,
  file: Buffer,
  contentType: string,
  originalName: string
): Promise<string> {
  const bucket = process.env.MINIO_BUCKET_DOCUMENTS || 'documents';
  const extension = originalName.split('.').pop() || 'pdf';
  const key = `${type}/${id}-${Date.now()}.${extension}`;

  return uploadFile(bucket, key, file, contentType);
}

/**
 * Delete file from URL
 */
export async function deleteFileFromUrl(url: string): Promise<void> {
  try {
    // Extract bucket and key from URL
    // URL format: http://domain:port/bucket/key
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 2) {
      throw new Error('Invalid file URL');
    }

    const bucket = pathParts[0];
    const key = pathParts.slice(1).join('/');

    await deleteFile(bucket, key);
  } catch (error) {
    console.error('Error deleting file from URL:', error);
    throw error;
  }
}

export default s3Client;
