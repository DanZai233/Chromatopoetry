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
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="glass-panel pl-2 pr-3 py-2 rounded-full flex items-center gap-2 shadow-2xl ring-1 ring-white/50">
        <div className="pl-3 pr-4 py-1.5 flex items-center gap-2 border-r border-gray-400/20 mr-1">
            <div className="bg-indigo-600 rounded-lg p-1">
               <PaletteIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-gray-800 tracking-widest hidden md:block">灵韵</span>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden group
                ${currentView === item.id 
                  ? 'bg-gray-900 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
              {currentView === item.id && (
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
            </button>
          ))}
          <button
            onClick={onOpenSettings}
            className="ml-2 p-2.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/40 transition-all duration-300"
            title="设置"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;