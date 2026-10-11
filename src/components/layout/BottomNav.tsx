import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Ticket, Shield, Trophy, HelpCircle } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext.js';
import { useI18n } from '../../i18n/index.js';

interface NavItem {
  id: string;
  labelAm: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  isActive: (pathname: string) => boolean;
}

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerHaptic } = useTelegram();
  const { language } = useI18n();

  const navItems: NavItem[] = [
    {
      id: 'active-draw',
      labelAm: 'የአሁኑ ዕጣ',
      labelEn: 'Current Draw',
      icon: Ticket,
      path: '/',
      isActive: (pathname) => pathname === '/',
    },
    {
      id: 'operators',
      labelAm: 'አዘጋጆች',
      labelEn: 'Operators',
      icon: Shield,
      path: '/operators',
      isActive: (pathname) => pathname.startsWith('/operators'),
    },
    {
      id: 'results',
      labelAm: 'ውጤቶች',
      labelEn: 'Results',
      icon: Trophy,
      path: '/results',
      isActive: (pathname) => pathname.startsWith('/results'),
    },
    {
      id: 'how-it-works',
      labelAm: 'እንዴት ይሰራል?',
      labelEn: 'How It Works',
      icon: HelpCircle,
      path: '/how-it-works',
      isActive: (pathname) => pathname.startsWith('/how-it-works'),
    },
  ];

  const handleNavClick = (path: string) => {
    triggerHaptic('light');
    navigate(path);
  };

  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/super-admin') ||
    location.pathname.startsWith('/superadmin')
  ) {
    return null;
  }

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#090B0E]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_25px_rgba(0,0,0,0.85)] select-none"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="mx-auto max-w-md sm:max-w-xl px-2 sm:px-6 pt-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(location.pathname);
          const label = language === 'am' ? item.labelAm : item.labelEn;
          const subLabel = language === 'am' ? item.labelEn : item.labelAm;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              type="button"
              className={`relative flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-95 group focus:outline-none ${
                active
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Top Accent Pip Indicator */}
              {active && (
                <span className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-in fade-in zoom-in-75 duration-200" />
              )}

              {/* Icon Container */}
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-transform duration-200 ${
                  active
                    ? 'bg-amber-400/10 text-amber-300 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'group-hover:scale-105'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Amharic / Multilingual Label */}
              <span
                className={`text-[11px] sm:text-xs tracking-tight leading-tight mt-0.5 truncate max-w-[85px] sm:max-w-none ${
                  active ? 'text-amber-300 font-extrabold' : 'text-slate-400 font-medium'
                }`}
                title={`${label} (${subLabel})`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
