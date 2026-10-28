# Context & Architecture: LELE' Ticket System

## 1. Project Overview
LELE' Ticket is a digital loyalty rewards, social review verification, and fast-track queue pass web application developed for a professional concert ticket booking concierge service (**#เลอเล่อรับกดบัตร**).

### Core Objectives
- **Social Proof Verification**: Incentivize customers to share post-concert booking reviews on X (Twitter) using the `#เลอเล่อรับกดบัตร` hashtag in exchange for reward points (1 approved review = +1 point).
- **Fast Track Queue Privileges**: Customers accumulate points to redeem valuable queue passes ("สิทธิ์ลัดคิว") and promotional booking discounts.
- **Special Campaign Codes**: Distribute and validate promotional codes (e.g., event giveaways, special drops) that credit points upon customer redemption.
- **Auditable Ledger Architecture**: Complete point ledger traceability with reversible status changes and atomic database transactions.
- **Administrative Portal**: Streamlined management dashboard to verify submitted proof, approve/reject reviews, look up and invalidate queue vouchers, adjust customer points, and manage campaigns.

---

## 2. Technology Stack
- **Framework**: Next.js (App Router, React 19, TypeScript)
- **Database & ORM**: PostgreSQL managed through Prisma ORM (`@prisma/client`)
- **Authentication**:
  - **Customer Portal**: LINE Front-end Framework (LIFF) SDK (`@line/liff`) via singleton `initLiff` in `src/lib/liff.ts` with automatic URL query cleanup (`window.history.replaceState` stripping `code`, `state`, `liffClientId`) preventing duplicate token exchange errors + Customer JWT Bearer tokens
  - **Admin Dashboard**: Multi-tier role-based session JWT (`x-admin-token`), cross-tab synchronized `localStorage`, bcrypt password hashing, and enforced first-time password rotation
- **API Client & Networking**: Centralized `adminFetch` in `src/lib/adminApi.ts` automatically injecting session headers and JSON serialization
- **Configuration & Shop Identity**: Centralized `src/lib/siteConfig.ts` managing social media handles (`NEXT_PUBLIC_SHOP_X_HANDLE`)
- **Media & Storage**: Cloudinary REST API (`/api/upload`) for review screenshots and user profile avatars
- **Styling**: Tailwind CSS + Custom Design System tokens (specified in `DESIGN.md`)
- **Date & Time Formatting**: Native zero-dependency Thai Buddhist era (`th-TH-u-ca-gregory`) and Bangkok timezone formatting via `formatThaiDateTime()` in `src/lib/date.ts` (using standard `Intl.DateTimeFormat`)

---

## 3. Data Architecture (Prisma Models)
- **`User`**: Customer profile containing LINE user ID (`lineId`), display name, avatar URL, X username (`xHandle`), telephone number, and current point balance (`stamps`).
- **`Admin`**: Administrative accounts categorized by role (`DEV`, `OWNER`, `STAFF`), password hashes, and initial rotation flags (`mustChangePassword`).
- **`ReviewSubmission`**: Submitted review evidence storing concert name, X handle, tweet link, image URL, and lifecycle status (`PENDING`, `APPROVED`, `REJECTED`).
- **`QueuePass`**: Unique redemption vouchers (e.g., `LELE-RW-XXXXX` / `LELE-FT-XXXXX`) generated via point redemption, tied to promotional rewards, tracking usage status (`ACTIVE`, `USED`).
- **`Promotion`**: Configurable reward catalog defining required points, reward titles, descriptions, and active statuses.
- **`SpecialCode`**: Promotional codes (e.g., `SUMMER2026`) with point rewards, usage caps, expiration dates, and active flags.
- **`CodeRedemption`**: Audit records tracking customer redemption of special codes.
- **`PointLog`**: Immutable audit ledger recording every point increase (+N) or deduction (-N) with timestamps, actor information, and associated reasons.

---

## 4. API Route Architecture

### Customer Endpoints
- **`GET /api/users`**: Retrieve profile and current point balance for authenticated user.
- **`PATCH /api/users`**: Update user X handle, phone number, and avatar URL.
- **`GET /api/users/passes`**: Paginated customer voucher wallet with status filters (`ALL`, `ACTIVE`, `USED`). Paged at 5 passes per page.
- **`GET /api/users/activities`**: Clean point ledger and review submission history. Filters out redundant approved review duplicates and separates used voucher records to eliminate UI noise.
- **`POST /api/reviews/submit`**: Submit new review verification request with concert name and proof image.
- **`GET /api/promotions`**: Fetch active reward catalog items for customer redemption.
- **`POST /api/promotions/redeem`**: Atomically deduct required points and generate a unique `QueuePass` code inside a Prisma transaction.
- **`POST /api/special-codes/redeem`**: Redeem a special campaign code for bonus points, enforcing usage limits and expiration checks.

### Admin Endpoints
- **`POST /api/admin/auth/login`**: Authenticate admin credentials, verify password hash, and return session token.
- **`POST /api/admin/auth/change-password`**: Rotate admin password and clear `mustChangePassword` flag.
- **`POST /api/admin/auth/create-admin`**: Provision new admin accounts with either default temporary password or instant custom password.
- **`GET /api/admin/reviews`**: List review submissions by status (`PENDING`, `APPROVED`, `REJECTED`).
- **`POST /api/admin/reviews`**: Approve review (+1 point) or reject with reason, wrapped in an atomic rollback-capable transaction.
- **`GET /api/admin/passes`**: Query and search queue passes by voucher code or customer name.
- **`POST /api/admin/passes/use`**: Validate and invalidate a customer's pass code when booking tickets.
- **`GET /api/admin/special-codes` & `POST /api/admin/special-codes`**: Create, edit, and toggle promotional special codes.
- **`GET /api/admin/code-redemptions`**: Query audit history of special code redemptions.
- **`GET /api/admin/users`**: Query members, inspect point history, and execute manual point adjustments.

---

## 5. UI Engineering & Key Components

1. **`AdminDataTable<T>`**: Unified, fully-typed tabular component powering 100% of admin dashboard views (`ReviewsTab`, `PassesTab`, `PromotionsTab`, `MembersTab`) with column sorting, animated skeleton loading states, empty fallback messages, and integrated pagination.
2. **`AdminFilterBar`**: Shared search & filter control featuring a 300ms debounce, inline loading spinner, and instant clear `✕` button to prevent UI table flickering.
3. **`PasswordCriteriaChecklist`**: Shared password security criteria validator (8+ characters, lowercase, uppercase, number) used across first-time rotation, profile settings, and new admin provisioning.
4. **`Pagination`**: Unified, accessible pagination component serving both customer wallet and admin tables.
5. **Branding & Assets**: Unified header layout (`LELE' Ticket` + `#เลอเล่อรับกดบัตร` with circular `/icon.png`), circular favicon & app icon natively served via App Router (`src/app/icon.png`, `src/app/favicon.ico`), unified browser title (`LELE' Ticket - #เลอเล่อรับกดบัตร`), and 1-tap circular X action button in navigation bar linking to the store handle configured in `siteConfig.ts`.
6. **Optimized Next.js Images**: Strictly use `<Image />` with `priority` and explicit dimensions for static assets, and `unoptimized` + `sizes` for dynamic user uploads, complying with Next.js best practices without raw `<img>` tags.
7. **Database Initialization**: `prisma/seed.sql` for idempotent production SQL setup (`ON CONFLICT DO NOTHING`) alongside automatic `ensureDefaultAdmin()` provisioning on first login.
8. **Zero AI Slop & No Decorative Icons**: Clean, intentional typography and brand colors without ornamental emojis or visual noise.
9. **Modal State Lifecycle**: Modals cleanly reset transient input states on dismissal, utilizing the standard `fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm` backdrop with single-frame inline transitions for multi-step flows.
