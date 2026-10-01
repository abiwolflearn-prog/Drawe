import React from 'react';
import { Header } from '../../components/layout/Header.js';
import { Footer } from '../../components/layout/Footer.js';
import { Card } from '../../components/ui/Card.js';
import { Trophy, Star, History, Hash } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const sampleWinners = [
    {
      round: 1,
      title: 'Round #001 — Standard 01–80 Draw',
      winnerNumber: 27,
      playerName: 'Abebe T.',
      prizeAmount: 3500,
      drawDate: new Date(Date.now() - 86400000).toLocaleDateString(),
    }
  ];

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl w-full p-4 sm:p-6 space-y-6">
        <div className="text-center space-y-2 pt-4">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Auditable History
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Draw Results & Past Winners
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            All winning numbers are generated server-side using secure randomness and recorded permanently in system logs.
          </p>
        </div>

        {/* Latest Winner Spotlight */}
        <Card className="p-6 bg-gradient-to-br from-[#0F1E19] to-[#142921] border-emerald-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-emerald-400 font-bold text-xs rounded-lg border border-emerald-500/30">
              <Trophy className="w-3.5 h-3.5" /> Latest Draw Winner
            </span>
            <span className="text-xs text-slate-400 font-mono">Round #001</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4 border-y border-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-600 text-white font-mono font-black text-3xl shadow-[0_0_24px_rgba(16,185,129,0.8)] border border-emerald-300">
                27
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Winning Number</p>
                <p className="text-xl font-bold text-white">Number 27</p>
                <p className="text-xs text-emerald-400">Winner: Abebe T.</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prize Amount</p>
              <p className="text-2xl font-black text-emerald-300 font-mono tabular-nums">
                3,500 <span className="text-sm text-slate-400">ETB</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Previous Draws Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            Previous Rounds Archive
          </h3>

          <div className="overflow-x-auto border border-white/10 rounded-2xl bg-[#11141D]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#161B28] text-[10px] font-bold text-slate-400 uppercase">
                  <th className="p-3">Round</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Winning Number</th>
                  <th className="p-3">Winner Player</th>
                  <th className="p-3 text-right">Prize (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sampleWinners.map((w) => (
                  <tr key={w.round} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-mono font-bold text-blue-400">#{w.round}</td>
                    <td className="p-3 font-medium text-slate-200">{w.title}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      <span className="px-2 py-1 bg-emerald-950 border border-emerald-500/30 rounded-lg">
                        {w.winnerNumber}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{w.playerName}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      {w.prizeAmount.toLocaleString()} ETB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
