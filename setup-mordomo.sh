
#!/bin/bash

# Criar pastas
mkdir -p components services

# Criar o arquivo package.json
cat <<EOF > package.json
{
  "name": "mordomo-ai-us",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^1.37.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0"
  }
}
EOF

# Criar o arquivo constants.ts
cat <<EOF > constants.ts
import { UserRole, Locale } from './types';

export const REGION_CONFIGS: Record<Locale, {
  market: string;
  currency: string;
  ebayId: string;
  countryName: string;
  flag: string;
}> = {
  'en-US': {
    market: 'US',
    currency: 'USD',
    ebayId: '5339136263',
    countryName: 'USA',
    flag: '🇺🇸'
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
EOF

echo "✅ Estrutura de pastas e arquivos base criados com sucesso!"
echo "Agora você pode subir esses arquivos para o seu repositório ou Google Cloud."
