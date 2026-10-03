import React from 'react';
import { useTelegram } from '../../context/TelegramContext.js';
import { Send, Bot, CheckCircle, ExternalLink } from 'lucide-react';

export const TelegramMiniAppBanner: React.FC = () => {
  const { isTelegramWebApp, telegramUser } = useTelegram();

  if (isTelegramWebApp) {
    return (
      <div className="w-full bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-slate-900/60 border-b border-blue-500/30 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-sky-400 animate-pulse" />
          <span className="text-slate-200 font-semibold">
            {telegramUser ? (
              <>
                Telegram User: <span className="text-sky-300 font-bold">{telegramUser.first_name}</span>
                {telegramUser.username && <span className="text-slate-400 font-mono ml-1">(@{telegramUser.username})</span>}
              </>
            ) : (
              'Telegram Mini App Active'
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
          <CheckCircle className="w-3 h-3" />
          <span>Synced</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111622] border-b border-white/10 px-4 py-2 text-xs flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bot className="w-4 h-4 text-blue-400" />
        <span className="text-slate-300">
          የቴሌግራም ቦት ይፈልጋሉ? <span className="text-blue-300 font-semibold">@EthioDraw0180Bot</span> በቴሌግራም ተጠቀም
        </span>
      </div>

      <a
        href="https://t.me/EthioDraw0180Bot"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold text-[11px]"
      >
        <span>t.me/EthioDraw0180Bot</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};
