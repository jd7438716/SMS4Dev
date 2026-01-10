import { GoogleGenAI, Type } from "@google/genai";
import { SmsMessage } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

/**
 * Generates realistic mock SMS traffic for testing.
 */
export const generateMockSms = async (count: number = 3): Promise<Partial<SmsMessage>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} realistic SMS messages for a developer testing tool. 
      Include a mix of types: OTP codes (authentication), Delivery notifications (transactional), 
      Marketing offers (promotional).
      
      Return a JSON array of objects with these exact keys:
      - from: string (phone number or sender ID)
      - to: string (phone number)
      - body: string (the message content)
      - direction: "inbound"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              from: { type: Type.STRING },
              to: { type: Type.STRING },
              body: { type: Type.STRING },
              direction: { type: Type.STRING },
            },
            required: ["from", "to", "body", "direction"],
          },
        },
      },
    });

    const rawData = response.text;
    if (!rawData) return [];
    
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Failed to generate mock SMS:", error);
    return [];
  }
};
