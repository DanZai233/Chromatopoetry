import React, { useState } from 'react';
import { X, Loader2, Code, Check } from 'lucide-react';
import { Palette } from '../types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  htmlContent: string | null;
  palette: Palette | null;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, isLoading, htmlContent, palette }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    if (htmlContent) {
      try {
        await navigator.clipboard.writeText(htmlContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy!', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full h-full max-w-6xl bg-white/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/40 ring-1 ring-black/5">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-red-400"></div>
               <div className="w-3 h-3 rounded-full bg-amber-400"></div>
               <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <span className="ml-3 text-sm font-medium text-gray-500 font-mono hidden sm:block">
               {isLoading ? 'Generating Design...' : palette?.name ? `${palette.name} - Example.html` : 'Preview'}
             </span>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && htmlContent && (
              <button
                onClick={handleCopyCode}
                className={`
                  flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full transition-all duration-200 border
                  ${isCopied 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-white text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                `}
                title="Copy HTML Source"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                <span>{isCopied ? '代码已复制' : '复制源代码'}</span>
              </button>
            )}
            <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-grow relative bg-gray-50">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-indigo-600">
               <Loader2 className="w-12 h-12 animate-spin" />
               <p className="font-serif text-lg text-gray-600 animate-pulse">正在以此配色构建网页...</p>
               <div className="flex gap-2 mt-4">
                 {palette?.colors.map(c => (
                   <div key={c} className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: c}}></div>
                 ))}
               </div>
            </div>
          ) : htmlContent ? (
            <iframe 
              srcDoc={htmlContent}
              className="w-full h-full border-none bg-white"
              title="Website Preview"
              sandbox="allow-scripts"
            />
          ) : (
             <div className="flex items-center justify-center h-full text-gray-400">
               No content generated
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;