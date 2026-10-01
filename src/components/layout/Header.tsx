import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { Button } from '../ui/Button.js';
import { LanguageSelector } from '../ui/LanguageSelector.js';
import { Shield, User, LogOut, Ticket } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090B0E]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 text-lg font-black tracking-tight text-white group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-mono text-sm font-bold text-white shadow-md shadow-blue-950/50 group-hover:scale-105 transition-transform">
            01-80
          </div>
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {t('brand.name')}
          </span>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <Link to="/" className="hover:text-blue-400 transition-colors">
            {t('nav.activeDraw')}
          </Link>
          <Link to="/results" className="hover:text-blue-400 transition-colors">
            {t('nav.results')}
          </Link>
          <Link to="/how-it-works" className="hover:text-blue-400 transition-colors">
            {t('nav.howItWorks')}
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-blue-400" />
              {t('nav.mySelections')}
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              {t('nav.adminPortal')}
            </Link>
          )}
        </nav>

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
                onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
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
