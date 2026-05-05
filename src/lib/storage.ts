import { Capacitor } from '@capacitor/core';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { uploadToR2 } from './r2';

function getPlatform(): string {
  return Capacitor.isNativePlatform() ? 'native' : 'web';
}

export async function uploadAudio(
  audioBlob: Blob,
  fileName: string,
  mimeType: string
): Promise<string> {
  const platform = getPlatform();

  // On native (iOS/Android), skip R2 — no Express server available in Capacitor WebView
  if (platform === 'web') {
    try {
      const publicUrl = await uploadToR2(audioBlob, fileName, mimeType);
      console.log('[storage] Uploaded to R2:', publicUrl);
      return publicUrl;
    } catch (r2Error) {
      console.warn('[storage] R2 upload failed, falling back to Firebase Storage:', r2Error);
    }
  } else {
    console.log('[storage] Native platform detected, using Firebase Storage directly');
  }

  // Fallback / default path: Firebase Storage
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, audioBlob);
  return await getDownloadURL(storageRef);
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
