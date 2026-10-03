# FEATURES SPECIFICATION

1. **Dynamic Capacity (1–1000 Entries)**:
   - Formatted zero-padded numbers (`01`..`80`, `001`..`250`, `0001`..`1000`).
2. **Admin-Configurable Pricing**:
   - Ticket price set per draw by operator (e.g. 50 ETB, 100 ETB, 400 ETB).
3. **Dynamic Winner Positions & Prizes**:
   - Configurable winner count (1, 2, 3, 5, 10...).
   - Configured prize amount per winner position.
4. **Authoritative Server Pricing**:
   - Server recalculates total amount (`quantity * unitPrice`).
   - Price snapshot stored on payment selection.
5. **Multi-Tenant Player Membership (`PlayerMembership`)**:
   - Players assigned to tenant communities without permanent single tenant lock.
6. **Amharic-First Multilingual UI**:
   - No casino/betting terminology. Pure draw, selection, payment, and result terms.
