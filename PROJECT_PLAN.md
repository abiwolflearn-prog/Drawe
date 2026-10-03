# PROJECT PLAN — 01–80 Multi-Tenant SaaS Draw Platform

## Core Architectural Principle
> **Draw capacity (1–1000) and draw pricing (ETB) are controlled exclusively by the ADMIN/OPERATOR, not SUPER_ADMIN.**
> SUPER_ADMIN manages the SaaS platform (tenant activation, platform metrics, audit logging) and MUST NOT configure an operator's draw price or capacity.

## Phase Overview
- **Phase 0:** Product Architecture & Technical Specification (Complete)
- **Phase 1:** Multi-Tenant SaaS, Amharic-First i18n, & Operator Discovery Directory (Complete)
- **Phase 2:** Cryptographic Draw Engine & Provably Fair Random Seed Logic (Complete)
- **Phase 3:** Real-Time Socket.IO Synchronization & Collaborative Board State (Complete)
- **Phase 4:** Telegram Bot Integration & Mini App Sync (Amharic Default) (Complete)
- **Phase 5:** Admin-Configurable Capacity (1–1000), Pricing, Multi-Winner Prizes & Security Hardening (Complete)

## Roles & Responsibilities
- **SUPER_ADMIN**: Manages SaaS tenant accounts, platform activation/suspension, global security logs, and platform stats.
- **ADMIN/OPERATOR**: Controls their community, creates draws, configures capacity (1–1000), sets ticket prices (ETB), sets winner positions and prizes, verifies payments, and executes cryptographic draws.
- **PLAYER**: Belongs to tenant communities via `PlayerMembership`, selects available entries, pays operator directly, and verifies SHA-256 draw proofs.
