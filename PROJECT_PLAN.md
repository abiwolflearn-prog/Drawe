# PROJECT PLAN

## Phase 0 — Product definition
- [ ] Confirm business rules
- [ ] Confirm number range: 01–80
- [ ] Confirm price per number
- [ ] Confirm round lifecycle
- [ ] Confirm prize calculation
- [ ] Confirm payment methods
- [ ] Confirm cancellation/refund rules
- [ ] Confirm legal/compliance requirements

## Phase 1 — Foundation
- [ ] Monorepo/project structure
- [ ] Backend API
- [ ] Database connection
- [ ] Authentication
- [ ] Role system: PLAYER, ADMIN, SUPER_ADMIN
- [ ] Environment configuration
- [ ] Error handling
- [ ] Logging

## Phase 2 — Draw engine
- [ ] Create round
- [ ] Generate 01–80 numbers
- [ ] Number availability state
- [ ] Reserve/hold workflow
- [ ] Payment-pending state
- [ ] Payment-approved state
- [ ] Release expired/unapproved reservations
- [ ] Close round
- [ ] Execute auditable random draw
- [ ] Store immutable result
- [ ] Winner record

## Phase 3 — Player website
- [ ] Landing page
- [ ] Active draws
- [ ] 01–80 number board
- [ ] Number selection
- [ ] Checkout/payment instructions
- [ ] Payment submission
- [ ] My selections
- [ ] Payment status
- [ ] Draw result/history
- [ ] Profile

## Phase 4 — Admin
- [ ] Dashboard
- [ ] Round management
- [ ] Number board
- [ ] Payment verification
- [ ] Player management
- [ ] Winner management
- [ ] Draw controls
- [ ] Reports
- [ ] Audit log
- [ ] Settings

## Phase 5 — Telegram
- [ ] /start
- [ ] Account linking
- [ ] Active rounds
- [ ] Number selection
- [ ] Selection summary
- [ ] Payment instructions
- [ ] Payment submission
- [ ] Status notifications
- [ ] Draw/result notification
- [ ] Admin notification channel

## Phase 6 — Security and reliability
- [ ] Server-side authorization
- [ ] Rate limiting
- [ ] Input validation
- [ ] Duplicate payment protection
- [ ] Race-condition protection for numbers
- [ ] Audit logging
- [ ] Secure random draw implementation
- [ ] Backup/restore
- [ ] Monitoring

## Phase 7 — Testing
- [ ] Unit tests
- [ ] API tests
- [ ] Draw-engine tests
- [ ] Payment workflow tests
- [ ] Concurrent number-selection tests
- [ ] Telegram tests
- [ ] E2E tests
- [ ] Production smoke test

## Phase 8 — Deployment
- [ ] Production database
- [ ] Backend deployment
- [ ] Website deployment
- [ ] Telegram webhook
- [ ] Domain
- [ ] HTTPS
- [ ] Environment secrets
- [ ] Monitoring
- [ ] Backup schedule
