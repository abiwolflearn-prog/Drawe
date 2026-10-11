import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { LanguageSelector } from '../ui/LanguageSelector.js';
import { RolePortalSwitcher } from '../layout/RolePortalSwitcher.js';
import { Clock, Ticket, Hash, User, ShieldCheck, Crown, Layers } from 'lucide-react';
import { IDraw } from '../../types/index.js';
import { useI18n } from '../../i18n/index.js';
import { useAuth } from '../../context/AuthContext.js';

export interface RoundHeaderCardProps {
  draw: IDraw | null;
  availableCount: number;
}

export const RoundHeaderCard: React.FC<RoundHeaderCardProps> = ({ draw, availableCount }) => {
  const { t, formatCurrency, language } = useI18n();
  const { user, isAuthenticated } = useAuth();
  const [showPortals, setShowPortals] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (val: number) => (val < 10 ? `0${val}` : `${val}`);

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#121622] to-[#181D2C] border-blue-500/20 shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Badge variant="neutral">
                <Hash className="w-3 h-3" /> {t('draw.round')} #{draw?.drawNumber || 1}
              </Badge>
              <Badge variant="available">{t('draw.liveRound')}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <button
                type="button"
                onClick={() => setShowPortals(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#151A27] hover:bg-[#1E2538] text-slate-200 border border-white/10 text-xs font-semibold shadow-sm transition-all active:scale-95 group"
                title={language === 'am' ? 'የተጠቃሚ፣ አድሚን እና ሱፐር አድሚን ገጾች' : 'User, Admin & Super Admin Pages'}
              >
                {user?.role === 'SUPER_ADMIN' ? (
                  <Crown className="w-3.5 h-3.5 text-rose-400" />
                ) : user?.role === 'ADMIN' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span className="font-bold text-[11px]">
                  {user?.role ? (user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : 'User') : (language === 'am' ? 'ገጾች' : 'Portals')}
                </span>
              </button>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {draw?.title || `${t('draw.round')} #001 — Standard 01–80 Draw`}
          </h1>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
          {/* Price */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/20 text-blue-400">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('common.pricePerNumber')}</p>
              <p className="text-sm font-bold text-slate-100 font-mono tabular-nums">
                {formatCurrency(draw?.pricePerNumber || 50)}
              </p>
            </div>
          </div>

          {/* Available Count */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/20 text-emerald-400">
              <span className="font-mono font-bold text-xs">80</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('draw.availableNumbers')}</p>
              <p className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                {availableCount} <span className="text-xs text-slate-500">/ 80</span>
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('common.closesIn')}</p>
              <p className="text-sm font-bold text-amber-300 font-mono tabular-nums">
                {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Portal Switcher Modal */}
      {showPortals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
            <RolePortalSwitcher
              variant="modal"
              isOpen={showPortals}
              onClose={() => setShowPortals(false)}
            />
          </div>
        </div>
      )}
    </Card>
  );
};
