import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject,
  listAll,
  UploadResult,
  UploadTask,
  StorageReference,
} from 'firebase/storage';
import { storage } from './client';

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  path: string,
  file: File | Blob,
  metadata?: any
): Promise<{ data: { url: string; path: string } | null; error: any }> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const url = await getDownloadURL(snapshot.ref);
    
    return {
      data: {
        url,
        path: snapshot.ref.fullPath,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { data: null, error };
  }
}

/**
 * Upload a file with progress tracking
 */
export function uploadFileResumable(
  path: string,
  file: File | Blob,
  metadata?: any,
  onProgress?: (progress: number) => void
): {
  task: UploadTask;
  promise: Promise<{ data: { url: string; path: string } | null; error: any }>;
} {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  const promise = new Promise<{ data: { url: string; path: string } | null; error: any }>(
    (resolve) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Error uploading file:', error);
          resolve({ data: null, error });
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              data: {
                url,
                path: uploadTask.snapshot.ref.fullPath,
              },
              error: null,
            });
          } catch (error) {
            resolve({ data: null, error });
          }
        }
      );
    }
  );

  return { task: uploadTask, promise };
}

/**
 * Get download URL for a file
 */
export async function getFileUrl(
  path: string
): Promise<{ data: string | null; error: any }> {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return { data: url, error: null };
  } catch (error) {
    console.error('Error getting file URL:', error);
    return { data: null, error };
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string): Promise<{ error: any }> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error };
  }
}

/**
 * List all files in a directory
 */
export async function listFiles(
  path: string
): Promise<{ data: StorageReference[] | null; error: any }> {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return { data: result.items, error: null };
  } catch (error) {
    console.error('Error listing files:', error);
    return { data: null, error };
  }
}

/**
 * Get storage reference
 */
export function getStorageRef(path: string): StorageReference {
  return ref(storage, path);
}
