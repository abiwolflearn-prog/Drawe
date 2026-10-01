import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/index.js';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="w-full border-t border-white/10 bg-[#07090D] py-8 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-white">{t('brand.name')}</span>
            <span>·</span>
            <span>{t('brand.subtitle')}</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-400">
            <Link to="/" className="hover:text-slate-200 transition-colors">{t('nav.activeDraw')}</Link>
            <Link to="/results" className="hover:text-slate-200 transition-colors">{t('nav.results')}</Link>
            <Link to="/how-it-works" className="hover:text-slate-200 transition-colors">{t('nav.howItWorks')}</Link>
            <Link to="/login" className="hover:text-slate-200 transition-colors">{t('nav.adminPortal')}</Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] leading-relaxed text-slate-500">
          <p>
            ⚖️ {t('brand.complianceNotice')}
          </p>
          <p className="shrink-0">
            © 2026 {t('brand.name')}. {t('brand.rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};
