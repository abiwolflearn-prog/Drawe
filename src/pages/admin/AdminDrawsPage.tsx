import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { CreateDrawModal } from '../../components/admin/CreateDrawModal.js';
import { ProvablyFairModal } from '../../components/draw/ProvablyFairModal.js';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { Dices, Hash, ShieldCheck, Play, Lock, Plus, Trophy, Layers, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';
import { IDraw, formatEntryNumber } from '../../types/index.js';

export const AdminDrawsPage: React.FC = () => {
  const { token } = useAuth();
  const { t, formatCurrency } = useI18n();
  const [activeDraw, setActiveDraw] = useState<IDraw | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const fetchDrawDetails = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveDraw(data.activeDraw);
      }
    } catch (err) {
      console.error('Failed to load draw details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDrawDetails();
  }, [token]);

  const handleOpenDraw = async () => {
    if (!activeDraw) return;
    await fetch(`/api/admin/draws/${activeDraw._id}/open`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDrawDetails();
  };

  const handleCloseDraw = async () => {
    if (!activeDraw) return;
    await fetch(`/api/admin/draws/${activeDraw._id}/close`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDrawDetails();
  };

  const handleExecuteDraw = async () => {
    if (!activeDraw) return;
    if (confirm(`Execute Cryptographic Draw for ${activeDraw.prizes?.length || 1} winner positions using SHA-256 seed proof?`)) {
      setIsExecuting(true);
      try {
        const res = await fetch(`/api/admin/draws/${activeDraw._id}/execute`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIsExecuting(false);
        if (res.ok) {
          setExecutionResult(data);
          fetchDrawDetails();
        }
      } catch (err) {
        setIsExecuting(false);
        console.error('Execute draw error:', err);
      }
    }
  };

  const capacity = activeDraw?.capacity || 100;
  const price = activeDraw?.pricePerNumber || 50;
  const expectedRevenue = capacity * price;
  const prizePool = activeDraw?.prizes?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const remaining = expectedRevenue - prizePool;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Dices className="w-5 h-5 text-blue-400" />
              የዕጣ ማኔጅመንት (Admin Draw Controls)
            </h1>
            <p className="text-xs text-slate-400">
              Configure draw capacity (1–1000), price per entry, winner prizes, and execute cryptographic selections.
            </p>
          </div>

          <Button variant="glow" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> አዲስ ዕጣ ይፍጠሩ (Create New Draw)
          </Button>
        </div>

        {/* Current Active Round Card */}
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            Loading active draw configuration...
          </div>
        ) : activeDraw ? (
          <Card className="p-6 bg-[#11141D] border-blue-500/30 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="neutral">
                    <Hash className="w-3 h-3" /> Round #{activeDraw.drawNumber}
                  </Badge>
                  {activeDraw.status === 'OPEN' && <Badge variant="available">LIVE OPEN</Badge>}
                  {activeDraw.status === 'CLOSED' && <Badge variant="pending">LOCKED / CLOSED</Badge>}
                  {activeDraw.status === 'COMPLETED' && <Badge variant="winner">COMPLETED</Badge>}
                </div>
                <h2 className="text-lg font-black text-white">{activeDraw.name || activeDraw.title}</h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {activeDraw.status === 'CLOSED' && (
                  <Button variant="glow" size="sm" onClick={handleOpenDraw}>
                    <Play className="w-3.5 h-3.5 mr-1" /> Open Draw
                  </Button>
                )}

                {activeDraw.status === 'OPEN' && (
                  <Button variant="danger" size="sm" onClick={handleCloseDraw}>
                    <Lock className="w-3.5 h-3.5 mr-1" /> Lock Selections
                  </Button>
                )}

                {activeDraw.status !== 'COMPLETED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleExecuteDraw}
                    disabled={isExecuting}
                    className="bg-amber-600 hover:bg-amber-500 border-amber-400/40"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    {isExecuting ? 'Executing...' : 'ዕጣውን አውጣ (Execute Draw)'}
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={() => setIsVerifyOpen(true)}>
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  SHA-256 Seed Proof
                </Button>
              </div>
            </div>

            {/* Configured Draw Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-[#0E1118] border border-white/5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">የቁጥሮች ብዛት (Capacity)</span>
                <span className="text-base font-bold text-blue-400">{capacity} entries</span>
              </div>

              <div className="p-3 bg-[#0E1118] border border-white/5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">የአንድ ቁጥር ዋጋ (Price)</span>
                <span className="text-base font-bold text-emerald-400">{formatCurrency(price)}</span>
              </div>

              <div className="p-3 bg-[#0E1118] border border-white/5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">ሚጠበቅ ገቢ (Expected Rev)</span>
                <span className="text-base font-bold text-white">{formatCurrency(expectedRevenue)}</span>
              </div>

              <div className="p-3 bg-[#0E1118] border border-white/5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">የሽልማት ፑል (Prize Pool)</span>
                <span className="text-base font-bold text-amber-300">{formatCurrency(prizePool)}</span>
              </div>
            </div>

            {/* Configured Winner Positions List */}
            <div className="p-4 bg-[#0E1118] border border-white/10 rounded-xl space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                የተዋቀሩ አሸናፊዎችና ሽልማቶች (Configured Prizes):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeDraw.prizes?.map((p) => (
                  <div key={p.position} className="p-3 bg-[#161B28] border border-amber-500/20 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 font-mono">{p.label}</span>
                    <span className="text-xs font-black text-white font-mono">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Result Banner */}
            {executionResult && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl space-y-2 text-emerald-200">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>{executionResult.message}</span>
                </div>
                <div className="text-xs font-mono text-emerald-300">
                  Revealed Seed: {executionResult.revealedSeed}
                </div>
              </div>
            )}
          </Card>
        ) : null}

        <CreateDrawModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={fetchDrawDetails}
        />

        <ProvablyFairModal
          isOpen={isVerifyOpen}
          onClose={() => setIsVerifyOpen(false)}
          drawId={activeDraw?._id || 'draw_round_001'}
        />
      </div>
    </AdminLayout>
  );
};
