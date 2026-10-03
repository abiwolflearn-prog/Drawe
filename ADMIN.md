# ADMIN & OPERATOR CONTROLS

## Admin Responsibilities
Draw capacity and draw pricing are controlled exclusively by the **ADMIN/OPERATOR**, not SUPER_ADMIN.

### Admin Powers
- Create Draws with configurable capacity (`1` to `1000` entries).
- Set ticket price per number (`pricePerNumber` in ETB).
- Configure winner positions and prizes (`1st Winner`, `2nd Winner`, `3rd Winner`...).
- Review and verify player payment references.
- Lock draw selections (`CLOSED`).
- Execute cryptographic draw selections (`HMAC-SHA256`).

### Super Admin Powers
- SaaS tenant provisioning and activation.
- Platform security and global audit logs.
- SUPER_ADMIN MUST NOT configure or overwrite an operator's draw capacity or ticket price.
