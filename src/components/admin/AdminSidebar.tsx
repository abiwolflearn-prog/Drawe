import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { 
  LayoutDashboard, 
  Dices, 
  Grid3X3, 
  CreditCard, 
  Users, 
  Trophy, 
  History, 
  FileText, 
  ShieldAlert, 
  Settings,
  Building2
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  const navItems = [
    { label: t('admin.dashboard'), path: '/admin', icon: LayoutDashboard },
    { label: t('admin.draws'), path: '/admin/draws', icon: Dices },
    { label: t('admin.numbersBoard'), path: '/admin/board', icon: Grid3X3 },
    { label: t('admin.paymentsQueue'), path: '/admin/payments', icon: CreditCard },
    { label: t('admin.players'), path: '/admin/players', icon: Users },
    { label: t('admin.winners'), path: '/admin/winners', icon: Trophy },
    { label: t('admin.results'), path: '/admin/results', icon: History },
    { label: t('admin.reports'), path: '/admin/reports', icon: FileText },
    { label: t('admin.auditLogs'), path: '/admin/audit-logs', icon: ShieldAlert },
    { label: t('admin.settings'), path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0D13] border-r border-white/10 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Tenant Workspace Badge */}
      <div className="p-4 border-b border-white/5 space-y-1">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
          <Building2 className="w-3.5 h-3.5" /> {t('admin.workspaceLabel')}
        </span>
        <p className="text-xs font-bold text-white truncate">
          Addis Draws Workspace
        </p>
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-blue-400" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
