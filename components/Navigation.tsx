import React from 'react';
import { ViewState } from '../types';
import { Sparkles, Image, LayoutGrid, Palette as PaletteIcon, Settings } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onOpenSettings: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, onOpenSettings }) => {
  const navItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: '探索', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'create', label: '生成', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'extract', label: '提取', icon: <Image className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-3 sm:top-6 left-1/2 w-[calc(100%_-_1.5rem)] max-w-max -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="glass-panel px-2 py-2 rounded-2xl sm:rounded-full flex items-center justify-center gap-1 sm:gap-2 shadow-2xl ring-1 ring-white/50">
        <div className="pl-2 pr-2 sm:pl-3 sm:pr-4 py-1.5 flex items-center gap-2 border-r border-gray-400/20 mr-0.5 sm:mr-1">
            <div className="bg-indigo-600 rounded-lg p-1">
               <PaletteIcon className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-serif font-bold text-gray-800 tracking-widest hidden lg:block">灵韵</span>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              aria-label={item.label}
              aria-current={currentView === item.id ? 'page' : undefined}
              className={`
                flex min-h-10 items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-300 relative overflow-hidden group active:scale-[0.98]
                ${currentView === item.id 
                  ? 'bg-gray-900 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'}
              `}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
              {currentView === item.id && (
                 <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></span>
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenSettings}
            className="ml-0.5 sm:ml-2 flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/40 transition-[background-color,color,transform] duration-300 active:scale-[0.96]"
            aria-label="打开设置"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
