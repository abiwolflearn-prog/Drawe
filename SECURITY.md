# SECURITY & AUDIT ARCHITECTURE

1. **Provably Fair SHA-256 Commitments**:
   - Public seed hash published prior to draw execution.
   - Secret seed revealed after execution for independent player verification.
2. **Tenant Isolation**:
   - Admins can only query and mutate their own tenant data.
   - Super Admin cannot modify historical operator transaction amounts or ticket prices.
3. **Audit Trails**:
   - All state transitions (`CREATE_DRAW`, `OPEN_DRAW`, `CLOSE_DRAW`, `APPROVE_PAYMENT`, `DRAW_EXECUTED`) logged in immutable audit records.
