import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Footer } from '../../components/layout/Footer.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { useTelegram } from '../../context/TelegramContext.js';
import { useI18n } from '../../i18n/index.js';
import { LanguageSelector } from '../../components/ui/LanguageSelector.js';
import { RolePortalSwitcher } from '../../components/layout/RolePortalSwitcher.js';
import { 
  Ticket, 
  CreditCard, 
  Clock, 
  User, 
  LogOut, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Send,
  Layers,
  ArrowRight,
  Crown
} from 'lucide-react';
import { IPayment } from '../../types/index.js';

export const PlayerDashboardPage: React.FC = () => {
  const { user, token, logout, isAdmin } = useAuth();
  const { isTelegramWebApp, telegramUser, triggerHaptic } = useTelegram();
  const { t, language } = useI18n();
  const currentLang = language;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [payments, setPayments] = useState<IPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeTab = searchParams.get('view') === 'profile' 
    ? 'profile' 
    : searchParams.get('view') === 'portals'
    ? 'portals'
    : 'numbers';

  const setTab = (tab: 'numbers' | 'profile' | 'portals') => {
    triggerHaptic('light');
    setSearchParams({ view: tab });
  };

  useEffect(() => {
    const fetchMyPayments = async () => {
      try {
        const res = await fetch('/api/payments/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
        }
      } catch (err) {
        console.error('Failed to load my payments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchMyPayments();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // If player is not logged in and not in Telegram auto-auth
  if (!token && !isLoading) {
    return (
      <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
        <main className="flex-1 mx-auto max-w-md w-full p-4 sm:p-6 flex flex-col items-center justify-center text-center space-y-5 pb-28 pt-[max(2rem,env(safe-area-inset-top))]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
            <Ticket className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              {currentLang === 'am' ? 'የተጫዋች መለያ ይግቡ' : 'Sign In to Your Account'}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {currentLang === 'am'
                ? 'የመረጧቸውን ቁጥሮች፣ የክፍያ ሁኔታዎች እና የተረጋገጡ ትኬቶችን ለማየት እባክዎ ወደ መለያዎ ይግቡ።'
                : 'Sign in to view your selected numbers, payment verifications, and active draw tickets.'}
            </p>
          </div>
          <div className="flex gap-3 w-full max-w-xs pt-2">
            <Link
              to="/login?redirect=user"
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/40 text-center transition-all"
            >
              {currentLang === 'am' ? 'ግባ (Log In)' : 'Log In'}
            </Link>
            <Link
              to="/register"
              className="flex-1 py-3 px-4 bg-[#141A28] hover:bg-[#1E263A] text-slate-200 text-xs font-bold rounded-xl border border-white/10 text-center transition-all"
            >
              {currentLang === 'am' ? 'ይመዝገቡ (Register)' : 'Register'}
            </Link>
          </div>

          {/* Quick Role & Portal Access */}
          <div className="w-full max-w-md pt-2 text-left">
            <RolePortalSwitcher />
          </div>

          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 pt-2 transition-colors"
          >
            <span>{currentLang === 'am' ? 'ወደ ዕጣ ሰሌዳ ተመለስ' : 'Back to Draw Board'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
      <main className="flex-1 mx-auto max-w-5xl w-full p-4 sm:p-6 space-y-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 pb-28 md:pb-12">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#11141D] border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                {currentLang === 'am' ? 'የተጠቃሚ መለያ ገጽ' : 'User Account Page'}
              </span>
              <h1 className="text-lg sm:text-xl font-black text-white">
                {user?.name || (currentLang === 'am' ? 'የተጫዋች ገጽ' : 'Player Portal')}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link
              to="/portals"
              className="px-3 py-1.5 rounded-xl bg-[#181D2C] hover:bg-[#20273B] text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{currentLang === 'am' ? 'ሁሉንም ገጾች እይ' : 'All Portals'}</span>
            </Link>
          </div>
        </div>

        {/* Top Tab Bar: My Numbers vs Profile vs Portals */}
        <div className="flex items-center gap-2 p-1.5 bg-[#11141D] border border-white/10 rounded-2xl max-w-lg mx-auto sm:mx-0">
          <button
            onClick={() => setTab('numbers')}
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'numbers'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>{currentLang === 'am' ? 'ቁጥሮቼ' : 'My Numbers'}</span>
            {payments.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
                {payments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('profile')}
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{currentLang === 'am' ? 'መገለጫዬ' : 'Profile'}</span>
          </button>
          <button
            onClick={() => setTab('portals')}
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'portals'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{currentLang === 'am' ? 'ፖርታሎች' : 'Roles'}</span>
          </button>
        </div>

        {/* Tab 1: Profile View */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <Card className="p-6 bg-[#11141D] border-amber-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-rose-950/40">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                      {currentLang === 'am' ? 'የተጫዋች መገለጫ' : 'Player Account Profile'}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-white">{user?.name}</h1>
                    <span className="text-xs text-slate-400 font-mono">ID: {user?.id || user?._id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="available">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{user?.role || 'PLAYER'}</span>
                  </Badge>
                  {isTelegramWebApp && (
                    <Badge variant="pending">
                      <Send className="w-3.5 h-3.5 text-blue-400" />
                      <span>Telegram Connected</span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Profile Details List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#161B28] rounded-xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Email Address</span>
                  </div>
                  <p className="font-semibold text-slate-200">{user?.email || 'N/A'}</p>
                </div>
                <div className="p-3 bg-[#161B28] rounded-xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Phone Number</span>
                  </div>
                  <p className="font-semibold text-slate-200">{user?.phone || 'Not provided'}</p>
                </div>
              </div>

              {/* Operator / Tenant Association */}
              <div className="p-4 bg-[#141824] rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Operator Tenant
                  </span>
                  <span className="font-bold text-slate-200 font-mono text-sm">
                    {user?.tenantId || 'tenant_addis'}
                  </span>
                </div>
                <Link
                  to="/operators"
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold self-start sm:self-auto transition-colors"
                >
                  {currentLang === 'am' ? 'አዘጋጅ ቀይር (Browse Operators)' : 'Browse Operators'}
                </Link>
              </div>

              {/* Actions: Admin Portal & Logout */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{currentLang === 'am' ? 'ወደ አድሚን ፖርታል' : 'Open Admin Portal'}</span>
                  </Link>
                )}
                {user?.role === 'SUPER_ADMIN' && (
                  <Link
                    to="/super-admin"
                    className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Crown className="w-4 h-4 text-rose-400" />
                    <span>{currentLang === 'am' ? 'ወደ ዋና አድሚን' : 'Open Super Admin'}</span>
                  </Link>
                )}
                <Link
                  to="/portals"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>{currentLang === 'am' ? 'የገጾች ማውጫ' : 'Portals Hub'}</span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="gap-2 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 ml-auto"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{currentLang === 'am' ? 'ውጣ (Log Out)' : 'Log Out'}</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: My Numbers & Direct Payment Submissions */}
        {activeTab === 'numbers' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>{currentLang === 'am' ? 'የተመረጡ ቁጥሮቼና ክፍያዎች' : 'My Direct Payment Submissions'}</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {payments.length} {currentLang === 'am' ? 'ክፍያዎች' : 'Submissions'}
              </span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                Loading my payment history...
              </div>
            ) : payments.length === 0 ? (
              <Card className="p-8 text-center text-slate-400 text-xs space-y-3 bg-[#11141D] border-white/5">
                <Clock className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300 text-sm">
                  {currentLang === 'am' ? 'ምንም የተያዘ ቁጥር የለም' : 'No payment submissions yet'}
                </p>
                <p className="text-slate-400 max-w-sm mx-auto">
                  {currentLang === 'am'
                    ? 'በዋናው የዕጣ ሰሌዳ ላይ ክፍት ቁጥሮችን በመምረጥ ቀጥታ ክፍያ ይላኩ።'
                    : 'Select available numbers on the main board to submit your payment and enter live draws.'}
                </p>
                <div className="pt-2">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/40 transition-all"
                  >
                    <Layers className="w-4 h-4" />
                    <span>{currentLang === 'am' ? 'ቁጥር ምረጥ (Pick Numbers)' : 'Pick Numbers'}</span>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payments.map((p) => (
                  <Card key={p._id || p.id} className="p-5 space-y-3 bg-[#131722] border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        {p.drawTitle || 'Round #001'}
                      </span>
                      {p.status === 'PENDING' && (
                        <Badge variant="pending">
                          {currentLang === 'am' ? 'በማረጋገጥ ላይ' : 'Pending Verification'}
                        </Badge>
                      )}
                      {p.status === 'APPROVED' && (
                        <Badge variant="winner">
                          {currentLang === 'am' ? 'ተረጋግጧል' : 'Confirmed'}
                        </Badge>
                      )}
                      {p.status === 'REJECTED' && (
                        <Badge variant="selected">
                          {currentLang === 'am' ? 'ተሰርዟል' : 'Rejected'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-2 border-y border-white/5 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          {currentLang === 'am' ? 'የተመረጡ ቁጥሮች' : 'Selected Numbers'}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1 font-mono font-bold text-rose-300">
                          {p.numbers.map((n) => (
                            <span key={n} className="px-1.5 py-0.5 bg-rose-950/80 border border-rose-500/30 rounded">
                              {n < 10 ? `0${n}` : `${n}`}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          {currentLang === 'am' ? 'የተከፈለው' : 'Amount Paid'}
                        </span>
                        <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                          {p.amount} ETB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Ref: <strong className="text-blue-300">{p.transactionReference}</strong></span>
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>

                    {p.status === 'REJECTED' && p.rejectionReason && (
                      <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/20">
                        Reason: {p.rejectionReason}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Portals & Role Switcher */}
        {activeTab === 'portals' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <RolePortalSwitcher />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
