import React from 'react';
import { useI18n } from '../../i18n/index.js';
import { Check, Lock, Hourglass, Star } from 'lucide-react';

export const BoardLegend: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-2 px-3 text-xs font-medium text-slate-300 bg-[#12151E] border border-white/5 rounded-xl">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-[#181C28] border border-white/20"></span>
        <span>{t('draw.legendAvailable')}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-rose-600 border border-rose-400/50 shadow-[0_0_8px_rgba(225,29,72,0.5)] flex items-center justify-center">
          <Check className="w-2 h-2 text-white stroke-[3]" />
        </span>
        <span className="text-rose-400 font-semibold">{t('draw.legendSelected')}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-amber-900 border border-amber-500/50 flex items-center justify-center">
          <Hourglass className="w-2 h-2 text-amber-300" />
        </span>
        <span className="text-amber-400">{t('draw.legendPending')}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
          <Lock className="w-2 h-2 text-slate-500" />
        </span>
        <span className="text-slate-500">{t('draw.legendConfirmed')}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-400 flex items-center justify-center">
          <Star className="w-2 h-2 text-amber-200 fill-amber-200" />
        </span>
        <span className="text-emerald-400 font-semibold">{t('draw.legendWinner')}</span>
      </div>
    </div>
  );
};
