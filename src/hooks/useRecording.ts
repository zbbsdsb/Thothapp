import { useState, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { uploadAudio, buildAudioFileName, audioToBase64 } from '../lib/storage';
import { transcribeAudio, analyzeDream } from '../lib/ai';
import type { UserProfile, Dream } from '../types';

interface UseRecordingOptions {
  userId: string | undefined;
  profile: UserProfile | null;
  userCountry: string | null;
  hasUserKey: boolean;
  onDreamAdded?: () => void;
  onRecordingStart?: () => void;
  addDream?: (fields: Omit<Dream, 'id' | 'user_id' | 'created_at'>) => Promise<string>;
}

export function useRecording({
  userId,
  profile,
  userCountry,
  hasUserKey,
  onDreamAdded,
  onRecordingStart,
  addDream,
}: UseRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/wav';
      mediaRecorder.current = new MediaRecorder(stream, { mimeType });
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        await processRecording(audioBlob, mimeType);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      onRecordingStart?.();
    } catch {
      toast.error('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach((t) => t.stop());
    }
  };

  const processRecording = async (audioBlob: Blob, mimeType: string) => {
      if (!userId || !profile || !addDream) return;

      const today = new Date().toISOString().split('T')[0];
      const isNewDay = profile.last_usage_date !== today;
      const currentUsage = isNewDay ? 0 : profile.daily_usage_count;
      const isUsingPublicQuota = !hasUserKey;

      if (isUsingPublicQuota && currentUsage >= profile.daily_quota_limit) {
        toast.error('Daily quota reached. Please add your own API key.');
        return;
      }

      setIsTranscribing(true);
      // 使用用户自己的 Gemini key，或 fallback 到公共 key
      const apiKey = profile.external_apis?.gemini || import.meta.env.VITE_GEMINI_API_KEY as string;

      try {
        // First, add dream to Firestore to get the document ID
        const tempId = Math.random().toString(36).substring(7);
        const audioUrl = await uploadAudio(
          audioBlob,
          buildAudioFileName(userId, tempId),
          mimeType
        );
        const base64Audio = await audioToBase64(audioBlob);
        const transcript = await transcribeAudio(apiKey, base64Audio, mimeType);
        const { tags, insight, divine_oracle } = await analyzeDream(apiKey, transcript);

        // Add to Firestore (this will generate the real document ID)
        const dreamId = await addDream({
          transcript,
          audio_url: audioUrl,
          tags,
          insight,
          divine_oracle,
          location: userCountry || 'Unknown',
        });

        onDreamAdded?.();
        toast.success('Dream archived successfully.');
      } catch (err) {
        console.error('Recording processing error:', err);
        if (err instanceof Error && !err.message.includes('Firestore Error')) {
          toast.error('Failed to process dream.');
        }
      } finally {
        setIsTranscribing(false);
      }
  };

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    processRecording,
  };
}
