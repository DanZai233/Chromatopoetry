import {
  createLLM,
  isLLMError,
  normalizeProviderId,
  type ChatMessage,
  type ProviderConfig,
} from 'unillm-sdk/browser';
import { MODEL_PROVIDERS, ModelConfig, Palette, PreviewStyle } from '../types';

const FALLBACK_PROVIDER: ModelConfig['provider'] = 'gemini';
const envProvider = normalizeProviderId(import.meta.env.VITE_UNILLM_PROVIDER) || FALLBACK_PROVIDER;
const envApiKey = import.meta.env.VITE_UNILLM_API_KEY
  || import.meta.env.VITE_GEMINI_API_KEY
  || process.env.API_KEY
  || '';

const createDefaultConfig = (): ModelConfig => ({
  provider: envProvider,
  apiKey: envApiKey,
  baseUrl: import.meta.env.VITE_UNILLM_BASE_URL || '',
  model: import.meta.env.VITE_UNILLM_MODEL || MODEL_PROVIDERS[envProvider].defaultModels[0] || '',
});

const normalizeModelConfig = (value: unknown): ModelConfig => {
  const raw = value && typeof value === 'object'
    ? value as Omit<Partial<ModelConfig>, 'provider'> & {
        provider?: unknown;
        useNativeApi?: boolean;
      }
    : {};

  // 兼容旧版本保存的 OpenRouter 配置，迁移到 UniLLM 的自定义 OpenAI 兼容入口。
  if (raw.provider === 'openrouter') {
    return {
      provider: 'custom',
      apiKey: typeof raw.apiKey === 'string' ? raw.apiKey : '',
      baseUrl: raw.baseUrl || 'https://openrouter.ai/api/v1',
      model: raw.model || 'anthropic/claude-3.5-sonnet',
    };
  }

  const provider = normalizeProviderId(
    typeof raw.provider === 'string' ? raw.provider : undefined,
  ) || FALLBACK_PROVIDER;
  return {
    provider,
    apiKey: typeof raw.apiKey === 'string' ? raw.apiKey : '',
    baseUrl: typeof raw.baseUrl === 'string' ? raw.baseUrl : '',
    model: typeof raw.model === 'string' && raw.model.trim()
      ? raw.model.trim()
      : MODEL_PROVIDERS[provider].defaultModels[0] || '',
  };
};

let currentConfig = normalizeModelConfig(createDefaultConfig());
let configRevision = 0;

export const setModelConfig = (config: ModelConfig) => {
  currentConfig = normalizeModelConfig(config);
  configRevision += 1;
};

export const getModelConfig = (): ModelConfig => ({ ...currentConfig });

export const parseStoredModelConfig = (value: unknown): ModelConfig | null => {
  if (!value || typeof value !== 'object') return null;
  return normalizeModelConfig(value);
};

const toProviderConfig = (config: ModelConfig): ProviderConfig => ({
  provider: config.provider,
  apiKey: config.apiKey.trim() || undefined,
  baseUrl: config.baseUrl?.trim() || undefined,
  model: config.model?.trim() || undefined,
  temperature: 0.75,
  maxTokens: 4096,
  timeoutMs: 90_000,
  retries: 2,
});

const createClient = () => createLLM(toProviderConfig(currentConfig));

const STYLE_PROMPTS: Record<PreviewStyle, string> = {
  poetic: 'Artistic, Minimalist, and Poetic Landing Page. High-end, ample whitespace, serif typography, floating elements, abstract composition.',
  ecommerce: "Modern E-commerce Product Page. Clean product cards, 'Add to Cart' buttons, price tags, featured product hero, shopping bag icon.",
  blog: 'Typography-focused Blog Post or Magazine Layout. Large article header, readable body text, sidebar with tags, comment section styling.',
  portfolio: 'Creative Portfolio/Gallery. Masonry or grid image layout, hover effects, large hero statement, project showcase cards.',
  dashboard: 'SaaS Analytics Dashboard. Sidebar navigation, data cards/widgets, stats (simulated with CSS), data tables, user profile.',
};

const PALETTE_SYSTEM_PROMPT = [
  '你是一位精通中国传统色彩美学与诗词意境的色彩设计师。',
  '只返回合法 JSON，不要 Markdown 代码围栏，不要补充解释。',
  '颜色必须是标准六位十六进制值，且每组严格为 5 个颜色。',
].join('\n');

const toRecord = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
);

const normalizeHex = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;

  const raw = match[1];
  const expanded = raw.length === 3
    ? raw.split('').map((char) => `${char}${char}`).join('')
    : raw;
  return `#${expanded.toUpperCase()}`;
};

const normalizeColors = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(normalizeHex).filter((color): color is string => Boolean(color)))].slice(0, 5);
};

const buildPalette = (
  value: unknown,
  idPrefix: string,
  index = 0,
): Palette | null => {
  const record = toRecord(value);
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const description = typeof record.description === 'string' ? record.description.trim() : '';
  const colors = normalizeColors(record.colors);

  if (!name || !description || colors.length !== 5) return null;
  return {
    id: `${idPrefix}-${Date.now()}-${index}`,
    name,
    description,
    colors,
  };
};

const parseImageDataUrl = (value: string): { base64: string; mimeType: string } => {
  const match = value.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (match) {
    const mimeType = match[1].toLowerCase();
    return {
      mimeType: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType,
      base64: match[2],
    };
  }

  return {
    mimeType: 'image/png',
    base64: value.replace(/^data:image\/[a-z0-9.+-]+;base64,/i, ''),
  };
};

const buildPreviewCacheKey = (palette: Palette, style: PreviewStyle) => [
  configRevision,
  palette.id,
  style,
  palette.colors.join(','),
].join(':');

const previewCache = new Map<string, string>();
const MAX_PREVIEW_CACHE_SIZE = 24;

export const generatePalettesFromText = async (prompt: string): Promise<Palette[]> => {
  const client = createClient();
  const messages: ChatMessage[] = [
    { role: 'system', content: PALETTE_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `
根据下面的描述生成 3 组风格明显不同的配色，每组严格包含 5 个颜色：
"""${prompt.trim()}"""

每组包含：
- name：4 到 6 个汉字的诗意名称
- description：一句精炼的中文意境描述
- colors：5 个标准六位十六进制颜色

返回结构：
{
  "palettes": [
    {
      "name": "雨过天青",
      "description": "雨后天空初霁，清透而安静。",
      "colors": ["#DCEBF1", "#8FB8C9", "#4F7C8A", "#294C60", "#F4F1DE"]
    }
  ]
}
      `,
    },
  ];

  const payload = toRecord(await client.generateJson(messages));
  const palettes = Array.isArray(payload.palettes)
    ? payload.palettes
        .map((item, index) => buildPalette(item, 'gen-text', index))
        .filter((palette): palette is Palette => Boolean(palette))
        .slice(0, 3)
    : [];

  if (palettes.length === 0) {
    throw new Error('模型未返回有效的配色数据');
  }
  return palettes;
};

export const extractPaletteFromImage = async (
  base64Image: string,
  options: { signal?: AbortSignal } = {},
): Promise<Palette> => {
  const client = createClient();
  const image = parseImageDataUrl(base64Image);
  const messages: ChatMessage[] = [
    { role: 'system', content: PALETTE_SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `
分析这张图片，提取最能代表画面气质的 5 个主色，并生成一组配色。

要求：
- name：4 到 6 个汉字，贴合画面意境
- description：一句精炼的中文描述
- colors：严格 5 个标准六位十六进制颜色

返回结构：
{
  "name": "山岚暮色",
  "description": "暮色漫过远山，沉静中带着微光。",
  "colors": ["#1F2933", "#52606D", "#9AA5B1", "#D6A46B", "#F5E6CA"]
}
          `,
        },
        {
          type: 'image',
          base64: image.base64,
          mimeType: image.mimeType,
        },
      ],
    },
  ];

  const palette = buildPalette(await client.generateJson(messages, {
    signal: options.signal,
  }), 'gen-img');
  if (!palette) {
    throw new Error('模型未返回有效的图片配色数据');
  }
  return palette;
};

export const generateWebsitePreview = async (
  palette: Palette,
  style: PreviewStyle = 'poetic',
  options: { signal?: AbortSignal } = {},
): Promise<string> => {
  const cacheKey = buildPreviewCacheKey(palette, style);
  const cached = previewCache.get(cacheKey);
  if (cached) return cached;

  const client = createClient();
  const styleInstruction = STYLE_PROMPTS[style];
  const prompt = `
你是一位擅长高级视觉表达的 UI/UX 设计师。
请创建一份单文件 HTML 页面，并通过 CDN 引入 Tailwind CSS，演示以下配色在实际网站中的应用。

配色名称："${palette.name}"
配色描述："${palette.description}"
配色值：${JSON.stringify(palette.colors)}
目标风格：${style}
布局要求：${styleInstruction}

约束：
1. 背景、文字、按钮、边框和强调色优先严格使用给定色值，仅在对比度不足时使用黑白。
2. 使用 Google Fonts 引入 Noto Serif SC 与 Inter，建立清晰的中英文字体层级。
3. 中文文案要贴合当前页面类型，并保持与配色一致的叙事气质。
4. 输出可直接运行的完整 HTML，不引用本地资源。
5. 只返回 JSON，不要 Markdown 代码围栏。

返回结构：
{
  "html": "<!DOCTYPE html>..."
}
  `;

  const payload = toRecord(await client.generateJson(prompt, {
    temperature: 0.8,
    maxTokens: 8192,
    signal: options.signal,
  }));
  const html = typeof payload.html === 'string' ? payload.html.trim() : '';
  if (!html) {
    throw new Error('模型未返回有效的预览页面');
  }

  if (previewCache.size >= MAX_PREVIEW_CACHE_SIZE) {
    const oldestKey = previewCache.keys().next().value;
    if (oldestKey) previewCache.delete(oldestKey);
  }
  previewCache.set(cacheKey, html);
  return html;
};

export const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException
    ? error.name === 'AbortError'
    : error instanceof Error && error.name === 'AbortError';
};

export const getAIErrorMessage = (error: unknown, fallback: string): string => {
  if (isLLMError(error)) {
    if (error.status === 401 || error.status === 403) {
      return 'API 密钥无效或没有访问权限，请在设置中检查后重试。';
    }
    if (error.status === 429) {
      return '请求过于频繁或额度不足，请稍后再试。';
    }
    if (error.code === 'TIMEOUT') {
      return '模型响应超时，请稍后重试或更换更快的模型。';
    }
    return error.message ? `${fallback}：${error.message}` : fallback;
  }

  if (error instanceof Error && error.message) {
    return `${fallback}：${error.message}`;
  }
  return fallback;
};
