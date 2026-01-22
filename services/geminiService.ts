import { GoogleGenAI, Type } from "@google/genai";
import { Palette } from "../types";

// Initialize Gemini Client
// Requires process.env.API_KEY to be available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const generatePalettesFromText = async (prompt: string): Promise<Palette[]> => {
  try {
    const fullPrompt = `
      You are an expert colorist with a deep knowledge of traditional Chinese poetry and aesthetics. 
      Generate 3 distinct color palettes (5 colors each) based on this description: "${prompt}".
      
      For each palette:
      1. Give it a beautiful, poetic Chinese name (e.g., "雨过天青", "层林尽染").
      2. Provide a short, artistic description in Chinese explaining the vibe.
      3. Provide 5 hex color codes.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

  } catch (error) {
    console.error("Error generating palettes from text:", error);
    throw error;
  }
};

export const extractPaletteFromImage = async (base64Image: string): Promise<Palette> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const fullPrompt = `
      Analyze this image deeply. Extract the 5 most dominant and aesthetically pleasing colors that represent the essence of this image.
      Create a single color palette.
      1. Give it a poetic Chinese name that fits the image content.
      2. Write a short description in Chinese.
      3. Return the 5 hex codes.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/png", data: cleanBase64 } },
          { text: fullPrompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      },
    });

    const data = JSON.parse(response.text || "{}");

    return {
      id: `gen-img-${Date.now()}`,
      name: data.name || "未命名配色",
      description: data.description || "基于图片生成的灵感配色",
      colors: data.colors || [],
    };

  } catch (error) {
    console.error("Error extracting palette from image:", error);
    throw error;
  }
};

export const generateWebsitePreview = async (palette: Palette): Promise<string> => {
  try {
    const prompt = `
      You are a world-class UI/UX designer specializing in high-end, artistic websites.
      Create a single-file HTML landing page (with embedded Tailwind CSS via CDN) that demonstrates the application of this specific color palette:
      
      Palette Name: "${palette.name}"
      Description: "${palette.description}"
      Colors: ${JSON.stringify(palette.colors)}
      
      Design Requirements:
      1. **Strictly** use the provided hex codes for backgrounds, typography, buttons, and accents. Do not introduce random new colors (except black/white if absolutely necessary for contrast).
      2. The design style should be "Artistic, Minimalist, and Poetic".
      3. Include a Header, a Hero Section with a large typographic headline, a "Mood" section with abstract shapes or cards, and a minimal Footer.
      4. Use a beautiful serif font (like Noto Serif) and sans-serif font pairing via Google Fonts.
      5. Ensure the text content is in Chinese and matches the poetic theme of the palette.
      6. Return a JSON object with a single key "html" containing the raw HTML string.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

  } catch (error) {
    console.error("Error generating website preview:", error);
    return "<div class='flex items-center justify-center h-screen'><h1>Preview Generation Failed</h1></div>";
  }
};
