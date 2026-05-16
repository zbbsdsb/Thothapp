import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Uploads an audio file to Firebase Storage.
 * @param audioBlob The audio blob to upload
 * @param fileName The name of the file
 * @returns A Promise that resolves to the URL of the uploaded file
 */
export const uploadToFirebaseStorage = async (audioBlob: Blob, fileName: string): Promise<string> => {
  try {
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, audioBlob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    throw error;
  }
};
