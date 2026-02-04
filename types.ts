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

export type ModelProvider = 'gemini' | 'openai' | 'deepseek' | 'openrouter' | 'volcengine';

export interface ModelConfig {
  provider: ModelProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export const MODEL_PROVIDERS: Record<ModelProvider, { name: string; defaultModel: string; baseUrl?: string }> = {
  gemini: { name: 'Gemini (Google)', defaultModel: 'gemini-3-flash-preview' },
  openai: { name: 'OpenAI', defaultModel: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' },
  deepseek: { name: 'DeepSeek', defaultModel: 'deepseek-chat', baseUrl: 'https://api.deepseek.com/v1' },
  openrouter: { name: 'OpenRouter', defaultModel: 'anthropic/claude-3.5-sonnet', baseUrl: 'https://openrouter.ai/api/v1' },
  volcengine: { name: '火山引擎', defaultModel: 'doubao-pro-32k', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3' }
};
