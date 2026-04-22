import { GoogleGenAI } from "@google/genai";

/**
 * Transcribes audio content to text using the Gemini API.
 * @param audioBlob The audio blob to transcribe
 * @returns A Promise that resolves to the transcribed text
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not set");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Convert blob to base64
    const reader = new FileReader();
    const base64Audio = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    const mimeType = audioBlob.type || 'audio/webm';

    const transcriptionRes = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { text: "Transcribe this dream accurately." },
          { 
            inlineData: { 
              mimeType, 
              data: base64Audio 
            } 
          }
        ]
      }]
    });

    return transcriptionRes.text || "No transcription available.";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return "Transcription failed. Please try again.";
  }
};
