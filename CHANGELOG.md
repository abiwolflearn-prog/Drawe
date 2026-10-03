# CHANGELOG

## 2026-10-02
### Added
- **Admin-Controlled Capacity & Pricing Engine**:
  - Replaced hardcoded 80-number restriction with dynamic draw capacity from 1 to 1000 entries.
  - Implemented dynamic zero-padding formatter `formatEntryNumber(num, capacity)`.
  - Added Admin draw creation modal (`CreateDrawModal.tsx`) with configurable capacity, price per number (ETB), dynamic winner count, and prize amounts.
  - Added live financial calculations card showing Expected Revenue, Total Prize Pool, and Remaining Amount.
  - Enforced server-side authoritative price recalculation (`quantity * draw.pricePerNumber`) and price snapshot (`unitPrice`).
  - Restricted SUPER_ADMIN from editing operator draw prices, capacities, or winner prizes.
  - Created `src/server/tests/drawEngine.ts` unit test suite covering capacity bounds, formatting, total recalculation, and multi-winner selections.
- **Telegram Bot & Mini App Integration**:
  - Integrated Telegram WebApp SDK, `@EthioDraw0180Bot` gateway, and `TelegramMiniAppBanner`.
- **Real-Time Socket.IO Synchronization**:
  - Real-time room-based isolation and event broadcasts.

## 2026-10-01
### Added
- Admin / Operator Discovery Directory & Community System (`/operators` & `/operators/:slug`).
- Multi-Tenant SaaS & Super Admin Control Layer (`/super-admin`).
- Full Amharic-First Multilingual Internationalization (`am` default, `en` secondary).

### Status
All Requirements Complete & Verified.
