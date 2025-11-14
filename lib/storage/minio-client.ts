/**
 * Storage Configuration and Client
 * S3-compatible storage (Cloudflare R2)
 */

import * as Minio from 'minio';

// Storage Configuration from environment variables
// Now using Cloudflare R2 (S3-compatible)
const minioConfig = {
  endPoint: process.env.MINIO_ENDPOINT || process.env.CLOUDFLARE_R2_ENDPOINT?.replace('https://', '') || 'your-server-ip',
  port: parseInt(process.env.MINIO_PORT || '443'),
  useSSL: process.env.MINIO_USE_SSL === 'true' || true,
  accessKey: process.env.MINIO_ACCESS_KEY || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
  secretKey: process.env.MINIO_SECRET_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
};

// Default bucket name
export const DEFAULT_BUCKET = process.env.MINIO_BUCKET || 'bimaided';

// Initialize MinIO client
let minioClient: Minio.Client | null = null;

export function getMinioClient(): Minio.Client {
  if (!minioClient) {
    minioClient = new Minio.Client(minioConfig);
    console.log('MinIO client initialized:', {
      endpoint: minioConfig.endPoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
    });
  }
  return minioClient;
}

/**
 * Initialize MinIO bucket if it doesn't exist
 */
export async function ensureBucket(bucketName: string = DEFAULT_BUCKET): Promise<boolean> {
  try {
    const client = getMinioClient();
    const exists = await client.bucketExists(bucketName);
    
    if (!exists) {
      await client.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket "${bucketName}" created successfully`);
      
      // Set bucket policy to public read for public files
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/public/*`],
          },
        ],
      };
      
      await client.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`Bucket policy set for public access`);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring bucket:', error);
    return false;
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(
  bucketName: string,
  objectName: string
): string {
  // Use Cloudflare R2 public dev URL if available
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/${objectName}`;
  }
  
  // Fallback to direct endpoint URL
  const protocol = minioConfig.useSSL ? 'https' : 'http';
  const port = minioConfig.useSSL && minioConfig.port === 443 ? '' : `:${minioConfig.port}`;
  return `${protocol}://${minioConfig.endPoint}${port}/${bucketName}/${objectName}`;
}

/**
 * Generate presigned URL for private file access
 */
export async function getPresignedUrl(
  bucketName: string,
  objectName: string,
  expirySeconds: number = 3600
): Promise<string> {
  const client = getMinioClient();
  return await client.presignedGetObject(bucketName, objectName, expirySeconds);
}

export { minioClient };
