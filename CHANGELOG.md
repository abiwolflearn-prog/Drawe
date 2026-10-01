# CHANGELOG

## 2026-10-01
### Added
- Full Amharic-First Multilingual Internationalization (i18n):
  - Amharic (`am`) as the default language for all public and authenticated surfaces.
  - English (`en`) as the secondary supported language.
  - Structured translation dictionaries (`src/i18n/locales/am.ts` and `src/i18n/locales/en.ts`).
  - `I18nProvider` and `useI18n()` hook with key parameter interpolation (`t('key')`).
  - `LanguageSelector` component (`🌐 አማርኛ / English`) in header with `localStorage` preference persistence.
  - Integrated `Noto Sans Ethiopic` Google Font for high-fidelity Ge'ez/Amharic typography rendering.
  - Reusable currency formatter (`150 ብር` / `150 ETB`) and locale-aware date formatter (`am-ET` / `en-US`).
  - Updated Mongoose `UserSchema` and `IUser` interface with `language` preference field.
- Complete Phase 1 Implementation:
  - Express server with Vite middleware integration in `server.ts`.
  - Mongoose models: `User`, `Draw`, `DrawNumber`, `Selection`, `Payment`, `Winner`, `AuditLog`.
  - Auth routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`) with JWT tokens and role authorization.
  - Draws & Numbers API endpoints (`/api/draws`, `/api/draws/:id/numbers`).
  - Direct Payment API (`/api/payments`, `/api/payments/my`).
  - Admin endpoints (`/api/admin/dashboard`, `/api/admin/payments/approve`, `/api/admin/payments/reject`, `/api/admin/audit-logs`).
  - Tactile dark precision UI design system (`#090B0E` canvas, `#11141D` surfaces, `#2563EB` blue accent, `#E11D48` rose selection glow).
  - Programmatically generated 01–80 `NumberBoardGrid` and `NumberCell` supporting all required states.
  - Sticky selection summary bar with real-time ETB price calculation.
  - Direct operator payment instructions card (Telebirr, CBE Bank, BOA) with copyable account numbers.
  - Transaction reference submission drawer & payment status cards.
  - Player Dashboard & Submitted Payments Tracker.
  - Admin Dashboard & Payment Verification Queue table with Approve/Reject actions.
  - Immutable Audit Logs viewer.
  - How It Works page & Results Archive page.

### Status
Phase 1 & Amharic i18n Integration Complete & Verified.
