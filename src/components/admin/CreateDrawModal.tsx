import React, { useState } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { IPrizeConfig, formatEntryNumber } from '../../types/index.js';
import { Trophy, Plus, Trash2, DollarSign, Layers, Hash, Sparkles, CheckCircle } from 'lucide-react';

export interface CreateDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateDrawModal: React.FC<CreateDrawModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const { t, formatCurrency } = useI18n();

  const [name, setName] = useState('Round #002 — Standard Community Draw');
  const [description, setDescription] = useState('Admin configured 100 entry draw with 3 winner prize positions');
  const [capacity, setCapacity] = useState<number>(100);
  const [pricePerNumber, setPricePerNumber] = useState<number>(50);
  const [currency] = useState('ETB');

  // Dynamic Prize Configurations
  const [prizes, setPrizes] = useState<IPrizeConfig[]>([
    { position: 1, label: '1st Winner (🥇 1ኛ አሸናፊ)', amount: 2500, currency: 'ETB' },
    { position: 2, label: '2nd Winner (🥈 2ኛ አሸናፊ)', amount: 1000, currency: 'ETB' },
    { position: 3, label: '3rd Winner (🥉 3ኛ አሸናፊ)', amount: 500, currency: 'ETB' },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Revenue & Prize Calculations
  const expectedRevenue = capacity * pricePerNumber;
  const totalPrizePool = prizes.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remainingAmount = expectedRevenue - totalPrizePool;

  const handleWinnerCountChange = (count: number) => {
    const validCount = Math.max(1, Math.min(10, count));
    const newPrizes: IPrizeConfig[] = [];
    for (let pos = 1; pos <= validCount; pos++) {
      const existing = prizes.find((p) => p.position === pos);
      if (existing) {
        newPrizes.push(existing);
      } else {
        newPrizes.push({
          position: pos,
          label: `${pos}th Winner (${pos}ኛ አሸናፊ)`,
          amount: Math.max(0, Math.round(pricePerNumber * 2)),
          currency: 'ETB',
        });
      }
    }
    setPrizes(newPrizes);
  };

  const handlePrizeAmountChange = (pos: number, amount: number) => {
    setPrizes((prev) =>
      prev.map((p) => (p.position === pos ? { ...p, amount: Math.max(0, amount) } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (capacity < 1 || capacity > 1000) {
      setError('Draw capacity must be between 1 and 1000 entries');
      return;
    }

    if (pricePerNumber <= 0) {
      setError('Price per number must be greater than 0 ETB');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/draws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          capacity,
          pricePerNumber,
          currency,
          prizes,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setError(data.error || 'Failed to create draw');
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError('Network error creating draw');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="አዲስ የዕጣ ዝግጅት ይፍጠሩ (Create New Draw)">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              የዕጣው ስም (Draw Name) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161B28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
              placeholder="e.g. Round #002 — Addis 500 Entry Draw"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              መግለጫ (Description)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#161B28] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-blue-500 outline-none resize-none"
              placeholder="Optional description for players..."
            />
          </div>
        </div>

        {/* Section 2: Capacity & Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0E1118] border border-white/10 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> የቁጥሮች ብዛት (Capacity: 1 - 1000) *
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              required
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full bg-[#161B28] border border-white/10 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:border-blue-500 outline-none"
            />
            <span className="block text-[10px] text-slate-400">
              Format: {formatEntryNumber(1, capacity)} ... {formatEntryNumber(capacity, capacity)}
            </span>
          </div>

          <div className="p-4 bg-[#0E1118] border border-white/10 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> የአንድ ቁጥር ዋጋ (Price Per Entry) *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                required
                value={pricePerNumber}
                onChange={(e) => setPricePerNumber(Number(e.target.value))}
                className="w-full bg-[#161B28] border border-white/10 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:border-emerald-500 outline-none"
              />
              <span className="text-xs font-bold text-slate-300 font-mono">ETB</span>
            </div>
            <span className="block text-[10px] text-slate-400">Admin configured ticket price</span>
          </div>
        </div>

        {/* Section 3: Winner Prize Configurations */}
        <div className="p-4 bg-[#0E1118] border border-amber-500/30 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                የአሸናፊዎችና የሽልማት መጠን (Winner Positions & Prizes)
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Winners Count:</span>
              <input
                type="number"
                min={1}
                max={10}
                value={prizes.length}
                onChange={(e) => handleWinnerCountChange(Number(e.target.value))}
                className="w-14 bg-[#161B28] border border-white/10 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs text-amber-300 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            {prizes.map((p) => (
              <div key={p.position} className="flex items-center justify-between gap-3 p-2.5 bg-[#161B28] rounded-xl border border-white/5">
                <span className="text-xs font-bold text-amber-300 font-mono w-28 shrink-0">
                  {p.position === 1 ? '🥇 1st Winner' : p.position === 2 ? '🥈 2nd Winner' : p.position === 3 ? '🥉 3rd Winner' : `${p.position}th Winner`}
                </span>

                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[10px] text-slate-400 font-mono">Prize:</span>
                  <input
                    type="number"
                    min={0}
                    value={p.amount}
                    onChange={(e) => handlePrizeAmountChange(p.position, Number(e.target.value))}
                    className="w-full bg-[#0E1118] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-amber-400"
                  />
                  <span className="text-xs font-mono text-slate-400">ETB</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Live Financial Summary Card */}
        <div className="p-4 bg-gradient-to-br from-[#121622] to-[#0D1018] border border-blue-500/30 rounded-2xl space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span>የሚጠበቅ ጠቅላላ ገቢ (Expected Revenue):</span>
            <span className="font-bold text-white">{capacity} × {pricePerNumber} = {formatCurrency(expectedRevenue)}</span>
          </div>

          <div className="flex items-center justify-between text-amber-300">
            <span>የሽልማት ፑል መጠን (Total Prize Pool):</span>
            <span className="font-bold">{formatCurrency(totalPrizePool)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-emerald-400 font-bold">
            <span>የቀረ ገቢ (Remaining Amount):</span>
            <span className="text-sm">{formatCurrency(remainingAmount)}</span>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button variant="glow" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Draw...' : 'ዕጣውን መዝግብ (Create Draw)'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
