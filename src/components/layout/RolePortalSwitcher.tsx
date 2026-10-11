import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { 
  User, 
  ShieldCheck, 
  Building2, 
  Crown, 
  ChevronRight, 
  X, 
  Check, 
  ExternalLink,
  Sparkles,
  LogOut,
  Layers
} from 'lucide-react';

interface RolePortalSwitcherProps {
  variant?: 'inline' | 'dropdown' | 'modal';
  isOpen?: boolean;
  onClose?: () => void;
}

export const RolePortalSwitcher: React.FC<RolePortalSwitcherProps> = ({
  variant = 'dropdown',
  isOpen,
  onClose,
}) => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { language } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [switching, setSwitching] = useState<string | null>(null);

  const isAm = language === 'am';

  const portals = [
    {
      id: 'user',
      titleAm: 'የተጫዋች ገጽ (User Page)',
      titleEn: 'User / Player Portal',
      descriptionAm: 'የተመረጡ ቁጥሮች፣ የክፍያ ማረጋገጫዎች፣ የዕጣ ትኬቶች እና የተጫዋች መገለጫ',
      descriptionEn: 'Selected numbers, ticket proofs, Telebirr/CBE references & profile',
      path: '/user',
      role: 'PLAYER',
      badgeAm: 'ተጫዋች',
      badgeEn: 'Player',
      demoEmail: 'player@draw.com',
      color: 'blue',
      icon: User,
    },
    {
      id: 'admin',
      titleAm: 'የአዘጋጅ አድሚን ገጽ (Admin Page)',
      titleEn: 'Operator Admin Portal',
      descriptionAm: 'የክፍያ ማረጋገጫ ወረፋ፣ የዕጣ ዙር ቁጥጥር፣ የቀጥታ ሰሌዳ እና የኦዲት መዝገብ',
      descriptionEn: 'Payment approvals, round control, live draw board & operator audit logs',
      path: '/admin',
      role: 'ADMIN',
      badgeAm: 'አዘጋጅ አድሚን',
      badgeEn: 'Operator Admin',
      demoEmail: 'admin@draw.com',
      color: 'amber',
      icon: ShieldCheck,
    },
    {
      id: 'super-admin',
      titleAm: 'ዋና አስተዳዳሪ ገጽ (Super Admin Page)',
      titleEn: 'Platform Super Admin',
      descriptionAm: 'የSaaS አዘጋጆች ምዝገባ፣ የተከራዮች ቁጥጥር፣ አጠቃላይ የፕላትፎርም ስታቲስቲክስ',
      descriptionEn: 'Multi-tenant SaaS workspace control, operator approval & global system oversight',
      path: '/super-admin',
      role: 'SUPER_ADMIN',
      badgeAm: 'ዋና አስተዳዳሪ',
      badgeEn: 'Super Admin',
      demoEmail: 'superadmin@draw.com',
      color: 'rose',
      icon: Crown,
    },
  ];

  const handleSwitchTo = async (portal: typeof portals[0]) => {
    setSwitching(portal.id);
    try {
      // If user isn't logged in with this role or logged out, switch via demo login
      if (user?.role !== portal.role) {
        await login(portal.demoEmail, 'password123');
      }
      navigate(portal.path);
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setSwitching(null);
    }
  };

  const currentRole = user?.role || 'GUEST';

  return (
    <div className="w-full max-w-lg bg-[#0E121B] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-950/40">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{isAm ? 'የፖርታልና ገጾች መቀየሪያ' : 'Portals & Role Switcher'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Live
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {isAm 
                ? 'በተጠቃሚ፣ አዘጋጅ አድሚን እና ዋና አድሚን ገጾች መካከል በፍጥነት ይቀያይሩ' 
                : 'Directly navigate and switch between User, Admin, and Super Admin pages'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Current Active Account Status */}
      <div className="p-2.5 mb-4 rounded-xl bg-[#141824] border border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">{isAm ? 'የአሁኑ መለያ:' : 'Current Role:'}</span>
          <strong className="text-amber-300 font-mono">
            {user?.role ? (user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Operator Admin' : 'User / Player') : 'Guest'}
          </strong>
          {user?.email && (
            <span className="text-slate-500 hidden sm:inline font-mono text-[10px]">({user.email})</span>
          )}
        </div>
        {isAuthenticated && (
          <button
            onClick={() => logout()}
            className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>{isAm ? 'ውጣ' : 'Logout'}</span>
          </button>
        )}
      </div>

      {/* 3 Portal Cards: User, Admin, Super Admin */}
      <div className="space-y-2.5">
        {portals.map((portal) => {
          const Icon = portal.icon;
          const isCurrentActive = location.pathname.startsWith(portal.path) || (portal.id === 'user' && location.pathname === '/dashboard');
          const isCurrentRole = user?.role === portal.role;

          let cardBorder = 'border-white/10 hover:border-white/20';
          let iconBg = 'bg-slate-800 text-slate-300';
          let badgeBg = 'bg-slate-800 text-slate-400';

          if (portal.color === 'blue') {
            cardBorder = isCurrentActive ? 'border-blue-500 bg-blue-950/20' : 'hover:border-blue-500/40';
            iconBg = 'bg-blue-600/20 text-blue-400 border border-blue-500/30';
            badgeBg = 'bg-blue-600/20 text-blue-300 border border-blue-500/30';
          } else if (portal.color === 'amber') {
            cardBorder = isCurrentActive ? 'border-amber-500 bg-amber-950/20' : 'hover:border-amber-500/40';
            iconBg = 'bg-amber-600/20 text-amber-400 border border-amber-500/30';
            badgeBg = 'bg-amber-600/20 text-amber-300 border border-amber-500/30';
          } else if (portal.color === 'rose') {
            cardBorder = isCurrentActive ? 'border-rose-500 bg-rose-950/20' : 'hover:border-rose-500/40';
            iconBg = 'bg-rose-600/20 text-rose-400 border border-rose-500/30';
            badgeBg = 'bg-rose-600/20 text-rose-300 border border-rose-500/30';
          }

          return (
            <div
              key={portal.id}
              className={`p-3 rounded-xl bg-[#121622] border transition-all ${cardBorder} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {isAm ? portal.titleAm : portal.titleEn}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${badgeBg}`}>
                      {isAm ? portal.badgeAm : portal.badgeEn}
                    </span>
                    {isCurrentActive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> {isAm ? 'የአሁን ገጽ' : 'Current'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {isAm ? portal.descriptionAm : portal.descriptionEn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  disabled={switching === portal.id}
                  onClick={() => handleSwitchTo(portal)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                    portal.color === 'blue'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/40'
                      : portal.color === 'amber'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-950/40'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                  }`}
                >
                  {switching === portal.id ? (
                    <span className="animate-spin text-xs">⌛</span>
                  ) : (
                    <>
                      <span>{isAm ? 'ክፈት' : 'Open'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
        <span>Paths: <code className="text-slate-400">/user</code> • <code className="text-slate-400">/admin</code> • <code className="text-slate-400">/super-admin</code></span>
        <button
          onClick={() => {
            navigate('/portals');
            if (onClose) onClose();
          }}
          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2"
        >
          <span>{isAm ? 'ሙሉ ማብራሪያ' : 'Portals Hub'}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
