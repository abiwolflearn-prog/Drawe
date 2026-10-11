import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { Header } from '../layout/Header.js';
import { Card } from '../ui/Card.js';
import { NavLink, Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Dices, 
  CreditCard, 
  ShieldAlert, 
  Settings,
  User,
  Layers
} from 'lucide-react';

export const SuperAdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading, login } = useAuth();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090B0E] flex items-center justify-center text-slate-400 text-sm font-mono">
        Verifying Super Admin authorization...
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center space-y-4 bg-[#141824] border-rose-500/30 shadow-2xl">
            <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Super Admin Access Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              You must be logged in with a Super Admin platform account (<code className="text-rose-300">superadmin@draw.com</code>) to view the SaaS control panel.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link
                to="/login"
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl"
              >
                Log In
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await login('superadmin@draw.com', 'password123');
                }}
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-rose-950/40"
              >
                1-Click Demo Super Admin
              </button>
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-4 text-xs">
              <Link to="/user" className="text-slate-400 hover:text-slate-200 underline">
                User Page
              </Link>
              <span className="text-slate-600">•</span>
              <Link to="/admin" className="text-slate-400 hover:text-slate-200 underline">
                Operator Admin Page
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const superNavItems = [
    { label: t('superAdmin.overview'), path: '/super-admin', icon: LayoutDashboard },
    { label: t('superAdmin.operators'), path: '/super-admin/operators', icon: Building2 },
    { label: t('admin.draws'), path: '/super-admin/draws', icon: Dices },
    { label: t('admin.paymentsQueue'), path: '/super-admin/payments', icon: CreditCard },
    { label: t('superAdmin.platformLogs'), path: '/super-admin/audit-logs', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        {/* Super Admin Sidebar */}
        <aside className="w-64 bg-[#0A0D14] border-r border-white/10 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
          <div className="p-4 border-b border-white/5 space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-400">
              <ShieldCheck className="w-4 h-4" /> SaaS Control Layer
            </span>
            <p className="text-[10px] text-slate-500">Platform-Wide Tenant Administration</p>
          </div>

          <nav className="p-3 space-y-1">
            {superNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/super-admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Role & Portal Navigation */}
          <div className="p-3 mt-auto border-t border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block">
              Portals & Roles
            </span>
            <NavLink
              to="/user"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <User className="w-4 h-4 shrink-0 text-blue-400" />
              <span>User / Player Page</span>
            </NavLink>
            <NavLink
              to="/admin"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Operator Admin Page</span>
            </NavLink>
            <NavLink
              to="/portals"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Layers className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Portals Hub</span>
            </NavLink>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
