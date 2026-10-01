import React, { useState } from 'react';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { OperatorAccountCard } from './OperatorAccountCard.js';
import { PaymentMethod } from '../../types/index.js';
import { useDraw } from '../../context/DrawContext.js';
import { useI18n } from '../../i18n/index.js';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export interface PaymentSubmitFormProps {
  onSuccess?: () => void;
}

export const PaymentSubmitForm: React.FC<PaymentSubmitFormProps> = ({ onSuccess }) => {
  const { selectedNumbers, totalAmount, submitPaymentReference } = useDraw();
  const { t, formatCurrency } = useI18n();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('TELEBIRR');
  const [reference, setReference] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference || reference.trim().length < 4) {
      setErrorMsg(t('errors.refRequired'));
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const res = await submitPaymentReference(selectedMethod, reference, screenshotUrl);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || t('errors.networkError'));
    } else {
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Selection Summary Header */}
      <div className="p-4 bg-[#181D2C] border border-rose-500/30 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {t('draw.selectedCount')} ({selectedNumbers.length})
          </span>
          <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-xs font-bold text-rose-300">
          {selectedNumbers.map((n) => (
            <span key={n} className="px-2 py-1 bg-rose-950/80 border border-rose-600/40 rounded-lg">
              {n < 10 ? `0${n}` : `${n}`}
            </span>
          ))}
        </div>
      </div>

      {/* Operator Account Instructions */}
      <OperatorAccountCard selectedMethod={selectedMethod} onSelectMethod={setSelectedMethod} />

      {/* Reference Input */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {t('payment.enterReference')}
        </h4>
        <Input
          label={t('payment.refLabel')}
          placeholder={t('payment.refPlaceholder')}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
          helperText={t('payment.refHelper')}
        />

        <Input
          label={t('payment.screenshotUrl')}
          placeholder="https://... (Optional receipt image link)"
          value={screenshotUrl}
          onChange={(e) => setScreenshotUrl(e.target.value)}
        />
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-rose-950/80 border border-rose-600/40 rounded-xl text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Direct Payment Verification Info */}
      <div className="flex items-start gap-2.5 p-3 bg-blue-950/40 border border-blue-500/20 rounded-xl text-xs text-blue-300 leading-relaxed">
        <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
        <span>
          {t('payment.guaranteeNotice')}
        </span>
      </div>

      <Button type="submit" variant="glow" fullWidth size="lg" disabled={isSubmitting}>
        {isSubmitting ? t('payment.submitting') : t('payment.submitBtn')}
      </Button>
    </form>
  );
};
