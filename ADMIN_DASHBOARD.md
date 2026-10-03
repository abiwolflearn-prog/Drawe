# ADMIN & SUPER ADMIN ARCHITECTURE

## Role Separation

### 1. SUPER_ADMIN (`/super-admin`)
Platform-wide SaaS owner and administrator.
- Managed Namespace: `/api/super-admin/*`
- Responsibilities:
  - Create, view, edit, activate, suspend, and disable SaaS ADMIN operator accounts
  - Provision tenant workspace slugs (`tenantId`)
  - Monitor global platform metrics (total volume collected, total active operators, total draws)
  - View platform-wide audit logs (`tenantId: null`)
  - Manage platform settings

### 2. ADMIN / OPERATOR (`/admin`)
SaaS customer managing a single isolated operator workspace.
- Managed Namespace: `/api/admin/*`
- Responsibilities:
  - Create and configure 01–80 draw rounds
  - Manage operator payment account details (Telebirr, CBE Bank, BOA)
  - Verify player transaction references (Approve / Reject)
  - Inspect live number board cell states
  - View tenant-specific players, winners, and audit logs
- Isolation Rules:
  - ADMIN cannot access another tenant's data
  - ADMIN cannot access Super Admin endpoints or modify platform configuration
