import React, { createContext, useContext, useEffect, useState } from 'react';
import { TelegramUser, TelegramWebApp } from '../types/telegram.js';

interface TelegramContextType {
  isTelegramWebApp: boolean;
  telegramUser: TelegramUser | null;
  initData: string;
  webApp: TelegramWebApp | null;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
}

const TelegramContext = createContext<TelegramContextType>({
  isTelegramWebApp: false,
  telegramUser: null,
  initData: '',
  webApp: null,
  triggerHaptic: () => {},
  showMainButton: () => {},
  hideMainButton: () => {},
});

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string>('');
  const [isTelegramWebApp, setIsTelegramWebApp] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);

      // Check if WebApp initData exists or platform is active
      if (tg.initData || (tg.platform && tg.platform !== 'unknown')) {
        setIsTelegramWebApp(true);
        setInitData(tg.initData || '');
        tg.ready();
        tg.expand();

        if (tg.initDataUnsafe?.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        }

        // Apply Telegram theme compatibility
        if (tg.themeParams) {
          const root = document.documentElement;
          if (tg.themeParams.bg_color) root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
          if (tg.themeParams.text_color) root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
          if (tg.themeParams.hint_color) root.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color);
          if (tg.themeParams.link_color) root.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color);
          if (tg.themeParams.button_color) root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
          if (tg.themeParams.button_text_color) root.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);
          if (tg.themeParams.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color);
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
        initData,
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
