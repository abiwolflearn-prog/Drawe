import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Footer } from '../../components/layout/Footer.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { useI18n } from '../../i18n/index.js';
import { 
  Building2, 
  CheckCircle2, 
  Users, 
  Trophy, 
  Send, 
  Activity, 
  MapPin, 
  Calendar, 
  Dices,
  ShieldCheck 
} from 'lucide-react';
import { ITenant } from '../../types/index.js';

export const OperatorProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, formatDate } = useI18n();
  const [operator, setOperator] = useState<ITenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOperator = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/super-admin/public/operators/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setOperator(data.operator);
        }
      } catch (err) {
        console.error('Failed to load operator profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchOperator();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center text-slate-500 text-xs font-mono pt-[max(1rem,env(safe-area-inset-top))]">
          Loading operator profile...
        </main>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <Card className="max-w-md w-full p-6 text-center space-y-4">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h2 className="text-xl font-bold text-white">Operator Profile Not Found</h2>
            <Link to="/operators" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
              Return to Operators Directory
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
      <main className="flex-1 mx-auto max-w-4xl w-full p-4 sm:p-6 space-y-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6 pb-28 sm:pb-32">
        {/* Profile Banner Card */}
        <Card className="p-6 bg-gradient-to-br from-[#121622] to-[#1A2030] border-blue-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center overflow-hidden shrink-0 shadow-xl">
                {operator.logo ? (
                  <img src={operator.logo} alt={operator.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono font-black text-blue-300 text-2xl">{operator.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">{operator.name}</h1>
                  {operator.isVerified && (
                    <Badge variant="winner" className="gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('operators.verifiedBadge')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                  {operator.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {operator.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Joined {formatDate(operator.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {operator.telegramCommunityUrl && (
              <a href={operator.telegramCommunityUrl} target="_blank" rel="noreferrer">
                <Button variant="glow" size="md" className="bg-sky-600 hover:bg-sky-500">
                  <Send className="w-4 h-4 mr-2" /> {t('operators.joinTelegram')}
                </Button>
              </a>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-4">
            {operator.description || 'Verified Ethiopian 01–80 draw operator running active community draws.'}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#0B0E16] rounded-2xl border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('operators.completedRounds')}</span>
              <p className="text-xl font-black text-blue-300 font-mono tabular-nums flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> {operator.completedRounds || 0}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('operators.membersCount')}</span>
              <p className="text-xl font-black text-emerald-400 font-mono tabular-nums flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" /> {(operator.telegramMemberCount || 0).toLocaleString()}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('operators.participants')}</span>
              <p className="text-xl font-black text-white font-mono tabular-nums flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-blue-400" /> {(operator.totalParticipants || 0).toLocaleString()}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('operators.performanceScore')}</span>
              <p className="text-xl font-black text-amber-300 font-mono tabular-nums flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-400" /> {operator.performanceScore || 90}%
              </p>
            </div>
          </div>
        </Card>

        {/* Enter Active Round Callout */}
        <Card className="p-6 bg-[#11141D] border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Dices className="w-5 h-5 text-emerald-400" /> Active 01–80 Draw Round
            </h3>
            <p className="text-xs text-slate-400">
              Select available numbers on the main 01–80 board to enter this operator's active draw round.
            </p>
          </div>

          <Link to="/">
            <Button variant="glow" size="md" className="shrink-0">
              Enter 01–80 Board
            </Button>
          </Link>
        </Card>
      </main>

      <Footer />
    </div>
  );
};
