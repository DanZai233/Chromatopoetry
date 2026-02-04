export interface Color {
  hex: string;
  name: string; // e.g., "Muted Olive"
}

export interface Palette {
  id: string;
  name: string; // Poetic name, e.g., "Empty Mountain Rain"
  description: string; // Short explanation or mood
  colors: string[]; // Array of Hex codes
  tags?: string[];
}

export type ViewState = 'home' | 'create' | 'extract';

export type PreviewStyle = 'poetic' | 'ecommerce' | 'blog' | 'portfolio' | 'dashboard';
