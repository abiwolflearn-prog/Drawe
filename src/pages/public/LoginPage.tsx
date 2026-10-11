import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Footer } from '../../components/layout/Footer.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { LogIn, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      if (redirect === 'checkout') {
        navigate('/');
      } else if (res.user?.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else if (res.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@draw.com');
    setPassword('password123');
  };

  const fillDemoPlayer = () => {
    setEmail('player@draw.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 pt-[max(2rem,env(safe-area-inset-top))] pb-28 md:pb-8">
        <Card className="max-w-md w-full p-6 sm:p-8 space-y-6 bg-[#11141D] border-white/10 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Account Sign In</h1>
            <p className="text-xs text-slate-400">
              Sign in to manage your selections and submit payment references.
            </p>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-3 bg-[#181D2C] border border-blue-500/20 rounded-xl space-y-2">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{t('auth.demoShortcut')}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fillDemoPlayer}
                className="flex-1 py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg text-xs font-semibold border border-blue-500/30 transition-colors"
              >
                Player
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="flex-1 py-1.5 px-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/30 transition-colors"
              >
                Operator Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('superadmin@draw.com');
                  setPassword('password123');
                }}
                className="flex-1 py-1.5 px-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 rounded-lg text-xs font-semibold border border-rose-500/30 transition-colors"
              >
                Super Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="player@draw.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-950/80 border border-rose-600/40 rounded-xl text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" variant="glow" fullWidth size="md" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};
