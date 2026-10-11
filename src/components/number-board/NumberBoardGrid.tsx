import React, { useState, useMemo } from 'react';
import { IDrawNumber, formatEntryNumber } from '../../types/index.js';
import { useI18n } from '../../i18n/index.js';
import { Lock, Sparkles, Clock, CheckCircle2, Search, SlidersHorizontal, Ban } from 'lucide-react';

export interface NumberBoardGridProps {
  capacity?: number;
  numbersMap: Map<number, IDrawNumber>;
  selectedNumbers: number[];
  onToggleNumber: (num: number) => void;
  isInteractive?: boolean;
}

export const NumberBoardGrid: React.FC<NumberBoardGridProps> = ({
  capacity = 80,
  numbersMap,
  selectedNumbers,
  onToggleNumber,
  isInteractive = true,
}) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [rangeFilter, setRangeFilter] = useState<string>('ALL');

  // Compute range segments for large capacity boards (e.g. 250, 500, 1000)
  const segments = useMemo(() => {
    if (capacity <= 100) return [];
    const segSize = capacity > 500 ? 100 : 50;
    const count = Math.ceil(capacity / segSize);
    const list: { label: string; start: number; end: number }[] = [];

    for (let i = 0; i < count; i++) {
      const start = i * segSize + 1;
      const end = Math.min((i + 1) * segSize, capacity);
      list.push({
        label: `${formatEntryNumber(start, capacity)}–${formatEntryNumber(end, capacity)}`,
        start,
        end,
      });
    }
    return list;
  }, [capacity]);

  // Filter numbers based on segment or search query
  const displayedEntries = useMemo(() => {
    let list: number[] = Array.from({ length: capacity }, (_, i) => i + 1);

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      list = list.filter((num) => {
        const formatted = formatEntryNumber(num, capacity);
        return String(num).includes(q) || formatted.includes(q);
      });
      return list;
    }

    if (rangeFilter !== 'ALL') {
      const seg = segments.find((s) => s.label === rangeFilter);
      if (seg) {
        list = list.filter((n) => n >= seg.start && n <= seg.end);
      }
    }

    return list;
  }, [capacity, rangeFilter, searchQuery, segments]);

  // Responsive grid columns tuned for 360px, 390px, 412px, tablets, and desktop
  let gridColsClass = 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10';
  if (capacity > 500) {
    gridColsClass = 'grid-cols-5 min-[390px]:grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16';
  } else if (capacity > 100) {
    gridColsClass = 'grid-cols-5 min-[390px]:grid-cols-6 sm:grid-cols-8 md:grid-cols-10';
  }

  return (
    <div className="space-y-3">
      {/* Controls & Filter Bar for dynamic capacities */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#0F131D] p-2.5 sm:p-3 rounded-2xl border border-white/5 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-mono">
          <span className="font-bold text-blue-400">01–{formatEntryNumber(capacity, capacity)}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            {capacity} {t('common.entries') || 'ቁጥሮች'}
          </span>
          {selectedNumbers.length > 0 && (
            <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 font-bold border border-rose-500/30 rounded-full text-[11px]">
              {selectedNumbers.length} የተመረጡ
            </span>
          )}
        </div>

        {/* Quick Search Input */}
        <div className="relative min-w-[140px] max-w-full sm:max-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            inputMode="numeric"
            placeholder={t('common.searchNumber') || 'ቁጥር ፈልግ...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181D2A] text-white pl-8 pr-3 py-1.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Range Tabs for large capacity boards (250, 500, 1000) */}
      {segments.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => {
              setRangeFilter('ALL');
              setSearchQuery('');
            }}
            className={`px-3 py-1.5 rounded-xl font-mono font-bold whitespace-nowrap transition-colors ${
              rangeFilter === 'ALL' && !searchQuery
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40'
                : 'bg-[#141824] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            ሁሉንም ({capacity})
          </button>
          {segments.map((seg) => (
            <button
              key={seg.label}
              type="button"
              onClick={() => {
                setRangeFilter(seg.label);
                setSearchQuery('');
              }}
              className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-semibold whitespace-nowrap transition-colors ${
                rangeFilter === seg.label && !searchQuery
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40'
                  : 'bg-[#141824] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid Canvas */}
      <div
        className={`grid ${gridColsClass} gap-1.5 sm:gap-2 max-h-[540px] overflow-y-auto p-2 sm:p-3 bg-[#0A0D14] border border-white/10 rounded-2xl shadow-inner scroll-smooth`}
      >
        {displayedEntries.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-mono text-xs">
            የተፈለገው ቁጥር አልተገኘም።
          </div>
        ) : (
          displayedEntries.map((num) => {
            const item = numbersMap.get(num);
            const status = item?.status || 'AVAILABLE';
            const isSelected = selectedNumbers.includes(num);
            const formatted = formatEntryNumber(num, capacity);

            // Dynamic cell state styling according to 6 core states:
            // AVAILABLE, SELECTED, PAYMENT_PENDING, CONFIRMED, WINNER, DISABLED
            let btnClass =
              'bg-[#131722] hover:bg-blue-600/30 border-white/10 text-slate-100 hover:border-blue-400/60';

            if (isSelected) {
              btnClass =
                'bg-rose-600 border-rose-400 text-white shadow-md shadow-rose-900/60 font-black scale-[1.03] z-10';
            } else if (status === 'CONFIRMED') {
              btnClass =
                'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 opacity-80 cursor-not-allowed';
            } else if (status === 'PAYMENT_PENDING') {
              btnClass =
                'bg-amber-950/70 border-amber-500/40 text-amber-300 opacity-90 cursor-not-allowed';
            } else if (status === 'WINNER') {
              btnClass =
                'bg-gradient-to-tr from-amber-500 to-yellow-400 border-amber-300 text-slate-950 font-black animate-pulse shadow-lg shadow-amber-500/50 scale-105 z-10';
            } else if (status === 'DISABLED') {
              btnClass =
                'bg-slate-900/40 border-white/5 text-slate-600 cursor-not-allowed opacity-40';
            }

            const isClickable = isInteractive && (status === 'AVAILABLE' || isSelected);

            return (
              <button
                key={num}
                type="button"
                disabled={!isClickable}
                onClick={() => onToggleNumber(num)}
                className={`relative h-11 sm:h-12 rounded-xl border flex flex-col items-center justify-center font-mono transition-all duration-150 select-none active:scale-95 touch-manipulation ${btnClass}`}
                title={`Number #${formatted} - ${status}`}
              >
                <span className="text-xs sm:text-sm font-extrabold tracking-tight">{formatted}</span>

                {/* State Icons */}
                {status === 'CONFIRMED' && !isSelected && (
                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 absolute bottom-1 right-1 opacity-80" />
                )}
                {status === 'PAYMENT_PENDING' && !isSelected && (
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 absolute bottom-1 right-1 animate-spin" />
                )}
                {status === 'WINNER' && (
                  <Sparkles className="w-3 h-3 text-slate-950 absolute top-0.5 right-0.5" />
                )}
                {status === 'DISABLED' && (
                  <Ban className="w-2.5 h-2.5 text-slate-600 absolute bottom-1 right-1" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
