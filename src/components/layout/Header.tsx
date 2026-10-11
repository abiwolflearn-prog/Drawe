import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useSocket } from '../../context/SocketContext.js';
import { useI18n } from '../../i18n/index.js';
import { Button } from '../ui/Button.js';
import { LanguageSelector } from '../ui/LanguageSelector.js';
import { User, LogOut, Radio, Users } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isConnected, activePlayersCount } = useSocket();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090B0E]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Brand Wordmark & Live Sync Badge */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-black tracking-tight text-white group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-xs font-black text-white shadow-md shadow-rose-950/50 group-hover:scale-105 transition-transform">
              አደይ
            </div>
            <span className="bg-gradient-to-r from-amber-200 via-white to-slate-200 bg-clip-text text-transparent font-black">
              {t('brand.name')}
            </span>
          </Link>

          {/* Live WebSocket Presence Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#121722] border border-white/10 rounded-full text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-300 flex items-center gap-1">
              <Radio className="w-3 h-3 text-blue-400" />
              {isConnected ? 'LIVE SYNC' : 'CONNECTING'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Users className="w-3 h-3" />
              {activePlayersCount} active
            </span>
          </div>
        </div>

        {/* Zone 3: Language Selector & User Actions */}
        <div className="flex items-center gap-3">
          <LanguageSelector />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-200">{user?.name}</span>
                <span className="text-[10px] text-blue-400 font-mono uppercase">{user?.role}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (user?.role === 'SUPER_ADMIN') navigate('/super-admin');
                  else if (user?.role === 'ADMIN') navigate('/admin');
                  else navigate('/user');
                }}
                className="gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">{t('nav.profile')}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                title={t('nav.logout')}
              >
                <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-400" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                {t('nav.login')}
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                {t('nav.register')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
