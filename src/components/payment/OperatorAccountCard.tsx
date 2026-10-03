import React, { useState } from 'react';
import { Card } from '../ui/Card.js';
import { useI18n } from '../../i18n/index.js';
import { Copy, Check, Building2 } from 'lucide-react';
import { PaymentMethod, OperatorAccountInfo } from '../../types/index.js';

export interface OperatorAccountCardProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export const OPERATOR_ACCOUNTS: Record<PaymentMethod, OperatorAccountInfo> = {
  TELEBIRR: {
    method: 'TELEBIRR',
    providerName: 'Telebirr',
    bankName: 'Telebirr',
    accountName: 'የዕጣ ኦፕሬተር አካውንት',
    accountNumber: '0911223344',
    instructions: 'በቴሌብር ስልክ ቁጥር ቀጥታ ክፍያ ይፈጽሙ። የክፍያ ማረጋገጫ ቁጥሩን (Ref ID) አጭር የጽሁፍ መልዕክት ላይ ኮፒ በማድረግ ከታች ያስገቡ።',
  },
  CBE_BANK: {
    method: 'CBE_BANK',
    providerName: 'የኢትዮጵያ ንግድ ባንክ (CBE)',
    bankName: 'የኢትዮጵያ ንግድ ባንክ',
    accountName: 'የዕጣ ፕላትፎርም አካውንት',
    accountNumber: '1000123456789',
    instructions: 'በንግድ ባንክ አካውንት ወይም CBE Birr ክፍያ ይፈጽሙ። የግብይት ማጣቀሻ ቁጥሩን ከደረሰኙ ላይ ያስገቡ።',
  },
  CBE_BIRR: {
    method: 'CBE_BIRR',
    providerName: 'CBE Birr',
    bankName: 'CBE Birr',
    accountName: 'የዕጣ ኦፕሬተር አካውንት',
    accountNumber: '0911223344',
    instructions: 'በCBE Birr ቀጥታ ክፍያ ይፈጽሙ። የግብይት ማጣቀሻ ቁጥሩን ከደረሰኙ ላይ ያስገቡ።',
  },
  BANK_TRANSFER: {
    method: 'BANK_TRANSFER',
    providerName: 'የአቢሲኒያ ባንክ (BOA)',
    bankName: 'የአቢሲኒያ ባንክ',
    accountName: 'የዕጣ ፕላትፎርም አካውንት',
    accountNumber: '887766554433',
    instructions: 'በአቢሲኒያ ሞባይል ባንኪንግ ክፍያ ይፈጽሙ። የግብይት ማጣቀሻ ቁጥሩን ያስገቡ።',
  },
  CHAPA: {
    method: 'CHAPA',
    providerName: 'Chapa Direct',
    bankName: 'Chapa Pay',
    accountName: 'Chapa Operator',
    accountNumber: 'CHAPA-0192',
    instructions: 'በChapa የኦንላይን ክፍያ ይፈጽሙ።',
  },
  CASH: {
    method: 'CASH',
    providerName: 'ቀጥታ ወኪል (Cash)',
    bankName: 'Cash Agent',
    accountName: 'ህጋዊ ወኪል',
    accountNumber: 'AGENT-ADDIS-01',
    instructions: 'ለተፈቀደለት የፕላትፎርም ወኪል በእጅ ክፍያ ይፈጽሙ። የተቀበሉትን ደረሰኝ ቁጥር ያስገቡ።',
  },
};

export const OperatorAccountCard: React.FC<OperatorAccountCardProps> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  const { t } = useI18n();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const currentAcc = OPERATOR_ACCOUNTS[selectedMethod] || OPERATOR_ACCOUNTS.TELEBIRR;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card className="p-5 bg-[#141824] border-blue-500/30 space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {t('payment.selectMethod')}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(['TELEBIRR', 'CBE_BANK', 'BANK_TRANSFER'] as PaymentMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onSelectMethod(m)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center select-none ${
                selectedMethod === m
                  ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'bg-[#1A1F2E] text-slate-300 border-white/5 hover:border-white/20'
              }`}
            >
              {(OPERATOR_ACCOUNTS[m]?.providerName || m).split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Account Details Box */}
      <div className="p-4 bg-[#0E1118] border border-white/10 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">{t('payment.operatorProvider')}</span>
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            {currentAcc.providerName}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">{t('payment.operatorAccountName')}</span>
          <span className="text-xs font-semibold text-slate-200">{currentAcc.accountName}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-[#161B28] rounded-lg border border-blue-500/20">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">{t('payment.operatorAccountNo')}</span>
            <span className="text-sm font-extrabold text-blue-300 font-mono tracking-wider tabular-nums">
              {currentAcc.accountNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(currentAcc.accountNumber, 'acc')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-400/30 rounded-lg transition-colors"
          >
            {copiedField === 'acc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedField === 'acc' ? t('common.copied') : t('common.copy')}
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-white/5">
          💡 {currentAcc.instructions}
        </p>
      </div>
    </Card>
  );
};
