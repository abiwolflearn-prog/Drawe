import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Footer } from '../../components/layout/Footer.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { LanguageSelector } from '../../components/ui/LanguageSelector.js';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { 
  User, 
  ShieldCheck, 
  Crown, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Key, 
  ShieldAlert, 
  CreditCard, 
  Dices, 
  Building2,
  Terminal,
  LogOut,
  Sparkles
} from 'lucide-react';

export const PortalsHubPage: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { language } = useI18n();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const isAm = language === 'am';

  const handleQuickDemo = async (role: string, email: string, destination: string) => {
    setLoadingRole(role);
    try {
      await login(email, 'password123');
      navigate(destination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRole(null);
    }
  };

  const portalCards = [
    {
      id: 'user',
      titleAm: 'የተጫዋች ገጽ (User Page)',
      titleEn: 'User / Player Portal',
      subtitleAm: 'የተጠቃሚ መለያና የትኬት ክትትል',
      subtitleEn: 'Player Account & Ticket Management',
      path: '/user',
      alias: '/dashboard',
      role: 'PLAYER',
      badgeAm: 'ተጠቃሚ / ተጫዋች',
      badgeEn: 'Player Role',
      demoEmail: 'player@draw.com',
      gradient: 'from-blue-600/20 via-blue-900/10 to-transparent',
      borderColor: 'border-blue-500/30 hover:border-blue-500',
      textColor: 'text-blue-400',
      btnColor: 'bg-blue-600 hover:bg-blue-500 text-white',
      icon: User,
      featuresAm: [
        'የተመረጡ ቁጥሮችንና የቦታ ይዞታን በቀጥታ መከታተል',
        'የቴሌብር (Telebirr) እና CBE የክፍያ ማረጋገጫ ማስገቢያ',
        'የተረጋገጡ የዕጣ ትኬቶችን እና የክፍያ ሁኔታ (Confirmed / Pending / Rejected)',
        'የተጠቃሚ መገለጫና አዘጋጅ መቀየሪያ (Tenant Association)',
      ],
      featuresEn: [
        'Track chosen numbers & active reserved tickets',
        'Submit Telebirr & CBE transaction reference codes',
        'Real-time verification status badges (Pending / Approved / Rejected)',
        'Player profile details & operator workspace switcher',
      ],
    },
    {
      id: 'admin',
      titleAm: 'የአዘጋጅ አድሚን ገጽ (Admin Page)',
      titleEn: 'Operator Tenant Admin',
      subtitleAm: 'የዕጣ አዘጋጅ የስራ አመራር ክፍል',
      subtitleEn: 'Operator Draw & Payment Review Controls',
      path: '/admin',
      alias: '/admin/payments',
      role: 'ADMIN',
      badgeAm: 'የአዘጋጅ አስተዳዳሪ',
      badgeEn: 'Operator Admin',
      demoEmail: 'admin@draw.com',
      gradient: 'from-amber-600/20 via-amber-900/10 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-500',
      textColor: 'text-amber-400',
      btnColor: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black',
      icon: ShieldCheck,
      featuresAm: [
        'የተላኩ ክፍያዎችን በ1-ክሊክ ማረጋገጥ (Approve) ወይም ውድቅ ማድረግ (Reject)',
        'የዕጣ ዙሮችን መጀመር፣ ማቆም እና አሸናፊዎችን ማውጣት (Trigger Draw)',
        'የቀጥታ ሰሌዳ (Live Grid 01-80) ቅጽበታዊ ሁኔታ መቆጣጠር',
        'የገቢ ማጠቃለያ ስታቲስቲክስ እና የኦዲት መዝገብ (Audit Logs)',
      ],
      featuresEn: [
        'Review incoming payments: 1-click Approve or Reject with reason',
        'Manage draw rounds: Create, lock, and trigger provably-fair winner',
        'Live 01–80 grid monitor with instant WebSocket sync',
        'Tenant revenue collection metrics and operator audit trails',
      ],
    },
    {
      id: 'super-admin',
      titleAm: 'ዋና አስተዳዳሪ ገጽ (Super Admin Page)',
      titleEn: 'Platform SaaS Super Admin',
      subtitleAm: 'የመላው ፕላትፎርም የበላይ ቁጥጥር',
      subtitleEn: 'Multi-Tenant Operator SaaS Governance',
      path: '/super-admin',
      alias: '/superadmin',
      role: 'SUPER_ADMIN',
      badgeAm: 'ዋና ሲስተም አድሚን',
      badgeEn: 'Platform Super Admin',
      demoEmail: 'superadmin@draw.com',
      gradient: 'from-rose-600/20 via-rose-900/10 to-transparent',
      borderColor: 'border-rose-500/30 hover:border-rose-500',
      textColor: 'text-rose-400',
      btnColor: 'bg-rose-600 hover:bg-rose-500 text-white font-bold',
      icon: Crown,
      featuresAm: [
        'አዳዲስ አዘጋጆችን (Tenants) ማጽደቅ፣ ማገድ (Suspend) ወይም ማንቃት',
        'መላውን የፕላትፎርም ዕጣዎች እና የገንዘብ እንቅስቃሴ መከታተል',
        'የኦፕሬተሮች ውልና የክፍያ ፕሮቶኮሎችን ማስተዳደር',
        'የደህንነት ኦዲት እና የሲስተም ሎግ ሙሉ ቁጥጥር',
      ],
      featuresEn: [
        'Approve, suspend, or activate operator tenant accounts',
        'Monitor platform-wide volume, total draws, and active players',
        'Manage operator commission rates and bank credentials',
        'Comprehensive security audit trails across all workspaces',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <main className="flex-1 mx-auto max-w-6xl w-full p-4 sm:p-6 space-y-8 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 pb-28 sm:pb-32">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#11141D] border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-950/40">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                {isAm ? 'የድራው አፕሊኬሽን ፖርታሎች' : 'Drawe Multi-Role Portals'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {isAm ? 'የተጠቃሚ፣ አድሚን እና ሱፐር አድሚን ገጾች' : 'User, Admin & Super Admin Pages'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link
              to="/"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
            >
              {isAm ? 'ወደ ዕጣ ሰሌዳ' : 'To Draw Board'}
            </Link>
          </div>
        </div>

        {/* Current Active User Status Bar */}
        <div className="p-4 rounded-xl bg-[#131722] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-slate-400 mr-2">{isAm ? 'የአሁን መለያ ሁኔታ:' : 'Current Session:'}</span>
              {isAuthenticated ? (
                <span className="font-bold text-white">
                  {user?.name} — <strong className="text-amber-400 font-mono">{user?.role}</strong> ({user?.email})
                </span>
              ) : (
                <span className="text-slate-400 italic">
                  {isAm ? 'እንግዳ (Guest / Not Signed In)' : 'Guest (Not Signed In)'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => logout()}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isAm ? 'ውጣ (Logout)' : 'Logout'}</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
              >
                {isAm ? 'ግባ (Login)' : 'Login'}
              </Link>
            )}
          </div>
        </div>

        {/* 3 Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portalCards.map((portal) => {
            const Icon = portal.icon;
            const isCurrentRole = user?.role === portal.role;

            return (
              <Card
                key={portal.id}
                className={`p-6 flex flex-col justify-between bg-gradient-to-b ${portal.gradient} bg-[#11141D] border ${portal.borderColor} rounded-2xl shadow-xl transition-all duration-300 relative group`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-[#0B0E15] border border-white/10 ${portal.textColor} shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${portal.textColor}`}>
                      {isAm ? portal.badgeAm : portal.badgeEn}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                      {isAm ? portal.titleAm : portal.titleEn}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isAm ? portal.subtitleAm : portal.subtitleEn}
                    </p>
                    <div className="flex gap-2 mt-2 font-mono text-[11px] text-slate-500">
                      <span>Path: <strong className="text-slate-300">{portal.path}</strong></span>
                      {portal.alias && <span>• Alias: <strong className="text-slate-400">{portal.alias}</strong></span>}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {(isAm ? portal.featuresAm : portal.featuresEn).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${portal.textColor}`} />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-6 mt-6 border-t border-white/10 space-y-2.5">
                  <button
                    onClick={() => navigate(portal.path)}
                    type="button"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${portal.btnColor}`}
                  >
                    <span>{isAm ? 'ወደ ገጹ ሂድ (Open Page)' : 'Open Page'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleQuickDemo(portal.id, portal.demoEmail, portal.path)}
                    type="button"
                    disabled={loadingRole === portal.id}
                    className="w-full py-2 px-3 rounded-xl text-[11px] font-semibold bg-[#161B28] hover:bg-[#1E2536] text-slate-300 border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Key className="w-3 h-3 text-amber-400" />
                    <span>
                      {loadingRole === portal.id
                        ? 'Logging in...'
                        : isAm 
                        ? `በዚህ ሚና በ1-ክሊክ ግባ (${portal.demoEmail})` 
                        : `1-Click Demo Login (${portal.demoEmail})`}
                    </span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Route Architecture Table */}
        <Card className="p-6 bg-[#11141D] border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {isAm ? 'የመንገዶች አደረጃጀት (Routing Architecture)' : 'Route Architecture & Access Controls'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Primary Path</th>
                  <th className="py-2 px-3">Aliases</th>
                  <th className="py-2 px-3">Component</th>
                  <th className="py-2 px-3">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr className="hover:bg-white/5">
                  <td className="py-2.5 px-3 font-bold text-blue-400">User / Player</td>
                  <td className="py-2.5 px-3 text-white">/user</td>
                  <td className="py-2.5 px-3 text-slate-400">/dashboard, /profile</td>
                  <td className="py-2.5 px-3 text-slate-400">PlayerDashboardPage</td>
                  <td className="py-2.5 px-3 text-emerald-400">Authenticated Player / Auto Telegram</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-2.5 px-3 font-bold text-amber-400">Operator Admin</td>
                  <td className="py-2.5 px-3 text-white">/admin</td>
                  <td className="py-2.5 px-3 text-slate-400">/admin/payments, /admin/draws</td>
                  <td className="py-2.5 px-3 text-slate-400">AdminDashboardPage</td>
                  <td className="py-2.5 px-3 text-amber-400">ADMIN or SUPER_ADMIN role</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-2.5 px-3 font-bold text-rose-400">Super Admin</td>
                  <td className="py-2.5 px-3 text-white">/super-admin</td>
                  <td className="py-2.5 px-3 text-slate-400">/superadmin, /super-admin/operators</td>
                  <td className="py-2.5 px-3 text-slate-400">SuperAdminDashboardPage</td>
                  <td className="py-2.5 px-3 text-rose-400">SUPER_ADMIN role only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};
