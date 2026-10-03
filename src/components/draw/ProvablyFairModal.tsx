import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { useI18n } from '../../i18n/index.js';
import { ShieldCheck, Lock, Key, Copy, Check, Hash, Sparkles } from 'lucide-react';

export interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawId: string;
}

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({ isOpen, onClose, drawId }) => {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && drawId) {
      setIsLoading(true);
      fetch(`/api/draws/${drawId}/verify`)
        .then((res) => res.json())
        .then((json) => setData(json))
        .catch((err) => console.error('Verification error:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, drawId]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('provablyFair.title')}>
      <div className="space-y-5">
        <p className="text-xs text-slate-300 leading-relaxed">
          {t('provablyFair.subtitle')}
        </p>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono animate-pulse">
            Fetching cryptographic seed proof...
          </div>
        ) : (
          <div className="space-y-4">
            {/* SHA-256 Server Hash Commitment */}
            <div className="p-3.5 bg-[#0E1118] border border-blue-500/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Hash className="w-3.5 h-3.5" /> {t('provablyFair.serverSeedHash')}
                </span>
                <Badge variant="available">Public SHA-256</Badge>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#161B28] rounded-lg border border-white/5">
                <code className="text-[11px] text-slate-200 font-mono break-all leading-tight">
                  {data?.serverSeedHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </code>
                <button
                  onClick={() => handleCopy(data?.serverSeedHash || '', 'hash')}
                  className="p-1 text-slate-400 hover:text-white shrink-0 ml-2"
                >
                  {copiedField === 'hash' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Revealed Server Seed */}
            <div className="p-3.5 bg-[#0E1118] border border-amber-500/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Key className="w-3.5 h-3.5" /> {t('provablyFair.revealedSeed')}
                </span>
                {data?.revealedSeed ? (
                  <Badge variant="winner">Revealed</Badge>
                ) : (
                  <Badge variant="pending">Hidden</Badge>
                )}
              </div>

              <div className="p-2.5 bg-[#161B28] rounded-lg border border-white/5 font-mono text-xs">
                {data?.revealedSeed ? (
                  <code className="text-amber-300 font-bold break-all">{data.revealedSeed}</code>
                ) : (
                  <span className="text-slate-500 italic flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                    {t('provablyFair.hiddenUntilExecution')}
                  </span>
                )}
              </div>
            </div>

            {/* Drawn Winning Number */}
            {data?.winningNumber && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {t('provablyFair.winningNumber')}
                  </span>
                  <p className="text-2xl font-black text-white font-mono">
                    #{data.winningNumber < 10 ? `0${data.winningNumber}` : data.winningNumber}
                  </p>
                </div>
                <div className="p-3 bg-emerald-600/20 border border-emerald-500/40 rounded-2xl text-emerald-300 shadow-lg">
                  <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
              </div>
            )}

            {/* Status verification banner */}
            {data?.verification?.isMatch && (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>{t('provablyFair.statusVerified')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
