
import { UserRole, Locale } from './types';

export const REGION_CONFIGS: Record<Locale, {
  market: string;
  currency: string;
  ebayId?: string;
  amazonId?: string;
  countryName: string;
  flagUrl: string;
}> = {
  'en-US': {
    market: 'US',
    currency: 'USD',
    ebayId: '5339136263',
    countryName: 'USA',
    flagUrl: 'https://flagcdn.com/w80/us.png'
  },
  'pt-BR': {
    market: 'BR',
    currency: 'BRL',
    amazonId: 'mordomoai-20',
    countryName: 'Brasil',
    flagUrl: 'https://flagcdn.com/w80/br.png'
  }
};

export const COLORS = {
  acaiDark: '#1a0621',
  acaiMedium: '#2e0854',
  acaiLight: '#4b0082',
  gold: '#fbbf24',
  goldDark: '#d97706',
  textMain: '#f3f4f6',
  [UserRole.CUSTOMER]: {
    butlerSuit: '#2e0854',
    tie: '#fbbf24',
  },
  [UserRole.TOP]: {
    butlerSuit: '#1e293b',
    tie: '#10b981',
  }
};
