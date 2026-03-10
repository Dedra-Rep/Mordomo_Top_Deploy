import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import { REGION_CONFIGS } from "../constants.js";
import { InputContext, GroundingSource } from "../types.js";

export const maxDuration = 60; // Extend Vercel timeout for Gemini requests

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log(`[API /recommend] Method: ${req.method} called`);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const context: InputContext = req.body;
        console.log("[API /recommend] Received Payload:", JSON.stringify(context || {}));

        if (!context || !context.query || !context.locale) {
            console.error("[API /recommend] Missing context properties.");
            return res.status(400).json({ error: 'Missing required context fields' });
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("[API /recommend] CRITICAL: API KEY IS MISSING IN ENVIRONMENT VARIABLES.");
            return res.status(500).json({ error: 'Missing API Key configuration on Vercel server. Please add VITE_API_KEY in the Vercel Dashboard.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const config = REGION_CONFIGS[context.locale];

        if (!config) {
            console.error("[API /recommend] Invalid locale:", context.locale);
            return res.status(400).json({ error: 'Invalid locale' });
        }

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

        console.log("[API /recommend] Calling Gemini AI...");

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

        console.log("[API /recommend] Gemini response received successfully.");

        const result = JSON.parse(response.text || '{}');

        const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.filter(chunk => chunk.web)
            .map(chunk => ({ title: chunk.web!.title || "", uri: chunk.web!.uri || "" })) || [];

        return res.status(200).json({ ...result, sources });
    } catch (e: any) {
        console.error("[API /recommend] Mordomo Engine Failure! Full Stack:", e);

        // Instead of hiding the error behind a 200 OK, we explicitly return 500 when something breaks, 
        // so it shows up correctly in Network tabs and Vercel logs.
        const isBR = req.body?.locale === 'pt-BR';
        const errorText = isBR ? "Peço mil desculpas, senhor. Encontrei uma instabilidade nos dados do mercado brasileiro. Podemos tentar novamente?" : "I deeply apologize, sir. I encountered a momentary disruption in the market data feed. Shall we re-examine your request?";

        return res.status(500).json({
            error: 'Internal Server Error',
            message: e.message || String(e),
            fallbackText: errorText
        });
    }
}
