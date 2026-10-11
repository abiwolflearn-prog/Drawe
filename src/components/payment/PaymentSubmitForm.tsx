import React, { useState } from 'react';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { OperatorAccountCard } from './OperatorAccountCard.js';
import { PaymentMethod, formatEntryNumber } from '../../types/index.js';
import { useDraw } from '../../context/DrawContext.js';
import { useI18n } from '../../i18n/index.js';
import { useTelegram } from '../../context/TelegramContext.js';
import { ShieldCheck, AlertCircle, Hash, Coins, Calculator } from 'lucide-react';

export interface PaymentSubmitFormProps {
  onSuccess?: () => void;
}

export const PaymentSubmitForm: React.FC<PaymentSubmitFormProps> = ({ onSuccess }) => {
  const { activeDraw, selectedNumbers, pricePerNumber, totalAmount, submitPaymentReference } = useDraw();
  const { t, formatCurrency } = useI18n();
  const { triggerHaptic, webApp } = useTelegram();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('TELEBIRR');
  const [reference, setReference] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const capacity = activeDraw?.capacity || 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference || reference.trim().length < 4) {
      setErrorMsg(t('errors.refRequired') || 'እባክዎ ትክክለኛ የግብይት ማጣቀሻ ቁጥር ያስገቡ።');
      triggerHaptic('heavy');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    triggerHaptic('medium');

    const res = await submitPaymentReference(selectedMethod, reference.trim(), screenshotUrl);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || t('errors.networkError'));
      triggerHaptic('heavy');
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('error');
      }
    } else {
      triggerHaptic('light');
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 4-Item Selection & Calculation Summary */}
      <div className="p-3.5 bg-[#141926] border border-blue-500/20 rounded-2xl space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* 1. Quantity */}
          <div className="p-2 bg-[#0E121C] rounded-xl border border-white/5 space-y-0.5">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Hash className="w-3 h-3 text-blue-400" /> የተመረጡ ቁጥሮች
            </span>
            <span className="text-sm font-extrabold text-white font-mono">
              {selectedNumbers.length} ቁጥሮች
            </span>
          </div>

          {/* 2. Price per Number */}
          <div className="p-2 bg-[#0E121C] rounded-xl border border-white/5 space-y-0.5">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" /> የአንዱ ዋጋ
            </span>
            <span className="text-sm font-extrabold text-white font-mono">
              {pricePerNumber} ETB
            </span>
          </div>
        </div>

        {/* 3. Server Calculated Total Amount */}
        <div className="flex items-center justify-between p-2.5 bg-[#161D2E] rounded-xl border border-blue-500/30">
          <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" /> ጠቅላላ ክፍያ (Total Amount)
          </span>
          <span className="text-base font-black text-emerald-400 font-mono tracking-tight tabular-nums">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        {/* 4. Formatted Selected Numbers Chips */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">የተመረጡት ቁጥሮች ዝርዝር:</span>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
            {selectedNumbers.map((n) => (
              <span
                key={n}
                className="px-2 py-0.5 bg-rose-950/80 border border-rose-500/40 text-rose-300 rounded-lg font-mono text-xs font-bold"
              >
                #{formatEntryNumber(n, capacity)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Operator Direct Payment Details */}
      <OperatorAccountCard selectedMethod={selectedMethod} onSelectMethod={setSelectedMethod} />

      {/* Reference Input */}
      <div className="space-y-2.5">
        <Input
          label={t('payment.refLabel') || 'የግብይት ማጣቀሻ ቁጥር (Transaction Ref)'}
          placeholder="ምሳሌ: TXN-984720192"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
          helperText="ክፍያውን በቴሌብር ወይም በባንክ ከፈጸሙ በኋላ የደረሰዎትን የማረጋገጫ ቁጥር ያስገቡ።"
        />

        <Input
          label="የደረሰኝ ምስል ሊንክ (አማራጭ)"
          placeholder="https://... (Optional receipt screenshot link)"
          value={screenshotUrl}
          onChange={(e) => setScreenshotUrl(e.target.value)}
        />
      </div>

      {/* Conflict / Server Error Alert */}
      {errorMsg && (
        <div className="flex items-start gap-2 p-3 bg-rose-950/90 border border-rose-500/50 rounded-xl text-xs text-rose-200 leading-relaxed animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Guarantee Note */}
      <div className="flex items-start gap-2 p-2.5 bg-blue-950/30 border border-blue-500/20 rounded-xl text-[11px] text-blue-300/90 leading-relaxed">
        <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
        <span>
          ክፍያዎች በቀጥታ ለአዘጋጁ ሂሳብ የሚገቡ ናቸው። ምንም ዓይነት የውስጥ ካሲኖ ወይም ቦርሳ ተቀማጭ የለም።
        </span>
      </div>

      <Button
        type="submit"
        variant="glow"
        fullWidth
        size="lg"
        disabled={isSubmitting}
        className="h-12 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/40"
      >
        {isSubmitting ? 'ክፍያው በማረጋገጥ ላይ...' : `ክፍያውን ላክ (${formatCurrency(totalAmount)})`}
      </Button>
    </form>
  );
};
