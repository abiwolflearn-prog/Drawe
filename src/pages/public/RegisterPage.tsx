import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header.js';
import { Footer } from '../../components/layout/Footer.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { UserPlus, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await register(name, email, password, phone);
    setIsLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to register account');
    }
  };

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 sm:p-8 space-y-6 bg-[#11141D] border-white/10 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Create Player Account</h1>
            <p className="text-xs text-slate-400">
              Register to participate in live 01–80 draws and track payment verifications.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Abebe Bikila"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="abebe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+251911223344"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              {isLoading ? 'Creating Account...' : 'Register Account'}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};
