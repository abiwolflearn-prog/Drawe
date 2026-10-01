import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header.js';
import { Footer } from '../../components/layout/Footer.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { useAuth } from '../../context/AuthContext.js';
import { Ticket, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';
import { IPayment } from '../../types/index.js';

export const PlayerDashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    if (token) fetchMyPayments();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-5xl w-full p-4 sm:p-6 space-y-6">
        {/* Profile Card */}
        <Card className="p-6 bg-[#11141D] border-blue-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Player Account Dashboard
              </span>
              <h1 className="text-2xl font-black text-white">{user?.name}</h1>
              <p className="text-xs text-slate-400">{user?.email} · {user?.phone || 'No phone'}</p>
            </div>
            <Badge variant="available">
              <Ticket className="w-3.5 h-3.5" /> Player Account
            </Badge>
          </div>
        </Card>

        {/* My Payment Submissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" /> My Direct Payment Submissions
            </h3>
            <span className="text-xs text-slate-500">{payments.length} Submissions</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              Loading my payment history...
            </div>
          ) : payments.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-xs space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-400">No payment submissions yet</p>
              <p>Select available numbers on the main 01–80 board to enter live draw rounds.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payments.map((p) => (
                <Card key={p._id || p.id} className="p-5 space-y-3 bg-[#131722] border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      {p.drawTitle || 'Round #001'}
                    </span>
                    {p.status === 'PENDING' && <Badge variant="pending">Pending Verification</Badge>}
                    {p.status === 'APPROVED' && <Badge variant="winner">Confirmed</Badge>}
                    {p.status === 'REJECTED' && <Badge variant="selected">Rejected</Badge>}
                  </div>

                  <div className="flex items-center justify-between py-2 border-y border-white/5 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Selected Numbers</span>
                      <div className="flex flex-wrap gap-1 mt-1 font-mono font-bold text-rose-300">
                        {p.numbers.map((n) => (
                          <span key={n} className="px-1.5 py-0.5 bg-rose-950/80 border border-rose-500/30 rounded">
                            {n < 10 ? `0${n}` : `${n}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Amount Paid</span>
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
      </main>

      <Footer />
    </div>
  );
};
