import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Layers, Ticket, Trophy, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTelegram } from '../../context/TelegramContext.js';
import { useI18n } from '../../i18n/index.js';

interface NavItem {
  id: string;
  labelAm: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  getPath: (auth: { isAuthenticated: boolean; isAdmin: boolean }) => string;
  isActive: (pathname: string, search: string) => boolean;
}

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { triggerHaptic } = useTelegram();
  const { currentLang, t } = useI18n();

  const navItems: NavItem[] = [
    {
      id: 'home',
      labelAm: 'ዋና ገጽ',
      labelEn: 'Home',
      icon: Home,
      getPath: () => '/',
      isActive: (pathname) => pathname === '/',
    },
    {
      id: 'draws',
      labelAm: 'ዕጣዎች',
      labelEn: 'Draws',
      icon: Layers,
      getPath: () => '/operators',
      isActive: (pathname) => pathname.startsWith('/operators'),
    },
    {
      id: 'my-numbers',
      labelAm: 'ቁጥሮቼ',
      labelEn: 'My Numbers',
      icon: Ticket,
      getPath: () => '/dashboard',
      isActive: (pathname, search) => pathname === '/dashboard' && !search.includes('view=profile'),
    },
    {
      id: 'results',
      labelAm: 'ውጤቶች',
      labelEn: 'Results',
      icon: Trophy,
      getPath: () => '/results',
      isActive: (pathname) => pathname.startsWith('/results'),
    },
    {
      id: 'profile',
      labelAm: 'መገለጫ',
      labelEn: 'Profile',
      icon: User,
      getPath: ({ isAuthenticated, isAdmin }) => {
        if (isAdmin) return '/admin';
        if (isAuthenticated) return '/dashboard?view=profile';
        return '/login';
      },
      isActive: (pathname, search) =>
        pathname.startsWith('/admin') ||
        pathname === '/login' ||
        pathname === '/register' ||
        (pathname === '/dashboard' && search.includes('view=profile')),
    },
  ];

  const handleNavClick = (item: NavItem) => {
    triggerHaptic('light');
    const targetPath = item.getPath({ isAuthenticated, isAdmin });
    navigate(targetPath);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-[#090B0E]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_25px_rgba(0,0,0,0.85)] select-none"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="mx-auto max-w-lg px-2 pt-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(location.pathname, location.search);
          const label = currentLang === 'am' ? item.labelAm : item.labelEn;
          const subLabel = currentLang === 'am' ? item.labelEn : item.labelAm;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              type="button"
              className={`relative flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 group focus:outline-none ${
                active
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Top Accent Pip */}
              {active && (
                <span className="absolute -top-1.5 w-7 h-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-in fade-in zoom-in-75 duration-200" />
              )}

              {/* Icon Container with Subtle Background Pill for Active */}
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-transform duration-200 ${
                  active
                    ? 'bg-amber-400/10 text-amber-300 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'group-hover:scale-105'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-[64px] ${
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
