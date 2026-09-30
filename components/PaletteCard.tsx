import React, { useState } from 'react';
import { Palette } from '../types';
import { Check, Play, Copy } from 'lucide-react';

interface PaletteCardProps {
  palette: Palette;
  delay?: number;
  onPreview?: (palette: Palette) => void;
}

const PaletteCard: React.FC<PaletteCardProps> = ({ palette, delay = 0, onPreview }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy palette value', error);
      return false;
    }
  };

  const handleCopy = async (color: string) => {
    if (!await copyText(color)) return;
    setCopiedColor(color);
    window.setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleCopyAll = async () => {
    if (!await copyText(JSON.stringify(palette.colors))) return;
    setCopiedAll(true);
    window.setTimeout(() => setCopiedAll(false), 1500);
  };

  const isLightColor = (color: string) => {
    const normalized = color.replace('#', '');
    const hex = normalized.length === 3
      ? normalized.split('').map((character) => `${character}${character}`).join('')
      : normalized;
    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);
    return (red * 0.299 + green * 0.587 + blue * 0.114) / 255 > 0.64;
  };

  return (
    <div 
      className="glass-panel group rounded-3xl p-4 hover:-translate-y-1 transition-[transform,box-shadow,background-color] duration-300 ease-out flex flex-col h-full animate-fade-in-up hover:shadow-2xl relative motion-reduce:transform-none"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Colors Section - Now at top for visual impact */}
      <div className="relative h-44 sm:h-48 w-full rounded-xl overflow-hidden shadow-sm mb-5 flex">
        {palette.colors.map((color) => {
          const light = isLightColor(color);
          const labelColor = light ? '#111827' : '#FFFFFF';
          const labelBackground = light ? 'rgba(255, 255, 255, 0.68)' : 'rgba(0, 0, 0, 0.28)';

          return (
            <button
              key={color}
              type="button"
              className="group/color relative h-full min-w-0 flex-1 basis-0 border-0 p-0 transition-[flex,filter] duration-300 hover:flex-[2.5] focus-visible:z-10 focus-visible:flex-[2.5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
              style={{ backgroundColor: color }}
              onClick={() => void handleCopy(color)}
              aria-label={`复制颜色 ${color}`}
              title={`复制 ${color}`}
            >
              <span className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-1">
                {copiedColor === color ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/25 shadow-lg backdrop-blur-md">
                    <Check className="h-4 w-4 text-white" aria-hidden="true" />
                  </span>
                ) : (
                  <span
                    className="rounded-md px-1.5 py-1 font-mono text-[9px] font-medium sm:text-[10px]"
                    style={{ color: labelColor, backgroundColor: labelBackground }}
                  >
                    {color}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      <div className="px-2 flex-grow flex flex-col justify-between">
        <div>
           <div className="flex items-baseline justify-between mb-2">
             <h3 className="font-serif text-2xl font-bold text-gray-800 group-hover:text-indigo-900 transition-colors">{palette.name}</h3>
           </div>
           <p className="text-gray-600 text-sm font-light leading-relaxed mb-4 line-clamp-3">
             {palette.description}
           </p>
        </div>

         {/* Tags and Action */}
         <div className="mt-auto space-y-3 border-t border-gray-200/50 pt-4">
            <div className="flex flex-wrap gap-2 items-center">
              {palette.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] uppercase tracking-wider text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
                  {tag}
                </span>
              )) || (
                <span className="text-[10px] uppercase tracking-wider text-gray-400">HEX CODES</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleCopyAll()}
                className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-indigo-200 px-3 py-2 text-xs font-medium text-indigo-600 transition-[background-color,border-color,color,transform] hover:bg-indigo-50 active:scale-[0.98]"
                aria-label="复制整组配色"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                {copiedAll ? '已复制' : '复制配色'}
              </button>

              {onPreview && (
                <button
                  type="button"
                  onClick={() => onPreview(palette)}
                  className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-md transition-[background-color,box-shadow,opacity,transform] duration-300 hover:bg-indigo-600 active:scale-[0.98] sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                >
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  预览应用
                </button>
              )}
            </div>
         </div>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {copiedColor
          ? `${copiedColor} 已复制`
          : copiedAll
            ? '整组配色已复制'
            : ''}
      </span>
    </div>
  );
};

export default PaletteCard;
