# ARCHITECTURE

## Recommended stack
- Frontend: React + Vite + TypeScript + Tailwind + `src/i18n` (Amharic Default)
- Backend: Node.js + Express + TypeScript
- Database: MongoDB + Mongoose
- Real-time updates: Socket.IO
- Telegram: Telegram Bot API (Amharic default, English fallback)
- Authentication: secure session/JWT approach
- Deployment: frontend + backend + managed MongoDB

## High-level Architecture

Website ─────┐
             ├── API ─── Database
Telegram ────┘     │
                   ├── Draw Engine
                   ├── Payment Records
                   ├── i18n Localization Engine (am-ET / en-US)
                   └── Audit Log

Admin Dashboard ─── API

## Internationalization Architecture
- `src/i18n/locales/am.ts` (Amharic Default Dictionary)
- `src/i18n/locales/en.ts` (English Dictionary)
- `I18nProvider` + `useI18n()` hook
- Persistence: `localStorage.getItem('app_lang')`, fallback `am`
- Synchronized with `User.language` on authentication.
