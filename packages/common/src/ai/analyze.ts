import { GoogleGenAI } from "@google/genai";
import { DreamAnalysis } from "../index";

/**
 * Analyzes a dream transcript and returns structured analysis results.
 * @param transcript The dream transcript to analyze
 * @returns A Promise that resolves to the dream analysis
 */
export const analyzeDream = async (transcript: string): Promise<DreamAnalysis> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not set");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this dream transcript.
      1. Extract 3-5 key imagery tags (single words).
      2. Provide a short, poetic psychological insight (max 2 sentences).
      3. Provide a mystical "divine oracle" sentence (similar to Tarot or ancient scripts, cryptic but profound).
      Return as JSON: { "tags": ["tag1", "tag2"], "insight": "...", "divine_oracle": "..." }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      // Fallback if JSON parsing fails
      return {
        tags: ["mystery", "subconscious"],
        insight: "The mind weaves patterns beyond immediate comprehension.",
        divine_oracle: "The gate is open, yet you remain on the threshold."
      };
    }
  } catch (error) {
    console.error("Error analyzing dream:", error);
    // Return fallback analysis if API call fails
    return {
      tags: ["mystery", "subconscious"],
      insight: "The mind weaves patterns beyond immediate comprehension.",
      divine_oracle: "The gate is open, yet you remain on the threshold."
    };
  }
};
