<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Guidelines & Engineering Standards

## 1. Core Principles & Philosophy
- **Zero AI Slop**: Write minimal, clean, and intentional code. Avoid redundant abstractions, unnecessary wrappers, or dead boilerplate.
- **No Decorative Icons (ห้ามใส่ icon)**: Do not add decorative icons or emojis (e.g. `Camera`, `CheckCircle2`, `Clock`, `XCircle`, `PlusCircle`, `Send`, `Sparkles`, `📌`) into buttons, status badges, helper banners, or form cards. Rely on strong, clean typography, intentional spacing, and curated brand colors. Icons are strictly limited to necessary navigation controls (such as modal close `✕` or pagination arrows) and functional triggers (such as `MessageSquarePlus` for adding a review).
- **Single Source of Truth**: Centralize and reuse shared logic and UI components instead of creating duplicated variations:
  - `AdminDataTable.tsx`: Unified data table component across 100% of admin views (`ReviewsTab`, `PassesTab`, `PromotionsTab`, `MembersTab`) with typed `ColumnDef`, sorting arrows, pulse skeleton loaders, empty states, and integrated pagination.
  - `Pagination.tsx`: Unified pagination across user wallet and admin tables.
  - `AdminFilterBar.tsx`: Unified search and filtering across all admin tabs with 300ms debouncing, search icon loading spinner, and instant clear `✕` button.
  - `PasswordCriteriaChecklist.tsx`: Unified real-time password strength checklist across login reset, profile settings, and admin creation.
  - `adminApi.ts` (`adminFetch`): Centralized admin API client automatically injecting `x-admin-token` and `Authorization: Bearer` headers with JSON serialization.
  - `siteConfig.ts`: Centralized shop social media identities (`NEXT_PUBLIC_SHOP_X_HANDLE`) with auto-sanitization across Navbar, PassWallet, and UserLogin.
  - `liff.ts`: Centralized singleton LIFF initialization (`initLiff`) with automatic URL cleanup (`window.history.replaceState`) preventing duplicate OAuth token exchange errors.
- **Graceful Error Handling & Reversibility**: Any critical state change (such as approving/rejecting reviews, debiting points, or redeeming passes) must support audit logging and status reversibility (undoing actions with synchronized point ledger rollbacks).

---

## 2. Codebase Conventions
- **TypeScript Strictness**: Always write fully-typed interfaces and functions. Run `npx tsc --noEmit` before concluding work to guarantee zero compile errors.
- **React Hook Order & Concurrency**:
  - Declare all React hooks (`useState`, `useEffect`, `useMemo`, `useRef`) at the absolute top of components prior to any conditional checks or early returns.
  - **No Synchronous setState in Effects**: Never call `setState` synchronously within `useEffect` body (prevents cascading renders). Wrap asynchronous data fetching in `queueMicrotask` with cleanup cancellation flags, and perform prop-to-state synchronization directly in the render phase.
- **Image Optimization (`@next/next/no-img-element`)**: Never render plain `<img>` tags. Always use Next.js `<Image />` with `priority` and explicit dimensions for static assets (e.g. `/icon.png`), and `unoptimized` + `sizes` for dynamic user uploads and external avatars.
- **Database Safety (Prisma)**: Wrap multi-step mutations (e.g. updating review status and inserting point log entries) in atomic `prisma.$transaction()` calls to preserve ledger integrity.
- **Production Seeding**: Maintain `prisma/seed.sql` for idempotent production SQL setup (`ON CONFLICT (email) DO NOTHING`) alongside automatic `ensureDefaultAdmin()` fallback on first login.
- **Date Handling**: Never render raw UTC timestamps from the database directly in UI text. Use `formatThaiDateTime()` in `src/lib/date.ts` powered by native `Intl.DateTimeFormat` (zero dependencies, `dayjs` removed) for consistent Thai Bangkok timezone rendering.
- **Smooth Search & Filtering**: Admin search bars must use `AdminFilterBar` with a 300ms debounce. Never introduce artificial opacity reductions (`opacity-40` / flickering) on table containers during search queries.
- **Client-Side Navigation**: Never assign directly to `window.location.href` for internal Next.js pages. Use `window.location.replace()` or Next.js `router.replace()` / `router.push()`.

---

## 3. UI & Design System Rules
- **Brand Tokens (DESIGN.md)**:
  - Canvas background: `#FAF8F2`
  - Cards & Surfaces: `#FFFFFF` with `#D0DEF7` borders
  - Primary text and actions: `#25384C` (hover: `#1B2938`)
  - Accent / secondary text: `#657406`
  - Links: `#315F91`
- **Modals & Overlays**:
  - Backdrop must strictly use `fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm` across all components.
  - Multi-step flows (such as reward exchange confirmation) must be rendered as clean inline transitions within the existing modal frame rather than stacking nested backdrop overlays.
- **Responsive Layouts**: Design mobile-first (optimized for LINE LIFF in-app browsers) while maintaining neat, horizontal alignments on wide desktop displays.
