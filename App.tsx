import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import PaletteCard from './components/PaletteCard';
import { MODEL_PROVIDERS, ViewState, Palette, PreviewStyle } from './types';
import { DEFAULT_PALETTES } from './constants';
import {
  extractPaletteFromImage,
  generatePalettesFromText,
  generateWebsitePreview,
  getAIErrorMessage,
  getModelConfig,
  isAbortError,
  parseStoredModelConfig,
  setModelConfig,
} from './services/aiService';
import { Loader2, UploadCloud, Search, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const PreviewModal = lazy(() => import('./components/PreviewModal'));
const Settings = lazy(() => import('./components/Settings'));
const PROMPT_SUGGESTIONS = [
  '雨后的江南古镇，青石板路，淡淡的忧伤',
  '敦煌壁画里的赭石、石青与金色',
  '晨雾中的松林与山泉',
];

const readFileAsDataUrl = (file: File): Promise<string> => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('无法读取图片文件'));
      }
    };
    reader.onerror = () => reject(new Error('无法读取图片文件'));
    reader.readAsDataURL(file);
  })
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  
  // State for Create View
  const [prompt, setPrompt] = useState('');
  const [generatedPalettes, setGeneratedPalettes] = useState<Palette[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for Extract View
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedPalette, setExtractedPalette] = useState<Palette | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const extractAbortRef = useRef<AbortController | null>(null);
  
  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewPalette, setPreviewPalette] = useState<Palette | null>(null);
  const [previewStyle, setPreviewStyle] = useState<PreviewStyle>('poetic');
  const previewAbortRef = useRef<AbortController | null>(null);
  
  // Global Error
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('modelConfig');
    if (savedConfig) {
      try {
        const parsed = parseStoredModelConfig(JSON.parse(savedConfig));
        if (parsed) setModelConfig(parsed);
      } catch (error) {
        console.error('Failed to parse saved config', error);
      }
    }

    const config = getModelConfig();
    setHasApiKey(!!config.apiKey || !MODEL_PROVIDERS[config.provider].needsApiKey);

    return () => {
      previewAbortRef.current?.abort();
      extractAbortRef.current?.abort();
    };
  }, []);

  const handleGenerate = async () => {
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) return;
    setIsGenerating(true);
    setError(null);
    try {
      const results = await generatePalettesFromText(normalizedPrompt);
      setGeneratedPalettes(results);
    } catch (e) {
      setError(getAIErrorMessage(e, '无法生成配色，请检查网络或稍后再试。'));
    } finally {
      setIsGenerating(false);
    }
  };

  const processImage = async (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('请上传 JPG、PNG、WebP 或 AVIF 格式的图片。');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError('图片大小不能超过 8 MB，请压缩后重试。');
      return;
    }

    extractAbortRef.current?.abort();
    const controller = new AbortController();
    extractAbortRef.current = controller;
    setError(null);
    setIsExtracting(true);
    setExtractedPalette(null);

    try {
      const base64 = await readFileAsDataUrl(file);
      if (controller.signal.aborted) return;
      setSelectedImage(base64);

      const palette = await extractPaletteFromImage(base64, {
        signal: controller.signal,
      });
      setExtractedPalette(palette);
    } catch (e) {
      if (!isAbortError(e)) {
        setError(getAIErrorMessage(e, '无法分析图片，请确保图片清晰或稍后再试。'));
      }
    } finally {
      if (extractAbortRef.current === controller) {
        extractAbortRef.current = null;
        setIsExtracting(false);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void processImage(file);
  };

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processImage(file);
  };

  const handleImageDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDraggingImage(false);
    }
  };

  const generatePreviewContent = async (palette: Palette, style: PreviewStyle) => {
    previewAbortRef.current?.abort();
    const controller = new AbortController();
    previewAbortRef.current = controller;
    setIsPreviewLoading(true);
    setPreviewHtml(null);
    setPreviewError(null);
    try {
      const html = await generateWebsitePreview(palette, style, { signal: controller.signal });
      setPreviewHtml(html);
    } catch (e) {
      if (isAbortError(e)) return;
      console.error(e);
      setPreviewError('预览生成失败，请重试或切换其他页面风格。');
    } finally {
      if (previewAbortRef.current === controller) {
        previewAbortRef.current = null;
        setIsPreviewLoading(false);
      }
    }
  };

  const handlePreview = async (palette: Palette) => {
    setIsPreviewOpen(true);
    setPreviewPalette(palette);
    setPreviewStyle('poetic'); // Reset to default style when opening new
    await generatePreviewContent(palette, 'poetic');
  };

  const handleStyleChange = async (newStyle: PreviewStyle) => {
    if (!previewPalette) return;
    setPreviewStyle(newStyle);
    await generatePreviewContent(previewPalette, newStyle);
  };

  const handlePreviewClose = () => {
    previewAbortRef.current?.abort();
    previewAbortRef.current = null;
    setIsPreviewLoading(false);
    setIsPreviewOpen(false);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    const config = getModelConfig();
    setHasApiKey(!!config.apiKey || !MODEL_PROVIDERS[config.provider].needsApiKey);
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <div className="max-w-7xl mx-auto pt-28 sm:pt-32 pb-20 px-4 sm:px-6 relative z-10">
            <header className="text-center mb-16 sm:mb-24 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/50 mb-6 backdrop-blur-sm shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] sm:text-xs font-medium tracking-wider text-gray-600 uppercase">AI Powered Color Aesthetics</span>
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
                寻色 <span className="text-indigo-400 font-light">·</span> 灵韵
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-10">
                探索色彩的诗意与温度。
                <br />
                从<span className="text-indigo-600 font-medium">传统美学</span>到<span className="text-pink-600 font-medium">现代极简</span>，发现赋予设计灵魂的配色方案。
              </p>
              
              <div className="flex justify-center gap-4">
                 <button 
                   type="button"
                   onClick={() => setView('create')}
                   className="group bg-gray-900 text-white px-8 py-3.5 rounded-full font-medium shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-[transform,box-shadow,background-color] duration-300 flex items-center gap-2 hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500"
                 >
                    开始创作
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            </header>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-indigo-500 mb-2">Curated Palettes</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">先看几组灵感</h2>
              </div>
              <button
                type="button"
                onClick={() => setView('create')}
                className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-gray-300 bg-white/60 px-5 py-2.5 text-sm font-medium text-gray-700 transition-[background-color,border-color,color,transform] hover:border-gray-900 hover:bg-white hover:text-gray-950 active:scale-[0.98] sm:self-auto"
              >
                定制我的配色
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {DEFAULT_PALETTES.map((palette, idx) => (
                <PaletteCard 
                  key={palette.id} 
                  palette={palette} 
                  delay={idx * 150} 
                  onPreview={handlePreview}
                />
              ))}
            </div>
          </div>
        );

      case 'create':
        return (
          <div className="max-w-5xl mx-auto pt-28 sm:pt-32 pb-12 px-4 sm:px-6 min-h-[90vh] flex flex-col relative z-10">
             <div className="text-center mb-10 sm:mb-12 animate-fade-in-up">
                <h2 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 mb-5">灵感生成</h2>
                <p className="text-lg sm:text-xl text-gray-600 font-light leading-relaxed">输入一段描述、一种心情，或是一句诗词，<br className="hidden sm:block" />由 AI 为您编织色彩的旋律。</p>
             </div>

             <div className="glass-panel p-2 rounded-2xl flex items-stretch sm:items-center shadow-2xl mb-5 animate-fade-in-up relative z-20 mx-auto w-full max-w-3xl ring-4 ring-white/20">
                <label htmlFor="palette-prompt" className="sr-only">描述想要的配色</label>
                <Search className="hidden sm:block w-6 h-6 text-indigo-400 ml-5 shrink-0" />
                <input
                  id="palette-prompt"
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleGenerate();
                  }}
                  placeholder="例如：雨后的江南古镇，青石板路，淡淡的忧伤..."
                  aria-describedby="prompt-help"
                  className="min-w-0 flex-grow bg-transparent border-none outline-none px-4 py-4 sm:py-5 text-base sm:text-lg text-gray-800 placeholder-gray-400 font-light"
                />
                <button 
                  type="button"
                  onClick={() => void handleGenerate()}
                  disabled={isGenerating || !prompt.trim()}
                  className="min-w-20 sm:min-w-24 bg-gray-900 text-white px-5 sm:px-8 py-4 rounded-xl hover:bg-gray-800 transition-[background-color,box-shadow,transform] duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : '生成'}
                </button>
             </div>

             <div id="prompt-help" className="mx-auto mb-12 flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
                <span className="mr-1">试试：</span>
                {PROMPT_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setPrompt(suggestion)}
                    className="min-h-9 rounded-full border border-gray-200 bg-white/55 px-3.5 py-1.5 text-left text-xs text-gray-600 transition-[background-color,border-color,color,transform] hover:border-indigo-300 hover:bg-white hover:text-indigo-700 active:scale-[0.98]"
                  >
                    {suggestion}
                  </button>
                ))}
             </div>

             {error && (
               <div role="alert" className="glass-panel border-red-200 bg-red-50/60 text-red-700 p-4 rounded-xl mb-8 flex items-center gap-3 animate-fade-in-up">
                 <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                 <span>{error}</span>
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-grow">
               {isGenerating && generatedPalettes.length === 0 ? (
                 Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="glass-panel h-96 rounded-2xl animate-pulse bg-white/20"></div>
                 ))
               ) : generatedPalettes.length === 0 ? (
                 <div className="glass-panel col-span-full rounded-3xl border-dashed border-2 border-indigo-100 bg-white/25 px-6 py-16 text-center">
                   <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                     <Sparkles className="h-7 w-7" aria-hidden="true" />
                   </div>
                   <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">等待你的第一句灵感</h3>
                   <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500">写下画面、情绪或诗句。生成结果会包含三组风格不同的完整五色方案，可直接复制或预览为网页。</p>
                 </div>
               ) : (
                 generatedPalettes.map((palette, idx) => (
                   <PaletteCard 
                     key={palette.id} 
                     palette={palette} 
                     delay={idx * 150} 
                     onPreview={handlePreview}
                   />
                 ))
               )}
             </div>
          </div>
        );

      case 'extract':
        return (
          <div className="max-w-6xl mx-auto pt-28 sm:pt-32 pb-12 px-4 sm:px-6 relative z-10">
             <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
                <h2 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 mb-5">图片提取</h2>
                <p className="text-lg sm:text-xl text-gray-600 font-light">上传一张照片，捕捉瞬间的色彩灵魂。</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
               {/* Upload Area */}
               <div
                 className={`glass-panel rounded-3xl border-2 border-dashed p-4 sm:p-8 text-center transition-[background-color,border-color,box-shadow] duration-300 relative group min-h-[380px] sm:min-h-[500px] flex flex-col justify-center items-center shadow-lg ${
                   isDraggingImage
                     ? 'border-indigo-500 bg-indigo-50/70 shadow-2xl'
                     : 'border-indigo-200 bg-white/30 hover:border-indigo-400 hover:shadow-2xl'
                 }`}
                 onDrop={handleImageDrop}
                 onDragOver={(event) => {
                   event.preventDefault();
                   setIsDraggingImage(true);
                 }}
                 onDragLeave={handleImageDragLeave}
               >
                 <input
                   id="image-upload"
                   type="file"
                   accept="image/jpeg,image/png,image/webp,image/avif"
                   onChange={handleImageUpload}
                   className="sr-only peer"
                   aria-describedby="upload-help"
                 />
                 <label htmlFor="image-upload" className="absolute inset-0 cursor-pointer rounded-3xl peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-indigo-500" aria-label={selectedImage ? '更换上传图片' : '上传图片'}>
                   <span className="sr-only">{selectedImage ? '更换上传图片' : '上传图片'}</span>
                 </label>
                 {selectedImage ? (
                   <div className="relative isolate w-full rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                     <img src={selectedImage} alt="已上传的待提取图片" className="w-full max-h-[560px] object-contain" />
                     <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35 opacity-100 backdrop-blur-[1px] transition-opacity duration-300 sm:bg-black/50 sm:opacity-0 sm:group-hover:opacity-100">
                        <span className="rounded-full border border-white/50 bg-black/20 px-6 py-2 font-medium text-white backdrop-blur-sm">点击更换图片</span>
                     </div>
                   </div>
                 ) : (
                   <div className="pointer-events-none flex flex-col items-center gap-6 text-gray-500 transition-colors group-hover:text-indigo-600">
                     <div className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl transition-[transform,background-color,color] duration-300 ${
                       isDraggingImage ? 'scale-105 bg-indigo-100 text-indigo-600' : 'bg-indigo-50/70 text-indigo-400 group-hover:scale-105'
                     }`}>
                       <UploadCloud className="w-9 h-9 sm:w-10 sm:h-10" aria-hidden="true" />
                     </div>
                     <div id="upload-help">
                       <p className="text-xl sm:text-2xl font-light mb-2">{isDraggingImage ? '松开即可上传' : '点击或拖拽上传图片'}</p>
                       <p className="text-xs sm:text-sm opacity-60">JPG、PNG、WebP、AVIF · 最大 8 MB</p>
                     </div>
                   </div>
                 )}
               </div>

               {/* Result Area */}
               <div className="flex flex-col gap-8">
                 {isExtracting ? (
                    <div role="status" aria-live="polite" className="glass-panel p-10 rounded-3xl h-full min-h-[380px] sm:min-h-[500px] flex flex-col items-center justify-center gap-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" aria-hidden="true" />
                      </div>
                      <p className="text-gray-600 font-light text-lg">正在提炼色彩灵感...</p>
                    </div>
                 ) : extractedPalette ? (
                   <div className="h-full animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                      <div className="mb-6 flex items-center gap-3 text-indigo-600 font-medium px-2">
                        <Sparkles className="w-5 h-5" />
                        <span className="tracking-widest uppercase text-sm">Extraction Result</span>
                      </div>
                      <PaletteCard 
                        palette={extractedPalette} 
                        onPreview={handlePreview}
                      />
                   </div>
                 ) : (
                   <div className="glass-panel p-10 rounded-3xl h-full min-h-[380px] sm:min-h-[500px] flex items-center justify-center text-gray-400 text-center bg-white/20">
                     <div className="max-w-xs">
                        <div className="mx-auto mb-6 flex gap-1.5" aria-hidden="true">
                          {['#CBD5E1', '#A5B4FC', '#F9A8D4', '#FCD34D', '#86EFAC'].map((color) => (
                            <span key={color} className="h-1.5 w-8 rounded-full" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <p className="text-lg font-light leading-relaxed">上传图片后<br/>AI将在此处为您呈现<br/>专属配色方案</p>
                     </div>
                   </div>
                 )}
               </div>
             </div>
             
             {error && (
               <div role="alert" className="mt-8 glass-panel border-red-200 bg-red-50/60 text-red-700 p-4 rounded-xl flex items-center gap-3 justify-center animate-fade-in-up">
                 <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                 <span>{error}</span>
               </div>
             )}
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-4xl mx-auto pt-28 sm:pt-32 pb-12 px-4 sm:px-6 relative z-10">
             <div className="text-center mb-16 animate-fade-in-up">
                <h2 className="font-serif text-5xl font-bold text-gray-900 mb-6">设置</h2>
                <p className="text-xl text-gray-600 font-light">配置您的AI模型供应商</p>
             </div>
             
             <div className="glass-panel p-8 rounded-3xl text-center bg-white/40 shadow-lg">
               {hasApiKey ? (
                 <div className="py-8">
                   <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Sparkles className="w-10 h-10 text-green-600" />
                   </div>
                   <h3 className="text-2xl font-serif font-medium text-gray-900 mb-3">已配置AI模型</h3>
                   <p className="text-gray-600 mb-6">您已成功配置了AI模型供应商，可以开始使用生成和提取功能。</p>
                   <button
                     type="button"
                     onClick={() => setIsSettingsOpen(true)}
                     className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                   >
                     修改配置
                   </button>
                 </div>
               ) : (
                 <div className="py-8">
                   <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <AlertCircle className="w-10 h-10 text-amber-600" />
                   </div>
                   <h3 className="text-2xl font-serif font-medium text-gray-900 mb-3">尚未配置AI模型</h3>
                   <p className="text-gray-600 mb-6">请先配置您的AI模型供应商和API密钥，才能使用生成和提取功能。</p>
                   <button
                     type="button"
                     onClick={() => setIsSettingsOpen(true)}
                     className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
                   >
                     立即配置
                   </button>
                 </div>
               )}
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-gray-800 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Noise Overlay */}
      <div className="noise-bg" aria-hidden="true"></div>

      <div className="app-backdrop fixed inset-0 z-0 pointer-events-none" aria-hidden="true"></div>
      <div className="spectrum-line fixed inset-x-0 top-0 z-[70] h-1" aria-hidden="true"></div>

      <Navigation currentView={view} setView={setView} onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="relative z-10 min-h-screen flex flex-col">
        {renderContent()}
        
        <footer className="mt-auto py-10 sm:py-12 text-center text-gray-500 text-sm font-light relative z-10 px-4">
          <p className="mb-2">© {new Date().getFullYear()} Chromatopoetry</p>
          <p className="text-xs opacity-60">Powered by UniLLM · Multi-Model Support</p>
        </footer>
      </main>

      {/* Modals rendered at the root level */}
      <Suspense fallback={null}>
        {isPreviewOpen && (
          <PreviewModal
            isOpen
            onClose={handlePreviewClose}
            isLoading={isPreviewLoading}
            htmlContent={previewHtml}
            error={previewError}
            palette={previewPalette}
            currentStyle={previewStyle}
            onStyleChange={handleStyleChange}
          />
        )}

        {isSettingsOpen && (
          <Settings isOpen onClose={handleSettingsClose} />
        )}
      </Suspense>
    </div>
  );
};

export default App;
