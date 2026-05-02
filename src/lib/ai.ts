import { GoogleGenAI } from '@google/genai';
import { DreamAnalysis } from '../types';

export function createAI(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

export async function transcribeAudio(
  apiKey: string,
  base64Audio: string,
  mimeType: string
): Promise<string> {
  const ai = createAI(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { text: 'Transcribe this dream accurately.' },
          { inlineData: { mimeType, data: base64Audio } },
        ],
      },
    ],
  });
  return response.text || 'No transcription available.';
}

export async function analyzeDream(
  apiKey: string,
  transcript: string
): Promise<DreamAnalysis> {
  const ai = createAI(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this dream transcript.
1. Extract 3-5 key imagery tags (single words).
2. Provide a short, poetic psychological insight (max 2 sentences).
3. Provide a mystical "divine oracle" sentence (similar to Tarot or ancient scripts, cryptic but profound).
Return as JSON: { "tags": ["tag1", "tag2"], "insight": "...", "divine_oracle": "..." }`,
    config: {
      responseMimeType: 'application/json',
    },
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch {
    return {
      tags: ['mystery', 'subconscious'],
      insight: 'The mind weaves patterns beyond immediate comprehension.',
      divine_oracle: 'The gate is open, yet you remain on the threshold.',
    };
  }
}
