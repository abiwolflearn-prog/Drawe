# DEVELOPMENT RULES

1. Do not change architecture without documenting the change.
2. Amharic (አማርኛ) is the default language (`am`); English (`en`) is supported as secondary.
3. Do not hard-code user-facing strings in components; use the i18n system (`useI18n`).
4. Do not create fake production analytics.
5. Do not hard-code payment credentials.
6. Never trust frontend payment status.
7. Never trust Telegram callback data.
8. All financial calculations happen server-side.
9. Use integer minor units where appropriate for money calculations.
10. Prevent two players from confirming the same number.
11. Draw results must be reproducible/auditable from stored evidence without allowing an admin to silently alter history.
12. Never expose private admin APIs to players.
13. Keep PLAYER, ADMIN, and SUPER_ADMIN permissions separate.
14. Validate every request.
15. Add tests before marking critical workflows complete.
16. Keep PROJECT_PLAN.md, CURRENT_PROGRESS.md, CHANGELOG.md synchronized.
17. No fake data in production.
18. Do not remove existing functionality unless the task explicitly requires it.
19. Keep mobile UX as a first-class requirement.
20. Payment verification and draw actions require audit logs.
21. Never store card/payment secrets that the platform does not need.
22. Before real-money launch, complete legal/compliance review.
