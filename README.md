# LELE' Ticket — Digital Loyalty & Queue Pass Management System

A high-performance digital membership, reward redemption, and social review verification platform designed for the concert ticket booking concierge service **LELE' Ticket (#เลอเล่อรับกดบัตร)**. Built with Next.js (App Router), React 19, TypeScript, Tailwind CSS, Prisma ORM, and the LINE Front-end Framework (LIFF).

---

## 🌟 Core Features

### 1. Customer LIFF & Web Portal

- **Seamless & Resilient LINE Authentication**: Frictionless onboarding via LINE LIFF. Profile data (display name, avatar) is automatically synchronized. Managed through singleton `initLiff` with automatic URL parameter cleanup (`window.history.replaceState`), eliminating `invalid authorization code` errors on initial redirect.
- **Digital Member Card**: Visual card surface utilizing the Cream and Booking Blue palette. Displays membership information, Member Tier badge (Bronze, Silver, Gold, Platinum, Diamond), copyable Member ID, X (Twitter) handle, current point balance, and profile editing controls.
- **Reward Exchange Catalog**: Interactive modal displaying redemption rewards (e.g., booking discounts, fast-track queue privileges) with 6 items per page client-side pagination, featuring prominent unpill'd bold point cost numbers (`text-base font-extrabold`).
- **Fast Track Pass Wallet**:
  - Unified view with filter tabs: **All**, **Active**, and **Used**.
  - Server-side pagination (5 items per page) powered by `/api/users/passes`.
  - Direct deep-links to the shop's X DM (configured via `siteConfig.ts`) for instant voucher redemption.
  - Clean borderless colored status text without heavy candy pill badges.
- **1-Tap X Store Navigation**: Dedicated circular X action button in the top navigation bar linking directly to the store handle configured in `siteConfig.ts`.
- **Special Code Redemption**: Modal dialog allowing customers to enter promotional event codes (e.g., `SUMMER2026`) for instant point credits.
- **Review Submission Flow**:
  - Submit proof of concert booking reviews posted on X with the `#เลอเล่อรับกดบัตร` hashtag.
  - Mobile-native photo picker with thumbnail preview and change/remove actions.
  - Automatic form state cleanup upon submission or modal dismissal.
- **Clean Activity Ledger**:
  - Real-time audit feed of point increments and redemptions.
  - High-contrast FinTech-style typography for point values (`+1 point`, `-1 point`).
  - Strict deduplication: Approved reviews are unified directly with their point ledger credit.
  - Non-intrusive status badges for pending verification and rejected submissions.

### 2. Admin Management Dashboard (`/admin`)

- **Role-Based Access Control**: Multi-tier admin roles (`DEV`, `OWNER`, `STAFF`) secured with bcrypt-hashed passwords and session JWTs (`x-admin-token`).
- **Unified Branding & Ergonomics**:
  - Unified header layout matching the customer portal (`LELE' Ticket` + `#เลอเล่อรับกดบัตร` with circular avatar logo).
  - Circular favicon and unified browser window title (`LELE' Ticket - #เลอเล่อรับกดบัตร`).
- **Unified Tabular Interface (`AdminDataTable<T>`)**: Consistent data table chassis across 100% of admin tabs (`ReviewsTab`, `PassesTab`, `PromotionsTab`, `MembersTab`) with typed `ColumnDef`, sorting chevrons, pulse skeleton loaders, and integrated pagination.
- **Centralized Admin Client (`adminFetch`)**: Reusable API helper in `src/lib/adminApi.ts` automatically injecting session headers and handling responses.
- **Debounced Search Bar (`AdminFilterBar`)**: 300ms debounce across all management views, animated spinner inside search icon during data loading, and instant clear `✕` button without table flickering.
- **Sub-Tab Architecture**:
  - **Passes**: `[ คูปองรางวัล ]` (Reward Passes) & `[ ประวัติใช้โค้ดพิเศษ ]` (Special Code Redemptions).
  - **Promotions**: `[ รายการโปรโมชั่น ]` (Reward Catalog) & `[ โค้ดพิเศษ ]` (Campaign Codes).
- **Enforced Password Security (`PasswordCriteriaChecklist`)**: Standardized 4-point criteria validation used during forced rotation, profile updates, and admin provisioning.
- **Flexible Team Provisioning**:
  - System administrators can invite accounts with either a default temporary password (forcing change on initial login) or define a custom password hashed immediately.
- **Review Verification Center**: Inspect uploaded screenshot proof and tweet links. One-click approvals atomically credit points via Prisma transactions, with support for reversible status rollbacks.
- **Pass Verification & Invalidation**: Look up vouchers presented by customers in X direct messages, view target concert assignments, and flag passes as used.
- **Member Management**: Search members by name or X username, review lifetime ledger history, and perform manual point additions (with green confirm button) or deductions.

---

## 🔑 Security & Database Initialization

### 1. Production Database Seeding (SQL)

For production environments (Supabase, Neon, AWS RDS, psql), run the idempotent SQL seed script:

```sql
-- Located in prisma/seed.sql
-- Safely inserts initial DEV, OWNER, and STAFF accounts (ON CONFLICT DO NOTHING)
```

You can execute `prisma/seed.sql` directly in your database provider's SQL editor or via CLI:

```bash
psql -d $DATABASE_URL -f prisma/seed.sql
```

### 2. Automatic First-Time Seeding

When accessing the admin portal for the first time, if no administrative account exists in the database, the system automatically provisions the default `DEV` account (`dev@system.lele.com` with password `1234` or configured in `.env.local`), requiring a forced password change upon first login. Additional accounts can then be provisioned directly via the "+ เพิ่มบัญชีแอดมินใหม่" modal in the admin portal.

---

## 🛠️ Installation & Setup

### 1. Environment Configuration

Create a `.env.local` file from `.env.example`:

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# PostgreSQL connection string (Supabase, Neon, or local instance)
DATABASE_URL="postgresql://postgres:password@localhost:5432/lele_ticket?schema=public"

# Authentication secrets
JWT_SECRET="your_jwt_signing_secret_here"
ADMIN_JWT_SECRET="your_admin_jwt_secret_here"

# LINE LIFF Application ID (from LINE Developers Console)
NEXT_PUBLIC_LINE_LIFF_ID="YOUR_LINE_LIFF_ID_HERE"

# Shop Twitter / X handle (default: lele0423_ticket)
NEXT_PUBLIC_SHOP_X_HANDLE="lele0423_ticket"

# Cloudinary media storage credentials
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 2. Database Migration

Synchronize the Prisma schema with your database:

```bash
npx prisma db push
```

### 3. Development Server

Run the local Next.js development server:

```bash
npm run dev
```

- **Customer Portal**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

### 4. Code Quality & Type Verification

Ensure all TypeScript definitions compile without errors:

```bash
npx tsc --noEmit
```

---

## 📲 LINE Developers Console Configuration

1. Log into the [LINE Developers Console](https://developers.line.biz/).
2. Create a **Provider** and a **LINE Login Channel**.
3. Under the **LIFF** tab, click **Add**:
   - **Size**: Full
   - **Endpoint URL**: Your deployed domain URL or development tunnel (ngrok / Cloudflare Tunnel).
   - **Scopes**: `profile`, `openid`
   - **Bot prompt**: Set to **Normal** or **Aggressive** to prompt official LINE account friending upon access.
4. Copy the generated **LIFF ID** into `NEXT_PUBLIC_LINE_LIFF_ID` in your `.env.local`.

---

## 📐 Engineering Guidelines

- Follow all standards defined in [AGENTS.md](file:///c:/D/lele_ticket/AGENTS.md) and [DESIGN.md](file:///c:/D/lele_ticket/DESIGN.md).
- **Zero AI Slop**: Write minimal, clean, and intentional code without redundant boilerplate.
- **No Decorative Icons**: Avoid ornamental icon usage in badges, buttons, and helper banners. Rely on strong typography, intentional spacing, and curated brand colors.
- **Single Source of Truth**: Leverage centralized shared modules: `AdminDataTable<T>`, `Pagination`, `AdminFilterBar`, `PasswordCriteriaChecklist`, `adminFetch`, `siteConfig`, and `liff.ts`.
- **Atomic Operations**: All point ledger mutations and review approvals must execute inside `prisma.$transaction()` blocks.
- **Zero-Dependency Localization**: Date rendering strictly uses native `Intl.DateTimeFormat` via `formatThaiDateTime()` in `src/lib/date.ts`.
