import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage/minio';

/**
 * POST /api/upload-image
 * Upload image to MinIO storage
 * Accepts multipart/form-data with 'file' field
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[Upload API] Starting upload request...');
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || (formData.get('path') as string) || 'public/uploads';

    console.log('[Upload API] File:', file?.name, 'Size:', file?.size, 'Folder:', folder);

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedName}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to MinIO
    console.log('[Upload API] Uploading to R2:', filePath);
    const { data, error } = await uploadFile(filePath, file, {
      'Content-Type': file.type,
      'Content-Disposition': `inline; filename="${sanitizedName}"`,
    });

    if (error) {
      console.error('[Upload API] R2 upload error:', error);
      console.error('[Upload API] Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { success: false, message: 'Failed to upload file to R2 storage', error: error.message || String(error) },
        { status: 500 }
      );
    }

    console.log('[Upload API] Upload successful:', data?.url);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      url: data?.url, // Add top-level url for backward compatibility
      data: {
        url: data?.url,
        path: data?.path,
        fileName: sanitizedName,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error: any) {
    console.error('[Upload API] Unexpected error:', error);
    console.error('[Upload API] Error stack:', error.stack);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file', error: error.message || String(error) },
      { status: 500 }
    );
  }
}
