import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import PaletteCard from './components/PaletteCard';
import PreviewModal from './components/PreviewModal';
import Settings from './components/Settings';
import { ViewState, Palette, PreviewStyle } from './types';
import { DEFAULT_PALETTES } from './constants';
import { generatePalettesFromText, extractPaletteFromImage, generateWebsitePreview, getModelConfig } from './services/aiService';
import { Loader2, UploadCloud, Search, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

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
  
  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewPalette, setPreviewPalette] = useState<Palette | null>(null);
  const [previewStyle, setPreviewStyle] = useState<PreviewStyle>('poetic');
  
  // Global Error
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const config = getModelConfig();
    setHasApiKey(!!config.apiKey);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const results = await generatePalettesFromText(prompt);
      setGeneratedPalettes(results);
    } catch (e) {
      setError("无法生成配色，请检查网络或稍后再试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsExtracting(true);
    setExtractedPalette(null);

    // Read file for preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);

      try {
        const palette = await extractPaletteFromImage(base64);
        setExtractedPalette(palette);
      } catch (e) {
        setError("无法分析图片，请确保图片清晰或稍后再试。");
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const generatePreviewContent = async (palette: Palette, style: PreviewStyle) => {
    setIsPreviewLoading(true);
    setPreviewHtml(null);
    try {
      const html = await generateWebsitePreview(palette, style);
      setPreviewHtml(html);
    } catch (e) {
      console.error(e);
      setPreviewHtml("<div style='display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;'><h3>Preview generation failed. Please try again.</h3></div>");
    } finally {
      setIsPreviewLoading(false);
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

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    const config = getModelConfig();
    setHasApiKey(!!config.apiKey);
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <div className="max-w-7xl mx-auto pt-32 pb-24 px-6 relative z-10">
            <header className="text-center mb-24 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/50 mb-6 backdrop-blur-sm shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium tracking-wider text-gray-600 uppercase">AI Powered Color Aesthetics</span>
              </div>
              <h1 className="font-serif text-6xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
                寻色 <span className="text-indigo-400 font-light">·</span> 灵韵
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-10">
                探索色彩的诗意与温度。
                <br />
                从<span className="text-indigo-600 font-medium">传统美学</span>到<span className="text-pink-600 font-medium">现代极简</span>，发现赋予设计灵魂的配色方案。
              </p>
              
              <div className="flex justify-center gap-4">
                 <button 
                   onClick={() => setView('create')}
                   className="group bg-gray-900 text-white px-8 py-3.5 rounded-full font-medium shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                 >
                    开始创作
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2 md:px-0">
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
          <div className="max-w-5xl mx-auto pt-32 pb-12 px-6 min-h-[90vh] flex flex-col relative z-10">
             <div className="text-center mb-12 animate-fade-in-up">
                <h2 className="font-serif text-5xl font-bold text-gray-900 mb-6">灵感生成</h2>
                <p className="text-xl text-gray-600 font-light">输入一段描述、一种心情，或是一句诗词，<br/>AI将为您编织色彩的旋律。</p>
             </div>

             <div className="glass-panel p-2 rounded-2xl flex items-center shadow-2xl mb-16 animate-fade-in-up relative z-20 mx-auto w-full max-w-3xl ring-4 ring-white/20">
                <Search className="w-6 h-6 text-indigo-400 ml-5" />
                <input 
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="例如：雨后的江南古镇，青石板路，淡淡的忧伤..."
                  className="flex-grow bg-transparent border-none outline-none px-4 py-5 text-gray-800 placeholder-gray-400 text-lg font-light"
                />
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className="bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl active:scale-95"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : '生成'}
                </button>
             </div>

             {error && (
               <div className="glass-panel border-red-200 bg-red-50/50 text-red-700 p-4 rounded-xl mb-8 flex items-center gap-3 animate-fade-in-up">
                 <AlertCircle className="w-5 h-5" />
                 {error}
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-grow">
               {isGenerating && generatedPalettes.length === 0 ? (
                 // Skeleton loading
                 Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="glass-panel h-96 rounded-2xl animate-pulse bg-white/20"></div>
                 ))
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
          <div className="max-w-6xl mx-auto pt-32 pb-12 px-6 relative z-10">
             <div className="text-center mb-16 animate-fade-in-up">
                <h2 className="font-serif text-5xl font-bold text-gray-900 mb-6">图片提取</h2>
                <p className="text-xl text-gray-600 font-light">上传一张照片，捕捉瞬间的色彩灵魂。</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
               {/* Upload Area */}
               <div className="glass-panel p-10 rounded-3xl text-center border-dashed border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300 relative group min-h-[500px] flex flex-col justify-center items-center bg-white/30 shadow-lg hover:shadow-2xl">
                 {selectedImage ? (
                   <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                     <img src={selectedImage} alt="Uploaded" className="w-full h-full object-contain max-h-[600px]" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white font-medium px-6 py-2 border border-white/50 rounded-full hover:bg-white hover:text-black transition-colors">点击更换图片</span>
                     </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-6 text-gray-500 group-hover:text-indigo-600 transition-colors">
                     <div className="w-24 h-24 rounded-full bg-indigo-50/50 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                       <UploadCloud className="w-10 h-10" />
                     </div>
                     <div>
                       <p className="text-2xl font-light mb-2">点击或拖拽上传图片</p>
                       <p className="text-sm opacity-60 font-mono">JPG, PNG, WEBP</p>
                     </div>
                   </div>
                 )}
                 <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
               </div>

               {/* Result Area */}
               <div className="flex flex-col gap-8">
                 {isExtracting ? (
                    <div className="glass-panel p-10 rounded-3xl h-full min-h-[500px] flex flex-col items-center justify-center gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
                      </div>
                      <p className="text-gray-600 font-light text-lg animate-pulse">正在提炼色彩灵感...</p>
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
                   <div className="glass-panel p-10 rounded-3xl h-full min-h-[500px] flex items-center justify-center text-gray-400 text-center bg-white/20">
                     <div className="max-w-xs">
                        <div className="w-16 h-1 bg-gray-300/50 mx-auto rounded-full mb-6"></div>
                        <p className="text-lg font-light leading-relaxed">上传图片后<br/>AI将在此处为您呈现<br/>专属配色方案</p>
                     </div>
                   </div>
                 )}
               </div>
             </div>
             
             {error && (
               <div className="mt-8 glass-panel border-red-200 bg-red-50/50 text-red-700 p-4 rounded-xl flex items-center gap-3 justify-center animate-fade-in-up">
                 <AlertCircle className="w-5 h-5" />
                 {error}
               </div>
             )}
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-4xl mx-auto pt-32 pb-12 px-6 relative z-10">
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
      <div className="noise-bg"></div>

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply"></div>
         <div className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-200/40 rounded-full blur-[100px] animate-blob-reverse mix-blend-multiply"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-pink-200/40 rounded-full blur-[120px] animate-blob mix-blend-multiply animation-delay-4000"></div>
         <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] bg-amber-100/60 rounded-full blur-[80px] animate-blob-reverse animation-delay-2000"></div>
      </div>

      <Navigation currentView={view} setView={setView} onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="relative z-10 min-h-screen flex flex-col">
        {renderContent()}
        
        <footer className="mt-auto py-12 text-center text-gray-500 text-sm font-light relative z-10">
          <p className="mb-2">© {new Date().getFullYear()} Chromatopoetry</p>
          <p className="text-xs opacity-60">Designed with AI • Multi-Model Support</p>
        </footer>
      </main>

      {/* Modals rendered at the root level */}
      <PreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)}
        isLoading={isPreviewLoading}
        htmlContent={previewHtml}
        palette={previewPalette}
        currentStyle={previewStyle}
        onStyleChange={handleStyleChange}
      />
      
      <Settings isOpen={isSettingsOpen} onClose={handleSettingsClose} />
    </div>
  );
};

export default App;