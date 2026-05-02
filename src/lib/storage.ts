import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { uploadToR2 } from './r2';

export async function uploadAudio(
  audioBlob: Blob,
  fileName: string,
  mimeType: string
): Promise<string> {
  // Try R2 first
  try {
    const publicUrl = await uploadToR2(audioBlob, fileName, mimeType);
    console.log('Uploaded to R2:', publicUrl);
    return publicUrl;
  } catch (r2Error) {
    // Fallback to Firebase Storage
    console.warn('R2 upload failed, falling back to Firebase Storage:', r2Error);
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, audioBlob);
    return await getDownloadURL(storageRef);
  }
}

export function buildAudioFileName(userId: string, dreamId: string): string {
  return `dreams/${userId}/${dreamId}.webm`;
}

export function audioToBase64(audioBlob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
  });
}
