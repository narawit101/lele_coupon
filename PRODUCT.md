# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary Customers**: Fans booking concert tickets in Thailand seeking queue privileges, ticket reservation discounts, and loyalty benefits. They access the service on mobile devices through the LINE in-app browser (LIFF) after following or engaging with the brand on X (Twitter).
- **Concierge Staff & Admins**: Ticket booking operators and store owners who review submitted social proof, manage loyalty points, validate voucher codes, oversee special campaigns, and configure redemption promotional items via the desktop/mobile admin portal (`/admin`).

## Product Purpose
LELE' Ticket provides a digital loyalty, social review verification, and fast-track queue pass system for the ticket concierge service **#เลอเล่อรับกดบัตร**. It incentivizes post-booking social proof on X with reward points that convert into fast-track queue vouchers and promotional discounts. Success is defined as seamless mobile customer interactions via LINE LIFF, verifiable social proof on X, auditable point ledgers, tamper-resistant voucher redemption, and versatile promotional campaign tools.

## Positioning
Unlike generic loyalty apps or manual spreadsheet trackers, LELE' Ticket directly bridges LINE LIFF user identity with public X (Twitter) social review verification, event campaign codes, and auditable, single-use fast-track booking vouchers specifically tailored for concert ticketing demand.

## Operating Context
- **Mobile First (LINE LIFF)**: Customers operate primarily within the LINE mobile in-app browser environment with touch-first interactions.
- **X (Twitter) Concierge Workflow**: Ticket booking requests and pass code validation happen via direct messages (DM) with `@lele0423_ticket` during high-pressure ticket drop windows.
- **Admin Review Verification**: Staff review screenshots and tweet URLs via `/admin`, approving or rejecting submissions with atomic database ledger entries.

## Capabilities and Constraints
- **Capabilities**:
  - Frictionless LINE LIFF single sign-on with automatic profile synchronization.
  - Digital member card displaying live stamp/point balances.
  - Interactive reward exchange catalog with client-side pagination.
  - Server-paginated queue pass wallet with status filters (`ALL`, `ACTIVE`, `USED`) and direct DM links.
  - Special campaign code redemption modal for instantaneous bonus point credits.
  - Mobile-native photo picker for review evidence submissions.
  - FinTech-grade point activity ledger without visual slop or duplicate approved entries.
  - Administrative portal with forced password rotation, review verification, pass invalidation, special codes management, and manual point adjustments.
  - Clean sub-tab architecture for Admin: Passes (`[ คูปองรางวัล ]` & `[ ประวัติใช้โค้ดพิเศษ ]`) and Promotions (`[ รายการโปรโมชั่น ]` & `[ โค้ดพิเศษ ]`).
  - Flexible admin account provisioning: Option to issue default temporary passwords (with forced rotation) or set custom secure passwords immediately with `PasswordCriteriaChecklist`.
  - Ergonomic search bar (`AdminFilterBar`) across all tables with 300ms debounce, loading indicator, and instant clear button.
- **Constraints**:
  - Strict compliance with `AGENTS.md` and `DESIGN.md`.
  - Zero AI slop: minimal, clean, intentional code.
  - No decorative icons or emojis in buttons, badges, helper alerts, or cards.
  - FinTech point typography (+1 points, -1 points) without candy pill badges.
  - Reversible actions with atomic transactions (`prisma.$transaction()`).
  - Thai Buddhist era timezone formatting via `formatThaiDateTime()`.

## Brand Commitments
- **Name**: LELE' Ticket (#เลอเล่อรับกดบัตร)
- **Tagline**: Made for your next fan moment.
- **Personality**: Warm · Playful · Thoughtful
- **Palette**: Cream (`#F7EBC9`), Cornflower (`#5284B7`), Booking Blue / Ink (`#25384C`), Slate (`#657406`), Cloud (`#FAF8F2`), Paper (`#FFFFFF`), Mist (`#D0DEF7`).

## Evidence on Hand
- Complete working Next.js App Router codebase with Prisma models (`User`, `Admin`, `ReviewSubmission`, `QueuePass`, `Promotion`, `SpecialCode`, `CodeRedemption`, `PointLog`).
- Up-to-date specifications in `README.md`, `CONTEXT.md`, and `DESIGN.md`.

## Product Principles
1. **Zero AI Slop & Restraint**: Avoid generic template clichés, bloated wrappers, and unnecessary decorative icons. Let typography, clean spacing, and brand colors lead.
2. **Ledger Integrity & Traceability**: Every point addition or deduction must be backed by an immutable ledger entry and execute atomically.
3. **Mobile-First Ergonomics**: Design specifically for LINE in-app browsers—fixed headers/footers, touch targets of at least 48px, and zero horizontal overflow.
4. **Frictionless Fan Experience**: Customers should be able to view their balance, redeem discounts, and present voucher codes in under 3 taps.
