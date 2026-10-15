import React from 'react';
import { Waves, Download, Radio, ShieldAlert } from 'lucide-react';

interface TopBarProps {
  onOpenDownloadModal: () => void;
  language: 'en' | 'ne';
  onToggleLanguage: () => void;
  threatLevel: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenDownloadModal,
  language,
  onToggleLanguage,
  threatLevel,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Waves className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Nepal Flood AI
            </span>
            <span className="text-[11px] text-slate-400 font-mono tracking-wider uppercase">
              Early Warning & Evacuation Network
            </span>
          </div>
        </div>

        {/* Zone 2: 4-5 concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-medium text-slate-300">
          <a href="#telemetry" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
            {language === 'ne' ? 'नदी जलमापन' : 'Hydrology Telemetry'}
          </a>
          <a href="#visualizer" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
            {language === 'ne' ? 'बाढी नक्सा' : 'Flood Visualizer'}
          </a>
          <a href="#safe-havens" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
            {language === 'ne' ? 'सुरक्षित आश्रय' : 'Safe Havens'}
          </a>
          <a href="#obstacle-guidance" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
            {language === 'ne' ? 'बाटो अवरोध निर्देशन' : 'Obstacle Rerouting'}
          </a>
          <a href="#citizen-alerts" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
            {language === 'ne' ? 'नागरिक सन्देश' : 'Citizen Alerts'}
          </a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition-colors whitespace-nowrap"
            title="Toggle Language / भाषा परिवर्तन गर्नुहोस्"
          >
            {language === 'en' ? 'नेपाली (NE)' : 'English (EN)'}
          </button>

          {/* Download & Run Guide CTA */}
          <button
            onClick={onOpenDownloadModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'ne' ? 'डाउनलोड र सञ्चालन' : 'Download & Run'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
