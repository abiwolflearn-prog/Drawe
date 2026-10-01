import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { Card } from '../../components/ui/Card.js';
import { PaymentReviewRow } from '../../components/admin/PaymentReviewRow.js';
import { useAuth } from '../../context/AuthContext.js';
import { CreditCard, Filter } from 'lucide-react';
import { IPayment } from '../../types/index.js';

export const AdminPaymentsPage: React.FC = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const url = filterStatus === 'ALL' ? '/api/admin/payments' : `/api/admin/payments?status=${filterStatus}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPayments();
  }, [token, filterStatus]);

  const handleApprove = async (id: string) => {
    await fetch(`/api/admin/payments/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPayments();
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
    fetchPayments();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Payment Verification Queue
            </h1>
            <p className="text-xs text-slate-400">
              Review player-submitted transaction references, check bank receipts, and lock/release numbers.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1 p-1 bg-[#11141D] border border-white/10 rounded-xl text-xs font-semibold">
            <span className="px-2 text-slate-500 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            Loading payment records...
          </div>
        ) : payments.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs space-y-2">
            <p className="font-semibold text-slate-300">No payment records found</p>
            <p>Submissions will appear here as players submit transaction references.</p>
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
                {payments.map((p) => (
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
    </AdminLayout>
  );
};
