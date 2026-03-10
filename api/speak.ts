import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, locale } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing text parameter' });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
            return res.status(500).json({ error: 'No audio generated' });
        }

        return res.status(200).json({ audio: base64Audio });
    } catch (e) {
        console.error("Mordomo Speak Execution Error:", e);
        return res.status(500).json({ error: 'Internal Server Error generating speech' });
    }
}
