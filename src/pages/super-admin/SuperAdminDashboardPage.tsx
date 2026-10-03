import React, { useState, useEffect } from 'react';
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { Building2, Dices, DollarSign, Users, ShieldCheck, Plus, Check, Ban } from 'lucide-react';
import { ITenant } from '../../types/index.js';

export const SuperAdminDashboardPage: React.FC = () => {
  const { token } = useAuth();
  const { t, formatCurrency } = useI18n();
  const [metrics, setMetrics] = useState<any>(null);
  const [operators, setOperators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuperDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/super-admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setOperators(data.tenants || []);
      }
    } catch (err) {
      console.error('Failed to load Super Admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSuperDashboard();
  }, [token]);

  const handleActivate = async (id: string) => {
    await fetch(`/api/super-admin/operators/${id}/activate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSuperDashboard();
  };

  const handleSuspend = async (id: string) => {
    if (confirm('Suspend this SaaS Operator workspace? Their admin and players will lose access to active draws.')) {
      await fetch(`/api/super-admin/operators/${id}/suspend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSuperDashboard();
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-400" />
            {t('superAdmin.portalTitle')}
          </h1>
          <p className="text-xs text-slate-400">
            Platform-wide multi-tenant SaaS workspace controls & operator monitoring.
          </p>
        </div>

        {/* Global Platform Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 space-y-2 bg-[#11141D] border-rose-500/30">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('superAdmin.metricTotalOperators')}</span>
              <Building2 className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-white font-mono tabular-nums">
              {metrics?.totalOperators || 0}
            </p>
            <p className="text-[10px] text-slate-500">Active SaaS Customers</p>
          </Card>

          <Card className="p-5 space-y-2 bg-[#11141D] border-emerald-500/30">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('superAdmin.metricActiveOperators')}</span>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
              {metrics?.activeOperators || 0}
            </p>
            <p className="text-[10px] text-slate-500">Operating workspace tenants</p>
          </Card>

          <Card className="p-5 space-y-2 bg-[#11141D] border-blue-500/30">
            <div className="flex items-center justify-between text-blue-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Platform Draws</span>
              <Dices className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-blue-300 font-mono tabular-nums">
              {metrics?.totalDraws || 0}
            </p>
            <p className="text-[10px] text-slate-500">Across all operator tenants</p>
          </Card>

          <Card className="p-5 space-y-2 bg-[#11141D] border-amber-500/30">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('superAdmin.metricTotalVolume')}</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-amber-300 font-mono tabular-nums">
              {formatCurrency(metrics?.totalCollectedAmount || 0)}
            </p>
            <p className="text-[10px] text-slate-500">Combined revenue volume</p>
          </Card>
        </div>

        {/* Operators Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-400" />
              SaaS Operator Workspaces ({operators.length})
            </h3>

            <Button variant="primary" size="sm" onClick={() => window.location.href = '/super-admin/operators'}>
              <Plus className="w-4 h-4 mr-1" /> {t('superAdmin.createOperator')}
            </Button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              Loading SaaS operator workspaces...
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-[#11141D]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#161B28] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Operator Workspace</th>
                    <th className="p-3">Slug ID</th>
                    <th className="p-3">Admin Email</th>
                    <th className="p-3">Draws</th>
                    <th className="p-3">Players</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {operators.map((op) => (
                    <tr key={op._id || op.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-bold text-slate-100">{op.name}</td>
                      <td className="p-3 font-mono text-blue-300 text-[11px]">{op.slug}</td>
                      <td className="p-3 text-slate-300">{op.ownerEmail}</td>
                      <td className="p-3 font-mono font-bold text-slate-200">{op.drawsCount || 0}</td>
                      <td className="p-3 font-mono font-bold text-slate-200">{op.playersCount || 0}</td>
                      <td className="p-3">
                        {op.status === 'ACTIVE' ? (
                          <Badge variant="winner">{t('superAdmin.statusActive')}</Badge>
                        ) : (
                          <Badge variant="selected">{t('superAdmin.statusSuspended')}</Badge>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {op.status === 'SUSPENDED' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleActivate(op._id || op.id)}
                            className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> {t('superAdmin.activate')}
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleSuspend(op._id || op.id)}
                            className="px-2.5 py-1 text-xs"
                          >
                            <Ban className="w-3.5 h-3.5 mr-1" /> {t('superAdmin.suspend')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};
