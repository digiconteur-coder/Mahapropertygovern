# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

---

## Bharat Property Card System (BPCS)

Mobile app artifact at `artifacts/bharat-property`. Expo/React Native web. Pitching to Indian government minister.

### Design
- Navy `#1e3a8a` + Saffron `#f97316` — govt aesthetic
- Feather icons only
- RERAW Act 2026 branding

### Auth Demo
- OTP: `123456`
- 5 roles: Citizen (USR001), CPF Broker (USR002), Developer (USR003), Govt Officer (USR004), Bank (USR005)

### Key Features Implemented
1. **Login Page** — No personal name before auth. DPI stack graphic (Aadhaar→UPI→DigiLocker→BPC), "Who Uses BPCS?" role cards, key stats, animated marquee, RERAW Act 2026 badge
2. **Properties Tab** — Role-aware UX: primary tab shows actual properties (My Properties / Approval Queue / Loan Applications per role); secondary "Deals & Services" tab has CPF Brokers / Lawyers / Banks sub-tabs. No duplicated deal options.
3. **Dashboard** — 5-role dashboards (citizen/cpf/developer/govt/bank), Indian profile photos, notification bell
4. **Govt Scheme Banner** — Swipeable, 180px tall cards with real Indian property images (PMAY 2.0, Digital Property Mission, Stamp Duty, RERA Drive), auto-rotates every 4 seconds
5. **Property Detail** — 5 real Indian property images per type, swipeable gallery, real scannable QR code, structured BUID breakdown, public verification URL
6. **Notifications & Advisor** — Live Advisor card (3 Indian-faced advisors), Live Transfer Tracker (6-stage timeline)
7. **Deal Tracker** — renamed Transactions tab, meaningful client status per stage, mini QR on every TransactionCard
8. **Transfer Page** — 5-step wizard, 6 CPF brokers (1 assigned + 5 nearby), KYC buyer details, document upload
9. **FloatingSupportBtn** — WhatsApp/Call/SMS/Email FAB in tab layout
10. **Language Selector** — 5 languages (Hindi/English/Tamil/Telugu/Marathi) via LanguageContext

### Indian Face Photos Used
- USR001 (Citizen): photo-1566753323558-f4e0952af115
- USR002 (CPF Broker): photo-1573497019940-1c28c88b4f3e  
- USR003 (Developer): photo-1603415526960-f7e0328c63b1
- USR004 (Govt Officer): photo-1542178243-bc20204b769f
- USR005 (Bank Officer): photo-1551836022-d5d88e9218df
- CPF Sunil Mehta: photo-1566753323558-f4e0952af115
- CPF Anjali Desai: photo-1573497019940-1c28c88b4f3e
- CPF Ravi Kulkarni: photo-1603415526960-f7e0328c63b1

### QR Code Strategy
Uses `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1e3a8a&data=<encoded>` for real, scannable QR codes. Property QR encodes: BUID, owner, type, area, value, status, EC, loan, registration date, verification URL.

### BUID Format
`B-PID-[STATE]-[YEAR]-[SERIAL]-[TYPE]` e.g. `B-PID-MH-2026-001-F`
- B-PID = Bharat Property ID (always)
- MH = State code (Maharashtra)
- 2026 = Year of registration
- 001 = Serial number
- F/L/C = Flat / Land / Commercial
