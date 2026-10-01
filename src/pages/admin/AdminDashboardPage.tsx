import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { PaymentReviewRow } from '../../components/admin/PaymentReviewRow.js';
import { useAuth } from '../../context/AuthContext.js';
import { 
  CreditCard, 
  Dices, 
  DollarSign, 
  CheckCircle2, 
  Users, 
  Clock 
} from 'lucide-react';
import { IPayment } from '../../types/index.js';

export const AdminDashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [pendingPayments, setPendingPayments] = useState<IPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const resDash = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resDash.ok) {
        const dataDash = await resDash.json();
        setMetrics(dataDash.metrics);
      }

      const resPayments = await fetch('/api/admin/payments?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resPayments.ok) {
        const dataPayments = await resPayments.json();
        setPendingPayments(dataPayments.payments || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  const handleApprove = async (id: string) => {
    await fetch(`/api/admin/payments/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDashboardData();
  };

  const handleReject = async (id: string, reason: string) => {
    await fetch(`/api/admin/payments/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    fetchDashboardData();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 space-y-2 bg-[#11141D] border-blue-500/30">
            <div className="flex items-center justify-between text-blue-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Collected</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
              {(metrics?.totalCollectedAmount || 0).toLocaleString()} <span className="text-xs text-slate-400">ETB</span>
            </p>
            <p className="text-[10px] text-slate-500">Verified admin approvals</p>
          </Card>

          <Card className="p-5 space-y-2 bg-[#11141D] border-amber-500/30">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Approvals</span>
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-amber-400 font-mono tabular-nums">
              {metrics?.pendingPaymentsCount || 0}
            </p>
            <p className="text-[10px] text-slate-500">Awaiting payment review</p>
          </Card>

          <Card className="p-5 space-y-2 bg-[#11141D] border-emerald-500/30">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmed Numbers</span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-white font-mono tabular-nums">
              {metrics?.confirmedSelectionsCount || 0} <span className="text-xs text-slate-500">/ 80</span>
            </p>
            <p className="text-[10px] text-slate-500">Locked numbers in Round #001</p>
          </Card>

          <Card className="p-5 space-y-2 bg-[#11141D] border-indigo-500/30">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Numbers</span>
              <Dices className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-blue-400 font-mono tabular-nums">
              {metrics?.availableNumbersCount || 80}
            </p>
            <p className="text-[10px] text-slate-500">Open for player selection</p>
          </Card>
        </div>

        {/* Pending Verification Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Pending Payment Verification Queue ({pendingPayments.length})
            </h3>
            <Badge variant="pending">Action Required</Badge>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              Loading verification queue...
            </div>
          ) : pendingPayments.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-semibold text-slate-300">All payment submissions reviewed!</p>
              <p>No pending references waiting for admin verification.</p>
            </Card>
          ) : (
            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-[#11141D]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#161B28] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Player</th>
                    <th className="p-3">Numbers</th>
                    <th className="p-3">Amount & Method</th>
                    <th className="p-3">Transaction Ref</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((p) => (
                    <PaymentReviewRow
                      key={p._id || p.id}
                      payment={p}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
