import React from 'react';
import { useI18n, Language } from '../../i18n/index.js';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC<{ variant?: 'compact' | 'full' }> = ({ variant = 'compact' }) => {
  const { language, setLanguage } = useI18n();

  return (
    <div className="relative inline-flex items-center gap-1 bg-[#141824] border border-white/10 p-1 rounded-xl text-xs font-semibold select-none">
      <Globe className="w-3.5 h-3.5 text-blue-400 ml-1 shrink-0" />
      <button
        type="button"
        onClick={() => setLanguage('am')}
        className={`px-2 py-1 rounded-lg transition-colors ${
          language === 'am'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        🇪🇹 አማርኛ
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-lg transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
};
