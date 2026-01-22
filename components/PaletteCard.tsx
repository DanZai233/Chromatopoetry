import React, { useState } from 'react';
import { Palette } from '../types';
import { Check, Eye, Play } from 'lucide-react';

interface PaletteCardProps {
  palette: Palette;
  delay?: number;
  onPreview?: (palette: Palette) => void;
}

const PaletteCard: React.FC<PaletteCardProps> = ({ palette, delay = 0, onPreview }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div 
      className="glass-panel group rounded-3xl p-4 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col h-full animate-fade-in-up hover:shadow-2xl relative"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Colors Section - Now at top for visual impact */}
      <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-sm mb-5 flex">
        {palette.colors.map((color, index) => (
          <div 
            key={index}
            className="h-full flex-1 transition-all duration-300 hover:flex-[3] relative cursor-pointer group/color"
            style={{ backgroundColor: color }}
            onClick={() => handleCopy(color)}
            title={color}
          >
            {/* Hover overlay for individual color */}
            <div className="absolute inset-0 bg-black/0 group-hover/color:bg-black/5 transition-colors flex items-end justify-center pb-4">
               <div className="opacity-0 group-hover/color:opacity-100 transform translate-y-2 group-hover/color:translate-y-0 transition-all duration-300">
                 {copiedColor === color ? (
                   <div className="bg-white/20 backdrop-blur-md rounded-full p-2 shadow-lg">
                      <Check className="text-white w-5 h-5" />
                   </div>
                 ) : (
                    <span className="text-[10px] font-mono text-white/90 bg-black/20 px-1.5 py-0.5 rounded backdrop-blur-sm uppercase tracking-wider">
                      {color}
                    </span>
                 )}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Section */}
      <div className="px-2 flex-grow flex flex-col justify-between">
        <div>
           <div className="flex items-baseline justify-between mb-2">
             <h3 className="font-serif text-2xl font-bold text-gray-800 tracking-tight group-hover:text-indigo-900 transition-colors">{palette.name}</h3>
           </div>
           <p className="text-gray-600 text-sm font-light leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
             {palette.description}
           </p>
        </div>

        {/* Tags and Action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200/50">
           <div className="flex flex-wrap gap-2">
            {palette.tags?.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[10px] uppercase tracking-wider text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
                {tag}
                </span>
            )) || (
                <span className="text-[10px] uppercase tracking-wider text-gray-400">HEX CODES</span>
            )}
           </div>

           {onPreview && (
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 onPreview(palette);
               }}
               className="flex items-center gap-1.5 pl-3 pr-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md hover:bg-indigo-600"
             >
               <Play className="w-3 h-3 fill-current" />
               预览应用
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default PaletteCard;
