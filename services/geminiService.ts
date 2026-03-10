
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Recommendation, InputContext, Locale, GroundingSource } from "../types";
import { REGION_CONFIGS } from "../constants";

export class GeminiService {
  private getClient() {
    return new GoogleGenAI({ apiKey: "AIzaSyDhNegMvpCXnOSnr_GvWGsIa6svKRRFYic" });
  }

  async getRecommendations(context: InputContext): Promise<{ text: string; OUTPUT: any; sources: GroundingSource[] }> {
    const ai = this.getClient();
    const config = REGION_CONFIGS[context.locale];

    const isBR = context.locale === 'pt-BR';

    const systemInstruction = `
      You are the "Mordomo.AI Elite Shopping Engine".
      Your role is to act as a world-class personal shopper for the ${config.countryName} market.

      CRITICAL DELIVERY RULE:
      - You MUST ALWAYS provide EXACTLY 3 product recommendations.
      - The delivery MUST be a JSON object containing an 'OUTPUT' key with a 'recommendations' array of 3 items.

      ${isBR ? `
      BRAZIL MARKET SPECIFICATIONS (pt-BR):
      1. PLATFORM: Recommend items from Amazon.com.br ONLY.
      2. AFFILIATE LINKS: Construct the target_url using this template:
         https://www.amazon.com.br/s?k={PRODUCT_KEYWORDS}&tag=${config.amazonId}
      3. PRICING: Provide estimated prices in BRL (R$).
      4. LANGUAGE: Your response 'text' and all fields in the JSON MUST be in PORTUGUESE (pt-BR).
      ` : `
      USA MARKET SPECIFICATIONS (en-US):
      1. PLATFORM: Recommend items from eBay.com ONLY.
      2. AFFILIATE LINKS: Construct the target_url using this template:
         https://www.ebay.com/sch/i.html?_nkw={PRODUCT_KEYWORDS}&mkrid=711-53200-19255-0&campid=${config.ebayId}&toolid=10001
      3. PRICING: Provide estimated prices in USD ($).
      4. LANGUAGE: Your response 'text' and all fields in the JSON MUST be in ENGLISH.
      `}

      TONE:
      - Sophisticated, professional British butler (speaking the appropriate language).
      - Concisely explain why these choices represent the best value/quality.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: context.query,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Elegant butler introduction." },
              OUTPUT: {
                type: Type.OBJECT,
                properties: {
                  recommendations: {
                    type: Type.ARRAY,
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        rank: { type: Type.NUMBER },
                        label: { type: Type.STRING },
                        platform: { type: Type.STRING, enum: ["ebay", "amazon"] },
                        title: { type: Type.STRING },
                        price_estimate: { type: Type.STRING },
                        why: { type: Type.ARRAY, items: { type: Type.STRING } },
                        target_url: { type: Type.STRING },
                        cta_text: { type: Type.STRING }
                      },
                      required: ["rank", "label", "platform", "title", "price_estimate", "why", "target_url", "cta_text"]
                    }
                  }
                },
                required: ["recommendations"]
              }
            },
            required: ["text", "OUTPUT"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');

      const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(chunk => chunk.web)
        .map(chunk => ({ title: chunk.web!.title || "", uri: chunk.web!.uri || "" })) || [];

      return { ...result, sources };
    } catch (e) {
      console.error("Mordomo Engine Failure:", e);
      const errorText = isBR ? "Peço mil desculpas, senhor. Encontrei uma instabilidade nos dados do mercado brasileiro. Podemos tentar novamente?" : "I deeply apologize, sir. I encountered a momentary disruption in the market data feed. Shall we re-examine your request?";
      return {
        text: errorText,
        OUTPUT: { recommendations: [] },
        sources: []
      };
    }
  }

  async speak(text: string, locale: Locale): Promise<AudioBuffer | null> {
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return null;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      return await this.decodeAudioData(this.decode(base64Audio), ctx, 24000, 1);
    } catch { return null; }
  }

  private decode(b64: string): Uint8Array {
    const s = atob(b64);
    const b = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, rate: number, chans: number): Promise<AudioBuffer> {
    const i16 = new Int16Array(data.buffer);
    const len = i16.length / chans;
    const buf = ctx.createBuffer(chans, len, rate);
    for (let c = 0; c < chans; c++) {
      const cd = buf.getChannelData(c);
      for (let i = 0; i < len; i++) cd[i] = i16[i * chans + c] / 32768.0;
    }
    return buf;
  }
}

export const geminiService = new GeminiService();
