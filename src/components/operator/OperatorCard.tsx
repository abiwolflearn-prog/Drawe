import React from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/index.js';
import { CheckCircle2, Users, Trophy, ExternalLink, Send, Activity, Sparkles, MapPin } from 'lucide-react';
import { ITenant } from '../../types/index.js';

export interface OperatorCardProps {
  operator: ITenant;
}

export const OperatorCard: React.FC<OperatorCardProps> = ({ operator }) => {
  const { t } = useI18n();

  return (
    <Card className="p-5 bg-gradient-to-br from-[#121622] to-[#181D2C] border-white/10 hover:border-blue-500/40 transition-all duration-300 shadow-xl space-y-4 group">
      {/* Top Header: Logo & Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
            {operator.logo ? (
              <img src={operator.logo} alt={operator.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono font-black text-blue-400 text-lg">{operator.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                {operator.name}
              </h3>
              {operator.isVerified && (
                <span title={t('operators.verifiedBadge')}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </span>
              )}
            </div>
            {operator.location && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500" />
                {operator.location}
              </p>
            )}
          </div>
        </div>

        {operator.isFeatured && (
          <Badge variant="pending">
            <Sparkles className="w-3 h-3" /> {t('operators.filterFeatured')}
          </Badge>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
        {operator.description || 'Verified Ethiopian 01–80 draw operator running active community draws.'}
      </p>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-[#0B0E16] rounded-xl border border-white/5 text-center text-xs">
        <div>
          <span className="block text-[10px] font-semibold text-slate-400 uppercase">{t('operators.completedRounds')}</span>
          <span className="font-mono font-extrabold text-blue-300 text-sm flex items-center justify-center gap-1 mt-0.5">
            <Trophy className="w-3 h-3 text-amber-400" />
            {operator.completedRounds || 0}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-semibold text-slate-400 uppercase">{t('operators.membersCount')}</span>
          <span className="font-mono font-extrabold text-emerald-400 text-sm flex items-center justify-center gap-1 mt-0.5">
            <Users className="w-3 h-3 text-emerald-400" />
            {(operator.telegramMemberCount || 0).toLocaleString()}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-semibold text-slate-400 uppercase">{t('operators.performanceScore')}</span>
          <span className="font-mono font-extrabold text-amber-300 text-sm flex items-center justify-center gap-1 mt-0.5">
            <Activity className="w-3 h-3 text-amber-400" />
            {operator.performanceScore || 90}%
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Link to={`/operators/${operator.slug}`} className="flex-1">
          <Button variant="outline" size="sm" fullWidth className="text-xs">
            {t('operators.viewProfile')}
          </Button>
        </Link>

        {operator.telegramCommunityUrl && (
          <a
            href={operator.telegramCommunityUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1"
          >
            <Button variant="primary" size="sm" fullWidth className="text-xs bg-sky-600 hover:bg-sky-500 border-sky-400/30">
              <Send className="w-3.5 h-3.5 mr-1" />
              {t('operators.joinTelegram')}
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
};
