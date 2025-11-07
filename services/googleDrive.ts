import { google } from 'googleapis';

// Service Account credentials
// Replace these with your actual service account details from the JSON file
const GOOGLE_DRIVE_CREDENTIALS = {
  type: "service_account",
  project_id: import.meta.env.VITE_GOOGLE_PROJECT_ID,
  private_key_id: import.meta.env.VITE_GOOGLE_PRIVATE_KEY_ID,
  private_key: import.meta.env.VITE_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: import.meta.env.VITE_GOOGLE_CLIENT_EMAIL,
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: import.meta.env.VITE_GOOGLE_CERT_URL,
};

const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

// Initialize Google Drive API
const initializeDrive = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_DRIVE_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
};

/**
 * Upload a file to Google Drive
 * @param file - The file to upload
 * @param employeeName - Name of the employee (for organizing files)
 * @param leaveRequestId - ID of the leave request
 * @returns Object with file ID and web view link
 */
export const uploadToGoogleDrive = async (
  file: File,
  employeeName: string,
  leaveRequestId: string
): Promise<{ fileId: string; webViewLink: string }> => {
  try {
    const drive = initializeDrive();

    // Create employee subfolder if it doesn't exist
    const employeeFolderId = await createEmployeeFolder(employeeName);

    // Prepare file metadata
    const fileMetadata = {
      name: `${leaveRequestId}_${file.name}`,
      parents: [employeeFolderId],
    };

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const media = {
      mimeType: file.type,
      body: Buffer.from(buffer),
    };

    // Upload file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // Make file accessible to anyone with the link
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      fileId: response.data.id!,
      webViewLink: response.data.webViewLink!,
    };
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw new Error('Failed to upload file to Google Drive');
  }
};

/**
 * Create or get employee subfolder
 */
const createEmployeeFolder = async (employeeName: string): Promise<string> => {
  const drive = initializeDrive();

  // Check if folder exists
  const response = await drive.files.list({
    q: `name='${employeeName}' and '${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Create folder if it doesn't exist
  const folderMetadata = {
    name: employeeName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [FOLDER_ID],
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  return folder.data.id!;
};

/**
 * Delete a file from Google Drive
 * @param fileId - ID of the file to delete
 */
export const deleteFromGoogleDrive = async (fileId: string): Promise<void> => {
  try {
    const drive = initializeDrive();
    await drive.files.delete({
      fileId: fileId,
    });
  } catch (error) {
    console.error('Error deleting from Google Drive:', error);
    throw new Error('Failed to delete file from Google Drive');
  }
};

/**
 * Get file details from Google Drive
 * @param fileId - ID of the file
 */
export const getFileFromGoogleDrive = async (fileId: string) => {
  try {
    const drive = initializeDrive();
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, webViewLink, webContentLink',
    });
    return response.data;
  } catch (error) {
    console.error('Error getting file from Google Drive:', error);
    throw new Error('Failed to get file from Google Drive');
  }
};
