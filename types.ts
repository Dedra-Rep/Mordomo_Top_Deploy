
export enum MascotState {
  IDLE = 'idle',
  THINKING = 'thinking',
  SPEAKING = 'speaking',
  LISTENING = 'listening'
}

export enum UserRole {
  CUSTOMER = 'customer',
  TOP = 'top'
}

export type Locale = 'en-US' | 'pt-BR';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Recommendation {
  rank: number;
  label: string;
  platform: "ebay" | "amazon";
  title: string;
  why: string[];
  target_url: string;
  cta_text: string;
  price_estimate?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  recommendations?: Recommendation[];
  sources?: GroundingSource[];
}

export interface InputContext {
  query: string;
  tenant: string;
  user_id: string;
  source: string;
  locale: Locale;
  market: string;
  currency: string;
}
