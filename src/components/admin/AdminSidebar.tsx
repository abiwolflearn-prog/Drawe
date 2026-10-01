import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Settings 
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Draws', path: '/admin/draws', icon: Dices },
    { label: 'Numbers Board', path: '/admin/board', icon: Grid3X3 },
    { label: 'Payments Queue', path: '/admin/payments', icon: CreditCard },
    { label: 'Players', path: '/admin/players', icon: Users },
    { label: 'Winners', path: '/admin/winners', icon: Trophy },
    { label: 'Draw Results', path: '/admin/results', icon: History },
    { label: 'Reports', path: '/admin/reports', icon: FileText },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0D13] border-r border-white/10 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-white/5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
          Admin Control Center
        </span>
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
