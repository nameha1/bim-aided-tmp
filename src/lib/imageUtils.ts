/**
 * Compress an image file to a target size
 * @param file - The image file to compress
 * @param maxSizeKB - Maximum size in KB (e.g., 500 for 500KB)
 * @param maxWidth - Maximum width of the image
 * @returns Promise<File> - Compressed image file
 */
export const compressImage = async (
  file: File,
  maxSizeKB: number,
  maxWidth: number = 1920
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Start with quality of 0.9 and reduce if needed
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              
              const sizeKB = blob.size / 1024;
              
              if (sizeKB <= maxSizeKB || quality <= 0.1) {
                // Create a new file from the blob
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Reduce quality and try again
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        tryCompress();
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

/**
 * Upload an image to Supabase storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket
 * @returns Promise<string> - Public URL of the uploaded image
 */
export const uploadImage = async (
  file: File,
  bucket: string = 'project-images',
  path: string = ''
): Promise<string> => {
  console.log('Starting upload:', { fileName: file.name, bucket, path, fileSize: file.size });
  
  const { supabase } = await import('@/integrations/supabase/client');
  
  const fileName = `${path}${Date.now()}-${file.name}`;
  console.log('Uploading to:', fileName);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  console.log('Upload result:', { data, error });
  
  if (error) {
    console.error('Upload error details:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  
  console.log('Public URL:', urlData.publicUrl);
  return urlData.publicUrl;
};
