import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Dices, Play, Square, Sparkles, Hash, Plus } from 'lucide-react';
import { useDraw } from '../../context/DrawContext.js';

export const AdminDrawsPage: React.FC = () => {
  const { activeDraw } = useDraw();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleTriggerDraw = () => {
    if (confirm('Execute random draw for Round #001 now? Result will be generated server-side using secure randomness.')) {
      setStatusMessage('Auditable draw executed! Winning number recorded server-side.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Dices className="w-5 h-5 text-blue-400" />
              Draw Round Lifecycle Manager
            </h1>
            <p className="text-xs text-slate-400">
              Configure rounds, adjust pricing per number, open/close draws, and trigger auditable random results.
            </p>
          </div>

          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Create New Round
          </Button>
        </div>

        {statusMessage && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold">
            ✨ {statusMessage}
          </div>
        )}

        {/* Current Active Round Card */}
        <Card className="p-6 bg-[#11141D] border-blue-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="neutral">
                <Hash className="w-3 h-3" /> Round #{activeDraw?.drawNumber || 1}
              </Badge>
              <Badge variant="winner">Status: {activeDraw?.status || 'OPEN'}</Badge>
            </div>
            <span className="text-xs text-slate-400 font-mono">Numbers Range: 01–80</span>
          </div>

          <h2 className="text-xl font-bold text-white">{activeDraw?.title || 'Round #001 — Standard 01–80 Draw'}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#181D2C] rounded-xl text-xs border border-white/5">
            <div>
              <span className="block text-slate-400 font-semibold uppercase text-[10px]">Price / Number</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{activeDraw?.pricePerNumber || 50} ETB</span>
            </div>
            <div>
              <span className="block text-slate-400 font-semibold uppercase text-[10px]">Max Selections / Player</span>
              <span className="text-base font-bold text-slate-200 font-mono">{activeDraw?.maxSelectionsPerPlayer || 10}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-semibold uppercase text-[10px]">Close Timestamp</span>
              <span className="text-base font-bold text-amber-300 font-mono">In 2 Days</span>
            </div>
          </div>

          {/* Admin Control Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="danger" size="sm" onClick={() => alert('Round closed to new selections.')}>
              <Square className="w-3.5 h-3.5 mr-1" /> Close Round
            </Button>

            <Button variant="glow" size="sm" onClick={handleTriggerDraw}>
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Trigger Auditable Random Draw
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
