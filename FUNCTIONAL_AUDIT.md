# Drawe — Full MERN Stack Functional & Security Audit Report

**Target Platform:** Drawe (አደይ ዕጣ) — Amharic-First Multi-Operator Number-Draw SaaS & Telegram Mini App  
**Repository:** `https://github.com/abiwolflearn-prog/Drawe`  
**Frontend Deployment:** `https://drawe-sigma.vercel.app/`  
**Backend Deployment:** `https://drawe.onrender.com/`  
**Audit Date:** October 11, 2026  
**Auditor:** Senior MERN-Stack Principal Engineer & Application Security Auditor  

---

## 1. Executive Summary & Production-Readiness Verdict

### Production-Readiness Verdict: ⛔ NOT PRODUCTION READY (CRITICAL BLOCKERS)

The Drawe codebase demonstrates thoughtful UI/UX design, thorough Amharic localization, responsive mobile layouts, and a well-structured Telegram Mini App integration suite. However, an in-depth full-stack code inspection and live runtime testing against the MongoDB database and Express API reveal **multiple critical security vulnerabilities, broken core workflows, and architectural discrepancies** that make the system unsafe for production operation in its current state.

### Primary Audit Highlights:
1. **Critical Secret Disclosure & Cryptographic Compromise:**
   - **Hardcoded Database Credentials:** Direct MongoDB Atlas connection URI with plaintext username and password is hardcoded as a fallback in source code (`src/db/connect.ts`), compromising the production database cluster.
   - **Active Provably Fair Seed Leakage:** The public, unauthenticated REST API endpoint `GET /api/draws` exposes `serverSeed` in plaintext while the draw status is `OPEN`. Anyone can pre-calculate winning numbers before entries close and claim winning tickets fraudulently.
2. **Broken Database Writes & Silent In-Memory Degradation:**
   - User registration (`POST /api/auth/register`) fails with HTTP 500 in MongoDB mode because string IDs (`'tenant_addis'`) violate Mongoose `ObjectId` validation (`CastError`).
   - In MongoDB mode, failure to write payments, audit logs, or memberships to the database is silently caught and redirected to in-memory JavaScript arrays, falsely returning HTTP 201 Created to the caller.
   - On server restart, all operator draws, payment records, audit logs, and winners created in memory are completely lost.
3. **Tenant Isolation Failures:**
   - Operator admins can inspect payments from other operators via `GET /api/admin/payments` because filtering by `req.user.tenantId` is omitted.
   - Admin draw operations mutate a single shared global variable (`defaultDraw`), overwriting other operators' draws and clearing their active number board cache.
4. **Socket.IO Security & Scalability Issues:**
   - The real-time WebSocket connection has zero authentication middleware (`io.use(...)`), allowing arbitrary anonymous clients to join rooms, spoof user identities, and alter number board cell states.

---

## 2. End-to-End Workflow Checklist

| # | Workflow Domain | Audit Status | Primary Verification Method | Summary Finding |
|---|---|:---:|:---:|---|
| **1** | **Public Experience** | **FAIL** | Live Runtime & Code Inspection | Pages render cleanly, but `GET /api/draws` leaks unhashed `serverSeed` for `OPEN` draws. |
| **2** | **Authentication** | **FAIL** | Live Runtime & Code Inspection | User registration throws 500 CastError; hardcoded fallback JWT secret; demo password shortcut in memory store. |
| **3** | **Player Workflow** | **FAIL** | Live Runtime & Automated Tests | Selection and local total recalculation work, but payments fail to persist in MongoDB due to CastErrors and silently fall back to memory. |
| **4** | **Operator Workflow** | **FAIL** | Code Inspection & Live Testing | Draw creation mutates a global singleton; does not persist to MongoDB; cross-tenant payments leakage; capacity >80 blocked by Mongoose schema. |
| **5** | **Super Admin Workflow** | **FAIL** | Code Inspection & Live Testing | Operates strictly on in-memory arrays; operators created via UI do not create actual credentials in `UserModel`. |
| **6** | **MongoDB Persistence** | **FAIL** | Live Runtime (`npx tsx`) | Only `users` collection exists in MongoDB Atlas; draws, payments, and audit logs are never saved; silent failure on db errors. |
| **7** | **Payment Integrity** | **FAIL** | Code Inspection & Runtime Testing | Server recalculates totals, but Mongoose lacks unique indexes on `transactionReference`; atomic locks are not used for concurrent reservations. |
| **8** | **Draw Integrity** | **CRITICAL FAIL** | Live Runtime (`curl`) | Seed commitment is defeated by leaking `serverSeed` on open draws; draws cannot exceed 80 in MongoDB due to schema bounds. |
| **9** | **Real-Time Functionality** | **FAIL** | Code Inspection | Socket.IO lacks JWT handshake verification; client-provided user payloads are trusted without session validation; CORS allows all origins. |
| **10** | **Telegram Integration** | **PASS** | Automated Unit Tests & Inspection | HMAC-SHA256 signature verification, freshness TTL check, update deduplication, and Amharic bot commands operate as designed. |
| **11** | **Deployment & Build** | **PASS** | Build Verification (`npm run build`, `npm test`) | Vite client build succeeds; TypeScript type-check passes with 0 errors; 64/64 unit tests pass in mock mode. |

---

## 3. Detailed Findings by Severity

### Finding 1: [CRITICAL] Cryptographic Provably Fair Compromise (Server Seed Exposed During Active Draws)
- **Files Responsible:** `src/server/routes/draws.ts` (lines 23–32, 68–75), `src/server/store.ts` (lines 8–35)
- **Severity:** Critical
- **Verification Method:** Live runtime test via `curl`
- **Description:**
  The provably fair draw system is designed to commit to a secret seed via SHA-256 (`serverSeedHash`) and only reveal the secret `serverSeed` after the round status transitions to `COMPLETED`. However, `GET /api/draws` and `GET /api/draws/:id` return the raw draw object (`defaultDraw` or active draw) without filtering out `serverSeed`.
- **Reproduction Steps:**
  ```bash
  curl -s http://localhost:3000/api/draws
  ```
- **Actual Output:**
  ```json
  {
    "draws": [{
      "_id": "draw_round_001",
      "status": "OPEN",
      "serverSeedHash": "5819c02e916b1c1ea3890b131429ab74137979190c3ee24d087f6785b60f0a91",
      "serverSeed": "1ea7fb53405cbca52258847a7d7a34634d8a1a17202c6fc35bf75cf7ebf3a7a6"
    }]
  }
  ```
- **Impact:** Any player can inspect the API response, calculate `calculateWinningNumber(serverSeed, drawId, capacity)` in advance, and purchase the exact winning ticket.
- **Why Automated Tests Missed It:** The unit test `telegramIntegration.ts` tested `drawService.getPublicDrawDetails(draw)` directly rather than the actual Express route handler `router.get('/', ...)` in `draws.ts`.

---

### Finding 2: [CRITICAL] Hardcoded MongoDB Atlas Credentials in Source Code
- **Files Responsible:** `src/db/connect.ts` (line 6)
- **Severity:** Critical
- **Verification Method:** Code inspection
- **Description:**
  A plaintext MongoDB Atlas connection string containing username and password credentials is hardcoded as a fallback URI:
  ```ts
  const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb+srv://abiwolflearn_db_user:[REDACTED_PASSWORD]@cluster0.3kp5b57.mongodb.net/adey_draw_db?retryWrites=true&w=majority';
  ```
- **Impact:** Any user or bot with read access to the repository has administrative read/write access to the MongoDB Atlas database cluster.
- **Remediation Note:** In accordance with audit constraints, the secret is not printed in full. The credentials on MongoDB Atlas must be immediately rotated and revoked, and all hardcoded strings removed from source control.

---

### Finding 3: [HIGH] Broken User Registration in MongoDB (Schema Validation CastError)
- **Files Responsible:** `src/server/routes/auth.ts` (lines 116–124), `src/models/User.ts` (line 11)
- **Severity:** High
- **Verification Method:** Live runtime test via `curl` and `npx tsx`
- **Description:**
  `src/models/User.ts` defines `tenantId` as `{ type: Schema.Types.ObjectId, ref: 'Tenant' }`. However, when a user registers through `POST /api/auth/register`, the code sets `tenantId: 'tenant_addis'`. Because `'tenant_addis'` is not a 24-character hexadecimal `ObjectId`, Mongoose throws a `CastError`, terminating registration with HTTP 500.
- **Reproduction Steps:**
  ```bash
  curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"test@example.com","password":"Password123!"}'
  ```
- **Actual Output:**
  ```json
  {"error":"Failed to register account"}
  ```
- **Server Trace:**
  `User validation failed: tenantId: Cast to ObjectId failed for value "tenant_addis" (type string) at path "tenantId"`

---

### Finding 4: [HIGH] Critical Writes Silently Fall Back to Volatile Memory
- **Files Responsible:** `src/server/services/paymentService.ts` (lines 160–166, 188–194, 389–398, 428–434, 486–495, 524–530), `src/server/services/playerService.ts` (lines 208–211)
- **Severity:** High
- **Verification Method:** Code inspection & MongoDB collection count inspection
- **Description:**
  When MongoDB is connected, methods in `PaymentService` attempt database writes inside empty or logging `try/catch` blocks. When `PaymentModel.create()` fails (due to `'tenant_addis'` or string ID casting errors), the code catches the error and silently pushes the record to `memoryPayments`. It then returns HTTP 201 Created to the client.
- **Live Database Inspection:**
  Running `db.listCollections()` on the connected MongoDB Atlas instance revealed:
  ```text
  Existing Collections: ['users'] (9 documents)
  Missing Collections: payments (0), draws (0), drawnumbers (0), auditlogs (0), playermemberships (0), winners (0)
  ```
- **Impact:** The platform gives operators and users the false impression that records are permanently stored in MongoDB, while in reality all payments, audit logs, and draws reside exclusively in RAM. A container reboot wipes all data.

---

### Finding 5: [HIGH] Tenant Isolation Breach in Operator Admin APIs
- **Files Responsible:** `src/server/routes/admin.ts` (lines 277–285, 310–313)
- **Severity:** High
- **Verification Method:** Code inspection
- **Description:**
  In `GET /api/admin/payments`:
  ```ts
  router.get('/payments', requireAdmin, (req: AuthRequest, res: Response) => {
    const { status } = req.query;
    let filtered = memoryPayments;
    if (status) {
      filtered = memoryPayments.filter(p => p.status === (status as string).toUpperCase());
    }
    return res.json({ payments: filtered });
  });
  ```
  The endpoint requires the `ADMIN` role, but **never checks `req.user.tenantId`**. An admin belonging to `tenant_hawassa` receives all payment records from `tenant_addis` and `tenant_dire`, exposing player names, phone numbers, transaction reference numbers, and amounts across operators.
  The same flaw exists in `GET /api/admin/audit-logs`.

---

### Finding 6: [HIGH] Global Singleton Draw Mutation (Cross-Tenant Overwrites)
- **Files Responsible:** `src/server/routes/admin.ts` (lines 70–99, 131–134, 150–154, 171–177)
- **Severity:** High
- **Verification Method:** Code inspection
- **Description:**
  When an admin creates, opens, closes, or executes a draw via `POST /api/admin/draws`, the endpoint mutates the single module-level object `defaultDraw` and calls `defaultNumbersMap.clear()`.
  If Operator A creates a draw for Addis, and Operator B creates a draw for Hawassa, Operator B's action overwrites Operator A's active draw and wipes out the Addis numbers board for all connected players.

---

### Finding 7: [MEDIUM] Unauthenticated Socket.IO with User Identity Spoofing
- **Files Responsible:** `src/server/socket.ts` (lines 11–17, 19–76)
- **Severity:** Medium
- **Verification Method:** Code inspection
- **Description:**
  1. `initializeSocketIO()` sets `cors: { origin: '*' }` with no `io.use()` authentication middleware. Anyone on the internet can establish a WebSocket connection.
  2. The `select_number` event accepts the payload `{ drawId, number, user: { id, name } }` directly from the client without checking JWT authentication. A malicious user can send `user: { id: "usr_admin", name: "Administrator" }` and spoof any identity on the live board.
  3. The handler hardcodes `defaultNumbersMap.get(number)`, ignoring the supplied `drawId`.

---

### Finding 8: [MEDIUM] Hardcoded Fallback JWT Secret & Demo Credentials
- **Files Responsible:** `src/server/middleware/auth.ts` (line 4), `src/server/routes/auth.ts` (lines 168–170)
- **Severity:** Medium
- **Verification Method:** Code inspection
- **Description:**
  1. If `process.env.JWT_SECRET` is unset, `auth.ts` falls back to `'super-secret-number-draw-key-2026'`. Any attacker knowing this fallback string can forge valid JWT tokens with `SUPER_ADMIN` or `ADMIN` roles.
  2. In `POST /api/auth/login`:
     ```ts
     const valid = password === 'password123' || await bcrypt.compare(password, user.passwordHash);
     ```
     In fallback store mode, any user account can be logged into using the hardcoded string `'password123'`.

---

### Finding 9: [MEDIUM] Mongoose Schema Capacity Limit (80) Conflicts with 1000 Capacity Requirement
- **Files Responsible:** `src/models/DrawNumber.ts` (line 10), `src/models/Draw.ts` (lines 16–17)
- **Severity:** Medium
- **Verification Method:** Code inspection
- **Description:**
  In `src/models/DrawNumber.ts`:
  ```ts
  number: { type: Number, required: true, min: 1, max: 80 },
  ```
  And in `src/models/Draw.ts`:
  ```ts
  numberTo: { type: Number, default: 80 },
  ```
  The business requirements specify dynamic capacities between 1 and 1000. If an operator sets capacity to 250, 500, or 1000, creating numbers higher than 80 will fail Mongoose validation with `ValidatorError: Path 'number' (81) is more than maximum allowed value (80)`.

---

### Finding 10: [MEDIUM] Missing Database Unique Index on `transactionReference`
- **Files Responsible:** `src/models/Payment.ts` (line 22)
- **Severity:** Medium
- **Verification Method:** Code inspection
- **Description:**
  `PaymentSchema` defines `transactionReference: { type: String, required: true, trim: true }`, but omits `{ unique: true }` and lacks a compound index on `{ tenantId: 1, transactionReference: 1 }`. Duplicate checks are performed solely via non-atomic `findOne()` queries, which are vulnerable to race conditions under concurrent requests.

---

## 4. Test Suite Execution & Output Evidence

### 1. Backend Automated Test Suite
- **Command:** `npm test` (`tsx src/server/tests/runAllTests.ts`)
- **Status:** Exit code `0`
- **Results:** 64 total tests, 64 passed, 0 failed.
- **Detailed Suite Breakdown:**
  1. Draw Engine & Formatting Unit Tests: 7/7 PASSED
  2. Telegram Integration & Business Rules Tests: 11/11 PASSED
  3. Telegram Mini App Capacity & Viewport Tests: 13/13 PASSED
  4. Admin Notification & Tenant Isolation Tests: 7/7 PASSED
  5. Telegram Bot Commands & Deduplication Tests: 16/16 PASSED
  6. Telegram Mini App Bottom Navigation Bar Tests: 7/7 PASSED

#### Auditor Analysis of Test Suite:
While the test suite succeeds with 64/64 passing tests, the tests operate primarily against **isolated helper functions and in-memory mock fixtures** rather than live database-backed Express routes. For example:
- The `Active draw` test verified `drawService.getPublicDrawDetails(draw)`, but missed that the actual Express router `GET /api/draws` bypasses this helper and outputs the raw object containing `serverSeed`.
- The `Tenant isolation` test verified `PaymentService.approvePayment()`, but missed that `GET /api/admin/payments` has no tenant filter.

### 2. Frontend Production Build Check
- **Command:** `npm run build` (`vite build`)
- **Status:** Exit code `0`
- **Output:**
  ```text
  vite v8.3.1 building client environment for production...
  transforming...
  ✓ 1750 modules transformed.
  rendering chunks...
  dist/index.html                   1.39 kB │ gzip:   0.68 kB
  dist/assets/index-w9pZtanP.css   80.02 kB │ gzip:  12.18 kB
  dist/assets/index-C7NLfqBF.js   823.84 kB │ gzip: 222.90 kB
  ✓ built in 1.25s
  ```

### 3. Static Type Analysis Check
- **Command:** `npm run lint` (`tsc --noEmit`)
- **Status:** Exit code `0` (Zero compiler errors across all TypeScript files)

---

## 5. Live Runtime API Endpoint Verification

| Route | Method | Auth Required | Runtime HTTP Code | Response Data Summary | Audit Finding |
|---|---|:---:|:---:|---|---|
| `/api/health` | GET | None | 200 OK | `{ status: "ok", service: "Adey Draw Platform API..." }` | Operational |
| `/api/draws` | GET | None | 200 OK | Returns array with `defaultDraw` | **FAIL: Leaks `serverSeed` in plaintext** |
| `/api/draws/:id` | GET | None | 200 OK | Returns single draw object | **FAIL: Leaks `serverSeed` in plaintext** |
| `/api/draws/:id/numbers` | GET | None | 200 OK | Returns 100 number cells | Operational |
| `/api/draws/results/history` | GET | None | 200 OK | Returns masked winners history | Operational (Phone properly masked) |
| `/api/auth/register` | POST | None | 500 Error | `{ error: "Failed to register account" }` | **FAIL: CastError on tenantId** |
| `/api/auth/login` | POST | None | 401 Error | `{ error: "Invalid email or password" }` | Fails because seed accounts only exist in memory |
| `/api/super-admin/public/operators` | GET | None | 200 OK | Returns 3 active operator profiles | Operational |
| `/api/telegram/config` | GET | None | 200 OK | Returns bot config & Mini App URL | Operational |

---

## 6. Prioritized Remediation Plan

### Phase P0: Immediate Security & Privacy Blockers
1. **Revoke and Rotate MongoDB Atlas Database Credentials:**
   - Immediately delete or rotate the compromised `abiwolflearn_db_user` user in MongoDB Atlas.
   - Remove the hardcoded connection string from `src/db/connect.ts` line 6. Require `process.env.MONGODB_URI` and throw an immediate startup error if missing in production.
2. **Sanitize Public Draws API Responses:**
   - In `src/server/routes/draws.ts` (lines 31 and 74), pass all draw objects through `drawService.getPublicDrawDetails(draw)` before returning JSON. Ensure `serverSeed` is only included if `status === 'COMPLETED'`.
3. **Enforce JWT Secret in Production:**
   - In `src/server/middleware/auth.ts`, throw a fatal startup error if `process.env.JWT_SECRET` is not set or equals default fallback strings. Remove the `password === 'password123'` backdoor.

### Phase P1: Database Schema & Multi-Tenant Persistence
1. **Standardize Tenant Identifiers in Mongoose Schemas:**
   - Change `tenantId` in `UserSchema`, `DrawSchema`, `PaymentSchema`, `PlayerMembershipSchema`, and `DrawNumberSchema` to `Schema.Types.Mixed` or `String` if string slugs like `'tenant_addis'` are used, or seed real 24-character ObjectIds for all tenants.
2. **Eliminate Silent In-Memory Fallbacks on Write Failures:**
   - In `paymentService.ts` and `drawService.ts`, remove empty `catch` blocks. If MongoDB write operations fail, rethrow and return HTTP 500/503 so transactions never succeed into volatile RAM silently.
3. **Fix Cross-Tenant Operator Leaks:**
   - In `src/server/routes/admin.ts`, add tenant filters: `memoryPayments.filter(p => p.tenantId === req.user.tenantId)`. In MongoDB mode, query `{ tenantId: req.user.tenantId }`.
   - Replace the `defaultDraw` global variable with a tenant-keyed Map (`Map<string, IDraw>`) or direct MongoDB collection queries.

### Phase P2: Socket.IO Authentication & Concurrency
1. **Implement Socket.IO Authentication Middleware:**
   - Add `io.use((socket, next) => { ... })` in `src/server/socket.ts` to verify JWT tokens from `socket.handshake.auth.token`.
   - Bind selections to the authenticated user ID rather than trusting client-provided user payloads.
2. **Update Draw Capacity Bounds:**
   - In `src/models/DrawNumber.ts`, update `max: 80` to `max: 1000`.
3. **Add Database Unique Indexes for Payment References:**
   - In `src/models/Payment.ts`, add `PaymentSchema.index({ tenantId: 1, transactionReference: 1 }, { unique: true })`.

---
*Report generated strictly following non-destructive inspection guidelines.*
