import React, { useState } from 'react';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Check, X, ExternalLink, CreditCard } from 'lucide-react';
import { IPayment } from '../../types/index.js';

export interface PaymentReviewRowProps {
  payment: IPayment;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export const PaymentReviewRow: React.FC<PaymentReviewRowProps> = ({
  payment,
  onApprove,
  onReject,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApproveClick = async () => {
    if (confirm(`Approve payment reference ${payment.transactionReference} for ${payment.amount} ETB?`)) {
      setIsProcessing(true);
      await onApprove(payment._id || payment.id || '');
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await onReject(payment._id || payment.id || '', rejectReason || 'Reference verification failed');
    setIsProcessing(false);
    setShowRejectModal(false);
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] text-xs font-medium">
      {/* Player Info */}
      <td className="p-3">
        <p className="font-bold text-slate-200">{payment.playerName || 'Player'}</p>
        <p className="text-[10px] text-slate-500">{payment.playerPhone || 'No phone'}</p>
      </td>

      {/* Selected Numbers */}
      <td className="p-3 font-mono font-bold text-rose-300">
        <div className="flex flex-wrap gap-1 max-w-[140px]">
          {payment.numbers.map((n) => (
            <span key={n} className="px-1.5 py-0.5 bg-rose-950/60 border border-rose-500/30 rounded">
              {n < 10 ? `0${n}` : `${n}`}
            </span>
          ))}
        </div>
      </td>

      {/* Amount & Method */}
      <td className="p-3">
        <p className="font-bold text-emerald-400 font-mono tabular-nums">{payment.amount} ETB</p>
        <p className="text-[10px] text-blue-400 flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          {payment.method}
        </p>
      </td>

      {/* Reference ID & Receipt */}
      <td className="p-3">
        <p className="font-mono font-bold text-blue-300 tracking-wider select-all">{payment.transactionReference}</p>
        {payment.screenshotUrl ? (
          <a
            href={payment.screenshotUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
          >
            Receipt <ExternalLink className="w-2.5 h-2.5" />
          </a>
        ) : (
          <span className="text-[10px] text-slate-500">No screenshot</span>
        )}
      </td>

      {/* Status */}
      <td className="p-3">
        {payment.status === 'PENDING' && <Badge variant="pending">Pending</Badge>}
        {payment.status === 'APPROVED' && <Badge variant="winner">Approved</Badge>}
        {payment.status === 'REJECTED' && <Badge variant="selected">Rejected</Badge>}
      </td>

      {/* Actions */}
      <td className="p-3 text-right space-x-2">
        {payment.status === 'PENDING' ? (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApproveClick}
              disabled={isProcessing}
              className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-400/30"
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Approve
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="px-2.5 py-1 text-xs"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Reject
            </Button>
          </>
        ) : (
          <span className="text-[10px] text-slate-500">Resolved</span>
        )}

        {/* Modal for Reject Reason */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-left">
            <div className="bg-[#11141D] border border-white/10 rounded-2xl p-5 max-w-sm w-full space-y-4">
              <h4 className="text-sm font-bold text-white">Reject Payment Reference</h4>
              <p className="text-xs text-slate-400">
                Rejecting this payment will release numbers ({payment.numbers.join(', ')}) back to Available.
              </p>
              <input
                type="text"
                placeholder="Reason (e.g. Invalid reference ID)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#181C28] border border-white/10 rounded-xl text-xs text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleRejectSubmit} disabled={isProcessing}>
                  Confirm Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};
