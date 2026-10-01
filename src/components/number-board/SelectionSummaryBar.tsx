import React from 'react';
import { Button } from '../ui/Button.js';
import { useI18n } from '../../i18n/index.js';
import { ShoppingBag, X } from 'lucide-react';

export interface SelectionSummaryBarProps {
  selectedNumbers: number[];
  pricePerNumber: number;
  totalAmount: number;
  onClear: () => void;
  onContinue: () => void;
}

export const SelectionSummaryBar: React.FC<SelectionSummaryBarProps> = ({
  selectedNumbers,
  pricePerNumber,
  totalAmount,
  onClear,
  onContinue,
}) => {
  const { t, formatCurrency } = useI18n();

  if (selectedNumbers.length === 0) {
    return (
      <div className="sticky bottom-4 z-30 mx-auto max-w-2xl px-4">
        <div className="flex items-center justify-between p-4 bg-[#11141D]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl text-slate-400 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{t('draw.selectNumberInstruction')}</span>
          </div>
          <span className="font-mono text-slate-500 tabular-nums shrink-0">{formatCurrency(pricePerNumber)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-4 z-30 mx-auto max-w-2xl px-4 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 gap-3 bg-[#161B28]/95 backdrop-blur-md border border-rose-500/30 rounded-2xl shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-[0_0_10px_rgba(225,29,72,0.5)]">
              {selectedNumbers.length}
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t('draw.selectedCount')}
              </p>
              <div className="flex items-center gap-1 max-w-[180px] sm:max-w-[240px] overflow-x-auto scrollbar-none text-rose-300 font-mono text-xs font-bold tabular-nums">
                {selectedNumbers.map(n => (n < 10 ? `0${n}` : `${n}`)).join(' · ')}
              </div>
            </div>
          </div>

          <button
            onClick={onClear}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={t('common.clear')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          <div className="text-right">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('common.totalAmount')}</p>
            <p className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          <Button variant="glow" size="md" onClick={onContinue}>
            {t('common.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};
