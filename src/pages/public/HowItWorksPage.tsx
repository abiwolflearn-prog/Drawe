import React from 'react';
import { Header } from '../../components/layout/Header.js';
import { Footer } from '../../components/layout/Footer.js';
import { Card } from '../../components/ui/Card.js';
import { CheckCircle2, CreditCard, ShieldCheck, Trophy, AlertTriangle } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl w-full p-4 sm:p-6 space-y-8">
        <div className="text-center space-y-2 pt-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Platform Protocol
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How the 01–80 Number Draw Works
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            A transparent, direct-payment platform where players choose available numbers and verify transactions directly with platform operators.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 space-y-3 bg-[#11141D] border-blue-500/20">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-base">
              01
            </div>
            <h3 className="text-base font-bold text-white">Select Available Numbers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore the live 01–80 interactive board. Select any unreserved numbers. Your total amount is calculated live at 50 ETB per number.
            </p>
          </Card>

          <Card className="p-5 space-y-3 bg-[#11141D] border-blue-500/20">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-base">
              02
            </div>
            <h3 className="text-base font-bold text-white">Pay Operator Directly</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transfer funds directly to the operator account (Telebirr or CBE Bank). There are NO internal wallet deposits or casino balances.
            </p>
          </Card>

          <Card className="p-5 space-y-3 bg-[#11141D] border-blue-500/20">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-base">
              03
            </div>
            <h3 className="text-base font-bold text-white">Submit Payment Reference</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your transaction reference ID from your Telebirr or Bank SMS receipt. Your numbers are held in Payment Pending status.
            </p>
          </Card>

          <Card className="p-5 space-y-3 bg-[#11141D] border-blue-500/20">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-base">
              04
            </div>
            <h3 className="text-base font-bold text-white">Admin Approval & Draw Execution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Platform admins review the reference and confirm your numbers. When the round closes, an auditable random draw determines the winning number.
            </p>
          </Card>
        </div>

        {/* Legal Notice Box */}
        <Card className="p-6 bg-[#161310] border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Ethiopian Regulatory & Legal Compliance</span>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            The paid random-draw model may be regulated as gambling/lottery/raffle activity depending on local jurisdiction. Platform operators must confirm all applicable Ethiopian legal, licensing, payment, tax, age, advertising, and consumer protection rules before conducting real-money draws.
          </p>
        </Card>
      </main>

      <Footer />
    </div>
  );
};
