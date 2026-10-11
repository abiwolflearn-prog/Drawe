import React, { useState, useEffect } from 'react';
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
import { useTelegram } from '../../context/TelegramContext.js';
import { useI18n } from '../../i18n/index.js';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';

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
    error,
    selectionError,
    clearErrors,
    refreshNumbers,
  } = useDraw();

  const { isAuthenticated } = useAuth();
  const { isTelegramWebApp, webApp, triggerHaptic } = useTelegram();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedPayment, setSubmittedPayment] = useState<any>(null);

  const capacity = activeDraw?.capacity || 80;

  // Count available numbers
  let availableCount = 0;
  for (const item of numbersMap.values()) {
    if (item.status === 'AVAILABLE') availableCount++;
  }

  // Handle Telegram MainButton & BackButton lifecycle
  useEffect(() => {
    if (!webApp) return;

    if (selectedNumbers.length > 0 && !isCheckoutOpen && !isSubmittedSuccess) {
      webApp.MainButton.setText(`ቀጥል (${selectedNumbers.length} ቁጥሮች - ${totalAmount} ETB)`);
      webApp.MainButton.show();
      const onMainClick = () => {
        triggerHaptic('medium');
        setIsCheckoutOpen(true);
      };
      webApp.MainButton.onClick(onMainClick);

      return () => {
        webApp.MainButton.offClick(onMainClick);
      };
    } else {
      webApp.MainButton.hide();
    }
  }, [webApp, selectedNumbers.length, totalAmount, isCheckoutOpen, isSubmittedSuccess, triggerHaptic]);

  useEffect(() => {
    if (!webApp) return;

    if (isCheckoutOpen || isSubmittedSuccess) {
      webApp.BackButton.show();
      const onBackClick = () => {
        triggerHaptic('light');
        setIsCheckoutOpen(false);
        setIsSubmittedSuccess(false);
      };
      webApp.BackButton.onClick(onBackClick);

      return () => {
        webApp.BackButton.offClick(onBackClick);
      };
    } else {
      webApp.BackButton.hide();
    }
  }, [webApp, isCheckoutOpen, isSubmittedSuccess, triggerHaptic]);

  const handleContinue = () => {
    triggerHaptic('medium');
    if (!isAuthenticated && !isTelegramWebApp) {
      navigate('/login?redirect=checkout');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = () => {
    triggerHaptic('heavy');
    setIsCheckoutOpen(false);
    setIsSubmittedSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <TelegramMiniAppBanner />
      {!isTelegramWebApp && <Header />}

      <main className="flex-1 mx-auto max-w-5xl w-full p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Persistent Conflict / Selection Error Banner */}
        {selectionError && (
          <div className="p-3 bg-rose-950/90 border border-rose-500/60 rounded-2xl flex items-center justify-between text-xs text-rose-200 animate-shake shadow-lg shadow-rose-950/40">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold">{selectionError}</span>
            </div>
            <button
              type="button"
              onClick={clearErrors}
              className="p-1 text-rose-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Loading or Fetch Error */}
        {error && (
          <div className="p-4 bg-amber-950/60 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs text-amber-200">
            <span>{error}</span>
            <button
              onClick={() => refreshNumbers()}
              className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> እንደገና ሞክር
            </button>
          </div>
        )}

        {/* Round Overview Header */}
        <RoundHeaderCard draw={activeDraw} availableCount={availableCount} />

        {/* Legend */}
        <BoardLegend />

        {/* Dynamic Number Grid (1..1000) */}
        {isLoading ? (
          <div className="h-80 sm:h-96 flex flex-col items-center justify-center gap-2 text-slate-400 text-sm font-mono bg-[#0E111A] rounded-2xl border border-white/5">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <span>የዕጣ ሰሌዳውን በማዘጋጀት ላይ...</span>
          </div>
        ) : (
          <NumberBoardGrid
            capacity={capacity}
            numbersMap={numbersMap}
            selectedNumbers={selectedNumbers}
            onToggleNumber={(num) => {
              triggerHaptic('light');
              toggleNumberSelection(num);
            }}
          />
        )}

        {/* Direct Payment Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 bg-[#11141D] border border-white/5 rounded-2xl text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
            <span>{t('draw.directPaymentGuarantees')}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
            <span>{t('draw.instantLock')}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <span>{t('draw.auditableResults')}</span>
          </div>
        </div>
      </main>

      {/* Sticky Selection Bar (Only shown on web or when MainButton is inactive) */}
      {selectedNumbers.length > 0 && !isTelegramWebApp && (
        <SelectionSummaryBar
          selectedNumbers={selectedNumbers}
          pricePerNumber={pricePerNumber}
          totalAmount={totalAmount}
          onClear={clearSelections}
          onContinue={handleContinue}
        />
      )}

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title={t('payment.title') || 'የክፍያ ማረጋገጫ'}
      >
        <PaymentSubmitForm onSuccess={handlePaymentSuccess} />
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={isSubmittedSuccess}
        onClose={() => setIsSubmittedSuccess(false)}
        title={t('payment.submittedTitle') || 'ክፍያ ተልኳል'}
      >
        <div className="text-center space-y-4 py-3">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
          <h3 className="text-base sm:text-lg font-bold text-white">
            {t('payment.submittedTitle') || 'የክፍያ ማጣቀሻው በተሳካ ሁኔታ ተልኳል!'}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            {t('payment.submittedMessage') ||
              'የመረጧቸው ቁጥሮች ክፍያ በማረጋገጥ ላይ (PAYMENT_PENDING) በሚል ተይዘዋል። አድሚኑ ማጣቀሻውን እንዳረጋገጠ ወደ ተረጋገጠ (CONFIRMED) ይቀየራሉ።'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => {
                setIsSubmittedSuccess(false);
                refreshNumbers();
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/50"
            >
              ወደ ዕጣ ሰሌዳ ተመለስ
            </button>
            {!isTelegramWebApp && (
              <button
                onClick={() => {
                  setIsSubmittedSuccess(false);
                  navigate('/dashboard');
                }}
                className="px-6 py-2.5 bg-[#1A2030] hover:bg-[#222B40] text-slate-200 font-bold text-xs rounded-xl border border-white/10"
              >
                {t('payment.viewMySelections')}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {!isTelegramWebApp && <Footer />}
    </div>
  );
};
