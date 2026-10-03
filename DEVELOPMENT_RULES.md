# DEVELOPMENT RULES

1. **Draw Capacity & Pricing**:
   - Draw capacity and draw pricing are controlled by the ADMIN/OPERATOR, not SUPER_ADMIN.
   - Maximum capacity is 1000. Minimum capacity is 1.
2. **Server-Side Authoritative Pricing**:
   - Never trust frontend `totalAmount`.
   - Store unit price snapshot on payment creation.
3. **No Casino/Gambling Terminology**:
   - Avoid words: Bet, Casino, Stake, Multiplier, Wallet.
   - Use: Draw (ዕጣ), Number (ቁጥር), Payment (ክፍያ), Winner (አሸናፊ).
4. **Immutable State**:
   - Once a draw enters `CLOSED` or `COMPLETED` state, capacity, pricing, and prizes become strictly read-only.
