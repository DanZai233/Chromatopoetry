import React, { useEffect, useState } from 'react';
import { X, Loader2, Code, Check, ChevronDown, Layout, Eye, Copy, AlertCircle } from 'lucide-react';
import { Palette, PreviewStyle } from '../types';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  htmlContent: string | null;
  error?: string | null;
  palette: Palette | null;
  currentStyle: PreviewStyle;
  onStyleChange: (style: PreviewStyle) => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  isLoading, 
  htmlContent, 
  error,
  palette,
  currentStyle,
  onStyleChange
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const { dialogRef, handleKeyDown } = useDialogFocus(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    setViewMode('preview');
    setIsCopied(false);
  }, [isOpen, palette?.id]);

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

  const styleOptions: { value: PreviewStyle; label: string }[] = [
    { value: 'poetic', label: '艺术 · Poetic' },
    { value: 'ecommerce', label: '电商 · Shop' },
    { value: 'blog', label: '博客 · Blog' },
    { value: 'portfolio', label: '作品集 · Portfolio' },
    { value: 'dashboard', label: '仪表盘 · Dashboard' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-8 animate-fade-in">
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="关闭预览"
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative w-full h-[calc(100dvh-1rem)] sm:h-full max-w-6xl bg-white/95 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/40 ring-1 ring-black/5 outline-none"
      >
        <h2 id="preview-modal-title" className="sr-only">
          {palette?.name ? `${palette.name} 网页预览` : '配色网页预览'}
        </h2>
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200/50 bg-white/70 backdrop-blur-sm gap-3">
          <div className="flex min-w-0 items-center gap-3">
             {/* Window Controls Decoration */}
             <div className="flex gap-1.5 hidden sm:flex">
               <div className="w-3 h-3 rounded-full bg-red-400" aria-hidden="true"></div>
               <div className="w-3 h-3 rounded-full bg-amber-400" aria-hidden="true"></div>
               <div className="w-3 h-3 rounded-full bg-green-400" aria-hidden="true"></div>
             </div>
             
             {/* Palette Name */}
             <span className="max-w-24 truncate text-sm font-medium text-gray-500 font-mono hidden md:block">
               {palette?.name ? `${palette.name}` : 'Preview'}
             </span>

             {/* Style Selector */}
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Layout className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                </div>
                <select 
                  value={currentStyle}
                  onChange={(e) => onStyleChange(e.target.value as PreviewStyle)}
                  disabled={isLoading}
                  aria-label="选择预览页面风格"
                  className="appearance-none bg-white border border-gray-200 hover:border-indigo-300 rounded-lg pl-8 pr-8 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-[border-color,box-shadow,background-color] duration-200 shadow-sm text-gray-700 w-[132px] sm:min-w-[140px]"
                >
                  {styleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
             {!isLoading && htmlContent && (
               <>
                 <button
                   type="button"
                   onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')}
                   className={`
                     flex min-h-9 items-center gap-2 px-3 sm:px-4 py-1.5 text-xs font-medium rounded-full transition-[background-color,border-color,color,box-shadow] duration-200 border
                     ${viewMode === 'code'
                       ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                       : 'bg-white text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                   `}
                   aria-pressed={viewMode === 'code'}
                 >
                   {viewMode === 'code' ? <Eye className="w-3.5 h-3.5" aria-hidden="true" /> : <Code className="w-3.5 h-3.5" aria-hidden="true" />}
                   <span className="hidden sm:inline">{viewMode === 'code' ? '预览渲染' : '查看代码'}</span>
                   <span className="sr-only sm:hidden">{viewMode === 'code' ? '预览渲染' : '查看代码'}</span>
                 </button>
                 <button
                   type="button"
                   onClick={handleCopyCode}
                   className={`
                     flex min-h-9 items-center gap-2 px-3 sm:px-4 py-1.5 text-xs font-medium rounded-full transition-[background-color,border-color,color,box-shadow] duration-200 border
                     ${isCopied
                       ? 'bg-green-50 text-green-700 border-green-200'
                       : 'bg-white text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                   `}
                 >
                   {isCopied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                   <span className="hidden sm:inline">{isCopied ? '已复制' : '复制源码'}</span>
                   <span className="sr-only sm:hidden">{isCopied ? '已复制' : '复制源码'}</span>
                 </button>
               </>
             )}
             <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" aria-hidden="true"></div>
            <button 
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center hover:bg-black/5 rounded-full transition-colors text-gray-500 hover:text-gray-800"
              aria-label="关闭预览"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

         {/* Viewport */}
         <div className="flex-grow relative bg-gray-50">
           {isLoading ? (
             <div role="status" aria-live="polite" className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-indigo-600 bg-white/70 backdrop-blur-sm z-10 px-6 text-center">
                <Loader2 className="w-12 h-12 animate-spin" aria-hidden="true" />
                <p className="font-serif text-base sm:text-lg text-gray-600">
                  正在构建 <span className="font-medium text-indigo-600">{styleOptions.find(s => s.value === currentStyle)?.label.split(' · ')[1]}</span> 风格页面...
                </p>
                <div className="flex gap-2 mt-4">
                  {palette?.colors.map(c => (
                    <div key={c} className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: c}} aria-hidden="true"></div>
                  ))}
                </div>
             </div>
           ) : error ? (
             <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
               <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
               <p className="font-medium text-gray-800">{error}</p>
               <p className="max-w-md text-sm text-gray-500">可以切换其他页面风格后重试，现有配色不会丢失。</p>
             </div>
           ) : htmlContent ? (
             viewMode === 'preview' ? (
               <iframe
                 srcDoc={htmlContent}
                 className="w-full h-full border-none bg-white transition-opacity duration-500"
                 title={palette?.name ? `${palette.name} 网页预览` : '配色网页预览'}
                 sandbox="allow-scripts"
               />
             ) : (
               <pre className="w-full h-full overflow-auto p-4 text-xs font-mono text-gray-800 bg-gray-50">
                 <code>{htmlContent}</code>
               </pre>
             )
           ) : (
              <div className="flex items-center justify-center h-full px-6 text-center text-gray-400">
                暂无预览内容
              </div>
           )}
         </div>
         <span className="sr-only" role="status" aria-live="polite">
           {isCopied ? 'HTML 源码已复制' : ''}
         </span>
      </div>
    </div>
  );
};

export default PreviewModal;
