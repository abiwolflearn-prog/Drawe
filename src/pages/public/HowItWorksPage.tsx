import React from 'react';
import { Header } from '../../components/layout/Header.js';
import { Footer } from '../../components/layout/Footer.js';
import { Card } from '../../components/ui/Card.js';
import { useI18n } from '../../i18n/index.js';
import { AlertTriangle, Hash, Landmark, FileCheck, Trophy } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl w-full p-4 sm:p-6 space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-2 pt-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
            {t('howItWorksPage.tag')}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight pt-2">
            {t('howItWorksPage.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {t('howItWorksPage.subtitle')}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 space-y-3 bg-[#11141D] border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-base">
                01
              </div>
              <Hash className="w-5 h-5 text-amber-400/60" />
            </div>
            <h3 className="text-base font-bold text-white">{t('howItWorksPage.step1Title')}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('howItWorksPage.step1Desc')}
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-[#11141D] border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-base">
                02
              </div>
              <Landmark className="w-5 h-5 text-blue-400/60" />
            </div>
            <h3 className="text-base font-bold text-white">{t('howItWorksPage.step2Title')}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('howItWorksPage.step2Desc')}
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-[#11141D] border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-base">
                03
              </div>
              <FileCheck className="w-5 h-5 text-emerald-400/60" />
            </div>
            <h3 className="text-base font-bold text-white">{t('howItWorksPage.step3Title')}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('howItWorksPage.step3Desc')}
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-[#11141D] border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono font-bold text-base">
                04
              </div>
              <Trophy className="w-5 h-5 text-purple-400/60" />
            </div>
            <h3 className="text-base font-bold text-white">{t('howItWorksPage.step4Title')}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('howItWorksPage.step4Desc')}
            </p>
          </Card>
        </div>

        {/* Legal Notice Box */}
        <Card className="p-6 bg-[#161310] border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{t('howItWorksPage.legalTitle')}</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {t('howItWorksPage.legalNotice')}
          </p>
        </Card>
      </main>

      <Footer />
    </div>
  );
};
