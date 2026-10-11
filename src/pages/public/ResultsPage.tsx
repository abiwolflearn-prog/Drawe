import React, { useState, useEffect } from 'react';
import { Footer } from '../../components/layout/Footer.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { LanguageSelector } from '../../components/ui/LanguageSelector.js';
import { ProvablyFairModal } from '../../components/draw/ProvablyFairModal.js';
import { useI18n } from '../../i18n/index.js';
import { Trophy, Star, ShieldCheck, History } from 'lucide-react';
import { IWinner, formatEntryNumber } from '../../types/index.js';

export const ResultsPage: React.FC = () => {
  const { t, formatCurrency, formatDate } = useI18n();
  const [winners, setWinners] = useState<IWinner[]>([]);
  const [selectedDrawId, setSelectedDrawId] = useState<string | null>(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/draws/results/history');
        if (res.ok) {
          const data = await res.json();
          setWinners(data.winners || []);
        }
      } catch (err) {
        console.error('Failed to load winners history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWinners();
  }, []);

  const latestWinner = winners[0];

  const handleVerify = (drawId: string) => {
    setSelectedDrawId(drawId);
    setIsVerifyOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
      <main className="flex-1 mx-auto max-w-5xl w-full p-4 sm:p-6 space-y-8 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 pb-28 sm:pb-32">
        {/* Header Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="flex items-center justify-between max-w-xl mx-auto mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              Auditable Draw History & Cryptographic Verification
            </span>
            <LanguageSelector />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {t('results.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {t('results.subTitle')}
          </p>
        </div>

        {/* Latest Winner Hero Banner */}
        {latestWinner && (
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#161D2E] to-[#121622] border-amber-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Trophy className="w-64 h-64 text-amber-400" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <Badge variant="winner" className="mb-2">
                  <Star className="w-3.5 h-3.5 fill-amber-200" /> {latestWinner.label || t('results.latestWinner')}
                </Badge>
                <h2 className="text-xl sm:text-2xl font-black text-white">{latestWinner.drawTitle}</h2>
                <p className="text-xs text-slate-400 font-mono">
                  {t('results.winnerLabel')}: <span className="text-slate-200 font-bold">{latestWinner.playerName}</span> ({latestWinner.playerPhone})
                </p>
              </div>

              <div className="flex items-center gap-6">
                {/* Winning Number Badge */}
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t('results.winningNumberLabel')}
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 border border-emerald-400 text-white font-mono font-black text-2xl sm:text-3xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    {latestWinner.formattedNumber || formatEntryNumber(latestWinner.number, 100)}
                  </div>
                </div>

                {/* Prize Amount */}
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t('results.prizeAmountLabel')}
                  </span>
                  <p className="text-2xl font-black text-amber-300 font-mono tabular-nums">
                    {formatCurrency(latestWinner.prizeAmount)}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify(latestWinner.drawId)}
                    className="mt-2 text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/20"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    {t('provablyFair.verifyBtn')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* History Table */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            {t('results.archiveTitle')}
          </h3>

          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              Loading past draw winners...
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-[#11141D]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#161B28] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Draw Round</th>
                    <th className="p-3">Position</th>
                    <th className="p-3">Winning Entry</th>
                    <th className="p-3">Winner Player</th>
                    <th className="p-3">Prize Amount</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Provably Fair</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {winners.map((win, idx) => (
                    <tr
                      key={win._id || win.id || `winner-${win.drawId || 'draw'}-${win.number}-${idx}`}
                      className="hover:bg-white/[0.02]"
                    >
                      <td className="p-3 font-bold text-slate-100 font-sans">{win.drawTitle}</td>
                      <td className="p-3 text-amber-300 font-bold">{win.label || `${win.position || 1}st Winner`}</td>
                      <td className="p-3 font-black text-emerald-400 text-sm">
                        #{win.formattedNumber || formatEntryNumber(win.number, 100)}
                      </td>
                      <td className="p-3 text-slate-300 font-sans">{win.playerName}</td>
                      <td className="p-3 font-bold text-amber-300">{formatCurrency(win.prizeAmount)}</td>
                      <td className="p-3 text-slate-400 text-[11px]">{formatDate(win.createdAt || win.drawnAt)}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerify(win.drawId)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                          Verify
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ProvablyFairModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        drawId={selectedDrawId || 'draw_round_001'}
      />

      <Footer />
    </div>
  );
};
