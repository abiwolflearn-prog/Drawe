# API SPECIFICATION

## Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

## Draws
GET  /api/draws
GET  /api/draws/:id
POST /api/admin/draws
PATCH /api/admin/draws/:id
POST /api/admin/draws/:id/open
POST /api/admin/draws/:id/close
POST /api/admin/draws/:id/draw

## Numbers
GET  /api/draws/:id/numbers
POST /api/draws/:id/selections
DELETE /api/draws/:id/selections/:selectionId

## Payments
POST /api/payments
GET  /api/payments/my
GET  /api/admin/payments?status=pending
POST /api/admin/payments/:id/approve
POST /api/admin/payments/:id/reject

## Results
GET /api/results
GET /api/draws/:id/result

## Admin
GET /api/admin/dashboard
GET /api/admin/audit-logs
GET /api/admin/players

All protected endpoints require authorization. Admin operations must be enforced server-side.
