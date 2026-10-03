import React, { useState } from 'react';
import { Header } from '../../components/layout/Header.js';
import { Footer } from '../../components/layout/Footer.js';
import { TelegramMiniAppBanner } from '../../components/telegram/TelegramMiniAppBanner.js';
import { RoundHeaderCard } from '../../components/draw/RoundHeaderCard.js';
import { NumberBoardGrid } from '../../components/number-board/NumberBoardGrid.js';
import { BoardLegend } from '../../components/number-board/BoardLegend.js';
import { SelectionSummaryBar } from '../../components/number-board/SelectionSummaryBar.js';
import { Modal } from '../../components/ui/Modal.js';
import { PaymentSubmitForm } from '../../components/payment/PaymentSubmitForm.js';
import { useDraw } from '../../context/DrawContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    activeDraw,
    numbersMap,
    selectedNumbers,
    pricePerNumber,
    totalAmount,
    toggleNumberSelection,
    clearSelections,
    isLoading,
  } = useDraw();

  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Count available numbers
  let availableCount = 0;
  for (const item of numbersMap.values()) {
    if (item.status === 'AVAILABLE') availableCount++;
  }

  const handleContinue = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsCheckoutOpen(false);
    setIsSubmittedSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <TelegramMiniAppBanner />
      <Header />

      <main className="flex-1 mx-auto max-w-5xl w-full p-4 sm:p-6 space-y-6">
        {/* Round Overview Header */}
        <RoundHeaderCard draw={activeDraw} availableCount={availableCount} />

        {/* Legend */}
        <BoardLegend />

        {/* 01-80 Interactive Board */}
        {isLoading ? (
          <div className="h-96 flex items-center justify-center text-slate-500 text-sm font-mono animate-pulse">
            {t('common.loading')}
          </div>
        ) : (
          <NumberBoardGrid
            numbersMap={numbersMap}
            selectedNumbers={selectedNumbers}
            onToggleNumber={toggleNumberSelection}
          />
        )}

        {/* Direct Payment Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#11141D] border border-white/5 rounded-2xl text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
            <span>{t('draw.directPaymentGuarantees')}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{t('draw.instantLock')}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{t('draw.auditableResults')}</span>
          </div>
        </div>
      </main>

      {/* Sticky Selection Bar */}
      <SelectionSummaryBar
        selectedNumbers={selectedNumbers}
        pricePerNumber={pricePerNumber}
        totalAmount={totalAmount}
        onClear={clearSelections}
        onContinue={handleContinue}
      />

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title={t('payment.title')}
      >
        <PaymentSubmitForm onSuccess={handlePaymentSuccess} />
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={isSubmittedSuccess}
        onClose={() => setIsSubmittedSuccess(false)}
        title={t('payment.submittedTitle')}
      >
        <div className="text-center space-y-4 py-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-white">{t('payment.submittedTitle')}</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            {t('payment.submittedMessage')}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setIsSubmittedSuccess(false);
                navigate('/dashboard');
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/50"
            >
              {t('payment.viewMySelections')}
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};
