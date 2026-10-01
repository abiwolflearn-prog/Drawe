# SECURITY

## Authentication
- Hash passwords with a modern password hashing algorithm.
- Secure cookies/tokens.
- Rate-limit login.
- Protect admin routes.

## Number integrity
Number selection must be transactional/atomic enough to prevent double assignment.

## Payment integrity
A player-submitted reference is evidence for review, not automatic proof of payment.

## Draw integrity
- Use a cryptographically secure random source.
- Record draw timestamp.
- Record the exact eligible-number set.
- Record operator/action metadata.
- Prevent result modification after publication without a privileged, audited correction process.

## Abuse protection
- Rate limits
- CAPTCHA where appropriate
- Duplicate-reference detection
- Suspicious activity logs
- Admin action audit trail

## Privacy
Collect only necessary player information and define retention/deletion rules appropriate to the applicable law.
