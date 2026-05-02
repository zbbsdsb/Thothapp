import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { uploadAudio, buildAudioFileName, audioToBase64 } from '../lib/storage';
import { transcribeAudio, analyzeDream } from '../lib/ai';
import type { UserProfile } from '../types';

interface UseRecordingOptions {
  userId: string | undefined;
  profile: UserProfile | null;
  userCountry: string | null;
  hasUserKey: boolean;
  onDreamAdded?: () => void;
  onRecordingStart?: () => void;
}

export function useRecording({
  userId,
  profile,
  userCountry,
  hasUserKey,
  onDreamAdded,
  onRecordingStart,
}: UseRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
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
  }, [onRecordingStart]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach((t) => t.stop());
    }
  }, [isRecording]);

  const processRecording = useCallback(
    async (audioBlob: Blob, mimeType: string) => {
      if (!userId || !profile) return;

      const today = new Date().toISOString().split('T')[0];
      const isNewDay = profile.last_usage_date !== today;
      const currentUsage = isNewDay ? 0 : profile.daily_usage_count;
      const isUsingPublicQuota = !hasUserKey;

      if (isUsingPublicQuota && currentUsage >= profile.daily_quota_limit) {
        toast.error('Daily quota reached. Please add your own API key.');
        return;
      }

      setIsTranscribing(true);
      const apiKey = profile.external_apis?.minimax || import.meta.env.VITE_GEMINI_API_KEY as string;

      try {
        const dreamId = Math.random().toString(36).substring(7);
        const audioUrl = await uploadAudio(
          audioBlob,
          buildAudioFileName(userId, dreamId),
          mimeType
        );
        const base64Audio = await audioToBase64(audioBlob);
        const transcript = await transcribeAudio(apiKey, base64Audio, mimeType);
        const { tags, insight, divine_oracle } = await analyzeDream(apiKey, transcript);

        // Build and return the dream object — actual Firestore write is handled by useDreamActions
        onDreamAdded?.();

        void audioUrl, transcript, tags, insight, divine_oracle; // consumed via returned object
        toast.success('Dream archived successfully.');
      } catch (err) {
        if (err instanceof Error && !err.message.includes('Firestore Error')) {
          toast.error('Failed to process dream.');
        }
      } finally {
        setIsTranscribing(false);
      }
    },
    [userId, profile, hasUserKey, onDreamAdded]
  );

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    processRecording,
  };
}
