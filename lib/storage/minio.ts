/**
 * Storage Operations (Cloudflare R2)
 * S3-compatible storage API that mimics Firebase Storage interface
 * Now using Cloudflare R2 for free cloud storage (10GB + unlimited bandwidth)
 */

import { getMinioClient, DEFAULT_BUCKET, getPublicUrl, ensureBucket } from './minio-client';
import * as Minio from 'minio';
import { Readable } from 'stream';

/**
 * Upload a file to R2 storage
 */
export async function uploadFile(
  path: string,
  file: File | Blob | Buffer,
  metadata?: Record<string, string>,
  bucketName: string = DEFAULT_BUCKET
): Promise<{ data: { url: string; path: string } | null; error: any }> {
  try {
    console.log('[R2] Starting upload:', { path, bucketName, fileType: file.constructor.name });
    
    await ensureBucket(bucketName);
    const client = getMinioClient();

    let buffer: Buffer;
    let size: number;
    let contentType = 'application/octet-stream';

    // Handle different file types
    if (file instanceof File || file instanceof Blob) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      size = buffer.length;
      contentType = file instanceof File ? file.type : 'application/octet-stream';
      console.log('[R2] Converted to buffer:', { size, contentType });
    } else if (Buffer.isBuffer(file)) {
      buffer = file;
      size = buffer.length;
      console.log('[R2] Using buffer directly:', { size });
    } else {
      throw new Error('Unsupported file type');
    }

    // Prepare metadata
    const metaData: Record<string, string> = {
      'Content-Type': contentType,
      ...metadata,
    };

    console.log('[R2] Uploading to bucket:', { bucketName, path, size, metaData });
    
    // Upload to MinIO
    await client.putObject(bucketName, path, buffer, size, metaData);

    // Get public URL
    const url = getPublicUrl(bucketName, path);
    
    console.log('[R2] Upload successful:', { url, path });

    return {
      data: {
        url,
        path,
      },
      error: null,
    };
  } catch (error: any) {
    console.error('[R2] Error uploading file:', error);
    console.error('[R2] Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      region: error.region,
    });
    return { data: null, error };
  }
}

/**
 * Upload a file from stream (for large files)
 */
export async function uploadFileStream(
  path: string,
  stream: Readable,
  size: number,
  contentType?: string,
  metadata?: Record<string, string>,
  bucketName: string = DEFAULT_BUCKET
): Promise<{ data: { url: string; path: string } | null; error: any }> {
  try {
    await ensureBucket(bucketName);
    const client = getMinioClient();

    const metaData: Record<string, string> = {
      'Content-Type': contentType || 'application/octet-stream',
      ...metadata,
    };

    await client.putObject(bucketName, path, stream, size, metaData);

    const url = getPublicUrl(bucketName, path);

    return {
      data: {
        url,
        path,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error uploading stream to MinIO:', error);
    return { data: null, error };
  }
}

/**
 * Get download URL for a file
 */
export async function getFileUrl(
  path: string,
  bucketName: string = DEFAULT_BUCKET,
  usePresigned: boolean = false,
  expirySeconds: number = 3600
): Promise<{ data: string | null; error: any }> {
  try {
    const client = getMinioClient();

    if (usePresigned) {
      // Generate presigned URL for private files
      const url = await client.presignedGetObject(bucketName, path, expirySeconds);
      return { data: url, error: null };
    } else {
      // Return public URL
      const url = getPublicUrl(bucketName, path);
      return { data: url, error: null };
    }
  } catch (error) {
    console.error('Error getting file URL from MinIO:', error);
    return { data: null, error };
  }
}

/**
 * Download file as buffer
 */
export async function downloadFile(
  path: string,
  bucketName: string = DEFAULT_BUCKET
): Promise<{ data: Buffer | null; error: any }> {
  try {
    const client = getMinioClient();
    const stream = await client.getObject(bucketName, path);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return { data: buffer, error: null };
  } catch (error) {
    console.error('Error downloading file from MinIO:', error);
    return { data: null, error };
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  path: string,
  bucketName: string = DEFAULT_BUCKET
): Promise<{ error: any }> {
  try {
    const client = getMinioClient();
    await client.removeObject(bucketName, path);
    return { error: null };
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    return { error };
  }
}

/**
 * Delete multiple files
 */
export async function deleteFiles(
  paths: string[],
  bucketName: string = DEFAULT_BUCKET
): Promise<{ error: any }> {
  try {
    const client = getMinioClient();
    await client.removeObjects(bucketName, paths);
    return { error: null };
  } catch (error) {
    console.error('Error deleting files from MinIO:', error);
    return { error };
  }
}

/**
 * List all files in a directory
 */
export async function listFiles(
  prefix: string = '',
  bucketName: string = DEFAULT_BUCKET
): Promise<{ data: Array<{ name: string; size: number; lastModified: Date }> | null; error: any }> {
  try {
    const client = getMinioClient();
    const stream = client.listObjects(bucketName, prefix, true);

    const files: Array<{ name: string; size: number; lastModified: Date }> = [];
    
    for await (const obj of stream) {
      if (obj.name) {
        files.push({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
        });
      }
    }

    return { data: files, error: null };
  } catch (error) {
    console.error('Error listing files from MinIO:', error);
    return { data: null, error };
  }
}

/**
 * Check if file exists
 */
export async function fileExists(
  path: string,
  bucketName: string = DEFAULT_BUCKET
): Promise<boolean> {
  try {
    const client = getMinioClient();
    await client.statObject(bucketName, path);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(
  path: string,
  bucketName: string = DEFAULT_BUCKET
): Promise<{ data: any | null; error: any }> {
  try {
    const client = getMinioClient();
    const stat = await client.statObject(bucketName, path);
    return { data: stat, error: null };
  } catch (error) {
    console.error('Error getting file metadata from MinIO:', error);
    return { data: null, error };
  }
}

/**
 * Copy a file
 */
export async function copyFile(
  sourcePath: string,
  destinationPath: string,
  sourceBucket: string = DEFAULT_BUCKET,
  destinationBucket: string = DEFAULT_BUCKET
): Promise<{ error: any }> {
  try {
    const client = getMinioClient();
    const conds = new Minio.CopyConditions();
    
    await client.copyObject(
      destinationBucket,
      destinationPath,
      `/${sourceBucket}/${sourcePath}`,
      conds
    );
    
    return { error: null };
  } catch (error) {
    console.error('Error copying file in MinIO:', error);
    return { error };
  }
}
