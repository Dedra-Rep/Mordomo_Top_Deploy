import { InputContext, Locale, GroundingSource } from "../types.js";

export class GeminiService {
  async getRecommendations(context: InputContext): Promise<{ text: string; OUTPUT: any; sources: GroundingSource[] }> {
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || `API error: ${response.status}`);
      }
      return data;
    } catch (e: any) {
      console.error("Mordomo Frontend Failure:", e.message || String(e));
      const isBR = context.locale === 'pt-BR';
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
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, locale })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error("Speak error from server:", data);
        return null;
      }

      const { audio } = await response.json();
      if (!audio) return null;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      return await this.decodeAudioData(this.decode(audio), ctx, 24000, 1);
    } catch (e) {
      console.error("Mordomo Speak Execution Error:", e);
      return null;
    }
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
