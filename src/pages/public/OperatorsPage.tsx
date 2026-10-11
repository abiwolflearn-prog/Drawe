import React, { useState, useEffect } from 'react';
import { Footer } from '../../components/layout/Footer.js';
import { OperatorCard } from '../../components/operator/OperatorCard.js';
import { Card } from '../../components/ui/Card.js';
import { LanguageSelector } from '../../components/ui/LanguageSelector.js';
import { useI18n } from '../../i18n/index.js';
import { Building2, Search, Filter, ShieldCheck, Info } from 'lucide-react';
import { ITenant } from '../../types/index.js';

export const OperatorsPage: React.FC = () => {
  const { t } = useI18n();
  const [operators, setOperators] = useState<ITenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'FEATURED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/super-admin/public/operators');
        if (res.ok) {
          const data = await res.json();
          setOperators(data.operators || []);
        }
      } catch (err) {
        console.error('Failed to load operators:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperators();
  }, []);

  const filteredOperators = operators.filter(op => {
    const matchesSearch = op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (op.location && op.location.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filter === 'VERIFIED') return matchesSearch && op.isVerified;
    if (filter === 'FEATURED') return matchesSearch && op.isFeatured;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
      <main className="flex-1 mx-auto max-w-6xl w-full p-4 sm:p-6 space-y-8 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 pb-28 sm:pb-32">
        {/* Header Title Banner */}
        <div className="text-center space-y-2 pt-2">
          <div className="flex items-center justify-between max-w-xl mx-auto mb-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified SaaS Operators
            </span>
            <LanguageSelector />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {t('operators.directoryTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {t('operators.directorySubtitle')}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#11141D] border border-white/10 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('operators.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#181C28] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#181C28] border border-white/5 rounded-xl text-xs font-semibold w-full sm:w-auto">
            <span className="px-2 text-slate-500 hidden sm:flex items-center gap-1">
              <Filter className="w-3 h-3" />
            </span>
            <button
              onClick={() => setFilter('ALL')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'ALL' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('operators.filterAll')}
            </button>
            <button
              onClick={() => setFilter('VERIFIED')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'VERIFIED' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('operators.filterVerified')}
            </button>
            <button
              onClick={() => setFilter('FEATURED')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'FEATURED' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('operators.filterFeatured')}
            </button>
          </div>
        </div>

        {/* Operational Disclaimer Banner */}
        <div className="flex items-start gap-2.5 p-4 bg-[#141210] border border-amber-500/30 rounded-2xl text-xs text-amber-200/90 leading-relaxed">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{t('operators.performanceNotice')}</span>
        </div>

        {/* Operators Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono animate-pulse">
            Loading operator directory...
          </div>
        ) : filteredOperators.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs space-y-2">
            <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-400">{t('operators.noOperatorsFound')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOperators.map((op) => (
              <OperatorCard key={op._id || op.id} operator={op} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
