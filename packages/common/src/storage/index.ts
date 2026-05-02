import { uploadToR2 } from './r2';
import { uploadToFirebaseStorage } from './firebase';

/**
 * Uploads an audio file to storage, trying Cloudflare R2 first and falling back to Firebase Storage.
 * @param audioBlob The audio blob to upload
 * @param fileName The name of the file
 * @returns A Promise that resolves to the URL of the uploaded file
 */
export const uploadAudio = async (audioBlob: Blob, fileName: string): Promise<string> => {
  try {
    const mimeType = audioBlob.type || 'audio/webm';
    // Try R2 first
    return await uploadToR2(audioBlob, fileName, mimeType);
  } catch (r2Error) {
    console.warn("R2 upload failed, falling back to Firebase Storage:", r2Error);
    // Fallback to Firebase Storage
    return await uploadToFirebaseStorage(audioBlob, fileName);
  }
};

export { uploadToR2, uploadToFirebaseStorage };
