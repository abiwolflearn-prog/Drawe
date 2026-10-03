# API SPECIFICATION

## Admin Draw Endpoints
- `POST /api/admin/draws` — Create new draw (Admin only).
  - Body: `{ name, description, capacity, pricePerNumber, currency, prizes: [{ position, label, amount }] }`
  - Validation: `1 <= capacity <= 1000`, `pricePerNumber > 0`.
- `POST /api/admin/draws/:id/open` — Open draw for selections.
- `POST /api/admin/draws/:id/close` — Lock draw for selections (makes draw configuration read-only).
- `POST /api/admin/draws/:id/execute` — Execute cryptographic draw selection for all configured winner positions.

## Payment Endpoints
- `POST /api/payments` — Submit payment reference.
  - Recalculates total server-side: `amount = numbers.length * draw.pricePerNumber`.
  - Captures `unitPrice` snapshot.

## Public & Verification Endpoints
- `GET /api/draws` — Returns active draw.
- `GET /api/draws/:id/numbers` — Returns numbers map for capacity `1..capacity`.
- `GET /api/draws/:id/verify` — Public SHA-256 seed verification.
