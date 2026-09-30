import type { ProviderId, ProviderMeta } from 'unillm-sdk/browser';
import { PROVIDERS } from 'unillm-sdk/browser';

export interface Color {
  hex: string;
  name: string;
}

export interface Palette {
  id: string;
  name: string;
  description: string;
  colors: string[];
  tags?: string[];
}

export type ViewState = 'home' | 'create' | 'extract' | 'settings';

export type PreviewStyle = 'poetic' | 'ecommerce' | 'blog' | 'portfolio' | 'dashboard';

export type ModelProvider = ProviderId;

export interface ModelConfig {
  provider: ModelProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export const MODEL_PROVIDERS = Object.fromEntries(
  PROVIDERS.map((provider) => [provider.id, provider]),
) as Record<ModelProvider, ProviderMeta>;
