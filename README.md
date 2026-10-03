# 01–80 Multi-Tenant SaaS Number Draw Platform

A full-stack, Amharic-first multi-tenant SaaS web and Telegram platform based on an 80-number draw board with Operator Discovery Directory.

## Role Hierarchy & SaaS Architecture
```
SUPER_ADMIN (Platform SaaS Control Center)
    │
    ├── ADMIN / OPERATOR (Addis Number Community) ──► Draws, Players, Payments
    ├── ADMIN / OPERATOR (Hawassa Lake Draw) ──► Draws, Players, Payments
    └── ADMIN / OPERATOR (Dire Dawa Express) ──► Draws, Players, Payments
```

- **SUPER_ADMIN:** Platform owner controlling all SaaS operators/tenants, creating/activating/suspending ADMIN accounts, viewing platform metrics, and managing the Operator Discovery Directory.
- **ADMIN / OPERATOR:** SaaS customer/operator managing their isolated tenant workspace (`tenantId`). ADMIN manages only their own draws, players, payments, winners, and reports.
- **PLAYER:** End user discovering operators via `/operators` and participating in live draw rounds.

## Key Modules
1. **Operator Discovery Directory (`/operators` & `/operators/:slug`):**
   - Allows players to discover verified SaaS Operator communities (`አዘጋጆች`) and join official Telegram channels/groups (`t.me/...`).
   - Category-based filtering: `Featured Communities`, `Verified Operators`, `High Performance` (operational efficiency), `Most Rounds`, `New Operators`.
   - Descriptive non-gambling metrics: Completed rounds, active participants, Telegram members count, operational performance score.
2. **Amharic-First Multilingual i18n:** Amharic (`am`) as default, full English (`en`) secondary.
3. **01–80 Programmatic Number Board:** 7 cell states (`AVAILABLE`, `SELECTED`, `RESERVED`, `PAYMENT_PENDING`, `CONFIRMED`, `WINNER`, `DISABLED`).
4. **Direct Operator Payment Model:** Direct transfers to operator bank/Telebirr accounts with manual admin verification.
