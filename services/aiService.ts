import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { Palette, PreviewStyle, ModelConfig, MODEL_PROVIDERS } from "../types";

const DEFAULT_CONFIG: ModelConfig = {
  provider: 'gemini',
  apiKey: process.env.API_KEY || '',
  model: 'gemini-3-flash-preview'
};

let currentConfig: ModelConfig = { ...DEFAULT_CONFIG };

const PALETTE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    palettes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "A poetic, artistic Chinese name for the palette (max 4-6 chars)" },
          description: { type: Type.STRING, description: "A brief, evocative description of the mood in Chinese" },
          colors: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING, description: "Hex color code" },
            description: "Exactly 5 hex color codes"
          },
        },
        required: ["name", "description", "colors"],
      },
    },
  },
  required: ["palettes"],
};

const SINGLE_PALETTE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    colors: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
    }
  },
  required: ["name", "description", "colors"]
};

export const setModelConfig = (config: ModelConfig) => {
  currentConfig = { ...config };
};

export const getModelConfig = (): ModelConfig => ({ ...currentConfig });

const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: currentConfig.apiKey });
};

const getOpenAIClient = () => {
  const providerInfo = MODEL_PROVIDERS[currentConfig.provider];
  return new OpenAI({
    apiKey: currentConfig.apiKey,
    baseURL: currentConfig.baseUrl || providerInfo.baseUrl,
    dangerouslyAllowBrowser: true
  });
};

const STYLE_PROMPTS: Record<PreviewStyle, string> = {
  poetic: "Artistic, Minimalist, and Poetic Landing Page. High-end, ample whitespace, serif typography, floating elements, abstract composition.",
  ecommerce: "Modern E-commerce Product Page. Clean product cards, 'Add to Cart' buttons, price tags, featured product hero, shopping bag icon.",
  blog: "Typography-focused Blog Post or Magazine Layout. Large article header, readable body text, sidebar with tags, comment section styling.",
  portfolio: "Creative Portfolio/Gallery. Masonry or grid image layout, hover effects, large hero statement, project showcase cards.",
  dashboard: "SaaS Analytics Dashboard. Sidebar navigation, data cards/widgets, stats (simulated with CSS), data tables, user profile."
};

const extractJsonFromResponse = (content: string): any => {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch {
    return null;
  }
};

export const generatePalettesFromText = async (prompt: string): Promise<Palette[]> => {
  const fullPrompt = `
    You are an expert colorist with a deep knowledge of traditional Chinese poetry and aesthetics. 
    Generate 3 distinct color palettes (5 colors each) based on this description: "${prompt}".
    
    For each palette:
    1. Give it a beautiful, poetic Chinese name (e.g., "雨过天青", "层林尽染").
    2. Provide a short, artistic description in Chinese explaining the vibe.
    3. Provide 5 hex color codes.
    
    Return the response as a JSON object with this structure:
    {
      "palettes": [
        {
          "name": "poetic Chinese name",
          "description": "Chinese description",
          "colors": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"]
        }
      ]
    }
  `;

  try {
    if (currentConfig.provider === 'gemini') {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: currentConfig.model || MODEL_PROVIDERS.gemini.defaultModel,
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: PALETTE_RESPONSE_SCHEMA,
        },
      });
      const json = JSON.parse(response.text || "{}");
      return json.palettes?.map((p: any, index: number) => ({
        id: `gen-text-${Date.now()}-${index}`,
        name: p.name,
        description: p.description,
        colors: p.colors,
      })) || [];
    } else {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: currentConfig.model || MODEL_PROVIDERS[currentConfig.provider].defaultModel,
        messages: [{ role: 'user', content: fullPrompt }],
        response_format: { type: "json_object" }
      });
      const content = response.choices[0]?.message?.content || '{}';
      const json = extractJsonFromResponse(content) || {};
      return json.palettes?.map((p: any, index: number) => ({
        id: `gen-text-${Date.now()}-${index}`,
        name: p.name,
        description: p.description,
        colors: p.colors,
      })) || [];
    }
  } catch (error) {
    console.error("Error generating palettes from text:", error);
    throw error;
  }
};

export const extractPaletteFromImage = async (base64Image: string): Promise<Palette> => {
  const fullPrompt = `
    Analyze this image deeply. Extract the 5 most dominant and aesthetically pleasing colors that represent the essence of this image.
    Create a single color palette.
    1. Give it a poetic Chinese name that fits the image content.
    2. Write a short description in Chinese.
    3. Return the 5 hex codes.
    
    Return the response as a JSON object with this structure:
    {
      "name": "poetic Chinese name",
      "description": "Chinese description",
      "colors": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"]
    }
  `;

  try {
    if (currentConfig.provider === 'gemini') {
      const ai = getGeminiClient();
      const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      const response = await ai.models.generateContent({
        model: currentConfig.model || MODEL_PROVIDERS.gemini.defaultModel,
        contents: {
          parts: [
            { inlineData: { mimeType: "image/png", data: cleanBase64 } },
            { text: fullPrompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: SINGLE_PALETTE_SCHEMA,
        },
      });
      const data = JSON.parse(response.text || "{}");
      return {
        id: `gen-img-${Date.now()}`,
        name: data.name || "未命名配色",
        description: data.description || "基于图片生成的灵感配色",
        colors: data.colors || [],
      };
    } else {
      const client = getOpenAIClient();
      const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      const response = await client.chat.completions.create({
        model: currentConfig.model || MODEL_PROVIDERS[currentConfig.provider].defaultModel,
        messages: [
          { 
            role: 'user', 
            content: [
              { type: 'text', text: fullPrompt },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${cleanBase64}` } }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });
      const content = response.choices[0]?.message?.content || '{}';
      const data = extractJsonFromResponse(content) || {};
      return {
        id: `gen-img-${Date.now()}`,
        name: data.name || "未命名配色",
        description: data.description || "基于图片生成的灵感配色",
        colors: data.colors || [],
      };
    }
  } catch (error) {
    console.error("Error extracting palette from image:", error);
    throw error;
  }
};

export const generateWebsitePreview = async (palette: Palette, style: PreviewStyle = 'poetic'): Promise<string> => {
  const styleInstruction = STYLE_PROMPTS[style];
  const prompt = `
    You are a world-class UI/UX designer specializing in high-end, artistic websites.
    Create a single-file HTML landing page (with embedded Tailwind CSS via CDN) that demonstrates the application of this specific color palette:
    
    Palette Name: "${palette.name}"
    Description: "${palette.description}"
    Colors: ${JSON.stringify(palette.colors)}
    Target Style: ${style}
    
    Design Requirements:
    1. **Strictly** use the provided hex codes for backgrounds, typography, buttons, borders, and accents. Do not introduce random new colors (except black/white if absolutely necessary for contrast, but prefer using palette colors).
    2. The design style and layout must follow this description: "${styleInstruction}".
    3. Use a beautiful serif font (like Noto Serif SC) and sans-serif font (Inter) pairing via Google Fonts.
    4. Ensure the text content is in Chinese and matches the poetic/thematic vibe of the palette, but adapted to the context (e.g., if E-commerce, use product names that sound poetic; if Dashboard, use relevant metrics).
    5. Return a JSON object with a single key "html" containing the raw HTML string.
    
    Return the response as a JSON object:
    {
      "html": "raw HTML string"
    }
  `;

  try {
    if (currentConfig.provider === 'gemini') {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: currentConfig.model || MODEL_PROVIDERS.gemini.defaultModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              html: { type: Type.STRING }
            }
          }
        }
      });
      const json = JSON.parse(response.text || "{}");
      return json.html || "<div class='flex items-center justify-center h-screen'><h1>Preview Generation Failed</h1></div>";
    } else {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: currentConfig.model || MODEL_PROVIDERS[currentConfig.provider].defaultModel,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      });
      const content = response.choices[0]?.message?.content || '{}';
      const json = extractJsonFromResponse(content) || {};
      return json.html || "<div class='flex items-center justify-center h-screen'><h1>Preview Generation Failed</h1></div>";
    }
  } catch (error) {
    console.error("Error generating website preview:", error);
    return "<div class='flex items-center justify-center h-screen'><h1>Preview Generation Failed</h1></div>";
  }
};
