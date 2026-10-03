import React, { createContext, useContext, useEffect, useState } from 'react';
import { TelegramUser, TelegramWebApp } from '../types/telegram.js';

interface TelegramContextType {
  isTelegramWebApp: boolean;
  telegramUser: TelegramUser | null;
  webApp: TelegramWebApp | null;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
}

const TelegramContext = createContext<TelegramContextType>({
  isTelegramWebApp: false,
  telegramUser: null,
  webApp: null,
  triggerHaptic: () => {},
  showMainButton: () => {},
  hideMainButton: () => {},
});

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);

      // Check if WebApp initData exists or platform is active
      if (tg.initData || tg.platform !== 'unknown') {
        setIsTelegramWebApp(true);
        tg.ready();
        tg.expand();

        if (tg.initDataUnsafe?.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        }
      }
    }
  }, []);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(style);
    }
  };

  const showMainButton = (text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
      webApp.MainButton.show();
      webApp.MainButton.onClick(onClick);
    }
  };

  const hideMainButton = () => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  };

  return (
    <TelegramContext.Provider
      value={{
        isTelegramWebApp,
        telegramUser,
        webApp,
        triggerHaptic,
        showMainButton,
        hideMainButton,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);
