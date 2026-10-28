# LELE' Ticket — Brand & UI Design System / 1.0

> **Made for your next fan moment**  
> Every moment you anticipate begins with this ticket.  
> Digital membership and queue concierge system for LELE' Ticket. Warm, friendly, and responsive to every booking need.

**Brand Personality:** Warm · Playful · Thoughtful

---

## 01 Color Foundations

Core palette and complementary functional tokens.

### Brand Palette

| Token | Hex | Role | Usage |
|---|---|---|---|
| **Cream** | `#F7EBC9` | Brand Surface | Member card background, warm accents |
| **Cornflower** | `#5284B7` | Brand Primary | Illustration, graphical highlights |
| **Booking Blue** | `#25384C` | Action & Text | Primary buttons, headers, main labels |
| **Ink** | `#25384C` | Typography | Primary body text, high-emphasis content |
| **Slate** | `#657406` | Secondary Text | Subtitles, timestamps, auxiliary labels |
| **Cloud** | `#FAF8F2` | Canvas | Application background, secondary surfaces |
| **Paper** | `#FFFFFF` | Surface | Cards, modals, elevated containers |
| **Mist** | `#D0DEF7` | Border | Card dividers, input borders, structural strokes |

### Semantic Colors (Foreground · Soft Surface)

| Role | Foreground | Surface | Usage |
|---|---|---|---|
| **Success** | `#2D7058` | `#EAF4EE` | Approved reviews, positive point increments, active passes, add point action |
| **Warning** | `#956018` | `#FCF2D9` | Pending reviews, cautionary notes |
| **Error** | `#B01444` | `#FBEDED` | Rejected submissions, point deductions, destructive actions |
| **Info** | `#315F91` | `#EDF3FA` | External links, informational tags |

### Color Principles
- Use **Cream** and **Cornflower** for distinct brand personality moments (e.g., member cards).
- Anchor interactive controls with **Booking Blue** for high contrast and accessibility.
- Apply semantic colors strictly for status and audit states without mixing background varieties.

---

## 02 Typography & Space

Clear hierarchy, legible weights, and bilingual pairing.

### Type Scale

| Role | Size / Line Height / Weight | Usage |
|---|---|---|
| **Display** | 40 / 56 px · 600 | Marketing banners, hero titles |
| **Heading** | 28 / 40 px · 600 | Section headers |
| **Title** | 20 / 30 px · 600 | Modal titles, card headings |
| **Body** | 16 / 28 px · 400 | Primary body copy |
| **Label** | 14 / 22 px · 500 | Form field labels, action buttons |
| **Caption** | 12 / 20 px · 400 | Helper text, secondary timestamps, tags |

### Font Pairing (Bilingual)

**Primary Thai Font: Noto Sans Thai**
- Used for all Thai script copy.
- Displayed with proportional line-height (1.4–1.6) for optimal readability.

**Secondary Latin & Numerical Font: Nunito Sans**
- Used for numerical values, Latin text, pass voucher codes (`LELE-FT-XXXXX`), status labels, and financial ledger amounts.

### Geometry & Spacing (4 px Base Grid)

| Unit | Value | Typical Usage |
|---|---|---|
| 1 | 4 px | Micro spacing, icon offsets |
| 2 | 8 px | Tight element gaps, badge padding |
| 3 | 12 px | Input field padding, list gap |
| 4 | 16 px | Card inner padding, section spacing |
| 6 | 24 px | Layout division, modal margins |
| 8 | 32 px | Major component separation |

### Border Radius (Tailwind Canonical Scale)
- **Extra Small (4 px)**: `rounded` — Minor inner controls, skeleton loaders.
- **Compact (6 px)**: `rounded-md` — Sub-tab buttons, close icons.
- **Small (8 px)**: `rounded-lg` — Status tags, chip controls, compact badges.
- **Control (12 px)**: `rounded-xl` — Interactive buttons, text inputs, selectors.
- **Card (16–20 px)**: `rounded-2xl` (16px) / `rounded-[20px]` — Modal dialogs, content cards, member cards.
- **Full / Pill (9999 px)**: `rounded-full` — Circular avatars, count badges, circular logo icon.

---

## 03 Brand Identity & Core Components

Intentional, minimal design that avoids visual clutter and redundant decorations.

### 1. Unified Brand Header & Browser Identity
- **Navigation Bar**: Standardized across both User (`Navbar.tsx`) and Admin:
  - Circular avatar logo (`src/app/icon.png` served at `/icon.png`, 32×32px, `rounded-full border border-[#D0DEF7] object-cover`).
  - Brand typography: `LELE' Ticket` (semi-bold) + `#เลอเล่อรับกดบัตร` in Slate (`text-xs text-[#657406]`).
- **Browser Tab & Favicon**:
  - Unified title: `LELE' Ticket - #เลอเล่อรับกดบัตร`.
  - Circular favicon & app icon rendered natively via App Router (`src/app/icon.png` & `src/app/favicon.ico`).
- **Quick X Store Action**: Circular X icon button (`36×36px`, `rounded-full border border-[#D0DEF7] bg-white`) linking directly to `@lele0423_ticket` (`https://x.com/lele0423_ticket`) for 1-tap navigation, removing redundant links from profile dropdowns.

### 2. No Decorative Icons Policy
- **Strict Rule**: Never add decorative icons or emojis (e.g. `Camera`, `CheckCircle2`, `Clock`, `XCircle`, `PlusCircle`, `Send`, `Sparkles`, `📌`) to buttons, form fields, helper banners, or status badges.
- Rely on strong typographical contrast, intentional spacing, and curated brand colors.
- Icons are strictly restricted to necessary navigation controls (e.g., modal dismiss `✕`, pagination chevrons) and explicit functional triggers (`MessageSquarePlus` for adding review).

### 3. Point Ledger & Badge Typography
- Point adjustments (`+1 point`, `-1 point`) must be rendered as clean, high-contrast typography (`text-sm font-bold font-latin`).
- **User Modals**: Render badges as clean, borderless colored text (`text-[#2D7058]`, `text-[#657406]`) without candy pill background rectangles.
- **Admin Tables**: Use subtle semantic pills (`text-[#956018] bg-[#FCF2D9]`, `text-[#2D7058] bg-[#EAF4EE]`, `text-[#B01444] bg-[#FBEDED]`).

### 4. Admin Search & Filtering (`AdminFilterBar`)
- **Debounced Input**: Built-in 300ms debounce to prevent constant refetching during rapid typing.
- **Loading State**: Displays an inline animated spinner inside the search icon space during active network queries.
- **Clear Button**: Subtle `✕` button appears when query text exists, providing immediate clearing in a single click.
- **No Table Flickering**: Tables maintain stable opacity during live search queries to ensure smooth visual ergonomics.

### 5. Admin Sub-Tab Navigation
- Clean bracket style for clear hierarchy:
  - Passes Management: `[ คูปองรางวัล ]` & `[ ประวัติใช้โค้ดพิเศษ ]`
  - Promotion Management: `[ รายการโปรโมชั่น ]` & `[ โค้ดพิเศษ ]`

### 6. Password Security Validation (`PasswordCriteriaChecklist`)
- Standardized checklist for password requirements:
  - At least 8 characters
  - At least one lowercase letter (a-z)
  - At least one uppercase letter (A-Z)
  - At least one number (0-9)
- Dynamically highlights green (`text-[#2D7058]`) when criteria are satisfied.

### 7. Buttons (48 px Standard Touch Height)
- **Primary**: Solid Booking Blue background (`bg-[#25384C]`), white text, `rounded-[12px]`, subtle shadow (`shadow-md shadow-[#25384C]/20`).
- **Dynamic Action**: In stamp adjustment modal, confirm button dynamically switches to green (`bg-[#2D7058] hover:bg-[#235845]`) when adding points.
- **Secondary**: White background (`bg-white`), Booking Blue text (`text-[#25384C]`), Mist border (`border border-[#D0DEF7]`), `rounded-[10px]`.
- **States**: `hover:bg-[#1B2938]`, `active:scale-[0.99]`, `disabled:opacity-50`.

### 8. Modals & Overlays
- **Backdrop**: Unified `fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm`.
- **Dismissal**: Always support clicking the backdrop to dismiss the modal and reset form state.
- **Scrolling Behavior**: Sticky header and pagination footer with middle section scroll (`flex-1 overflow-y-auto`).

---

## 04 Implementation Tokens

### CSS Custom Properties
```css
:root {
  /* Brand Tokens */
  --color-cream: #F7EBC9;
  --color-cornflower: #5284B7;
  --color-booking-blue: #25384C;
  --color-ink: #25384C;
  --color-slate: #657406;
  --color-cloud: #FAF8F2;
  --color-paper: #FFFFFF;
  --color-mist: #D0DEF7;

  /* Semantic Tokens */
  --color-success: #2D7058;
  --color-success-bg: #EAF4EE;
  --color-warning: #956018;
  --color-warning-bg: #FCF2D9;
  --color-error: #B01444;
  --color-error-bg: #FBEDED;
  --color-info: #315F91;
  --color-info-bg: #EDF3FA;

  /* Radii */
  --radius-sm: 8px;
  --radius-control: 12px;
  --radius-card: 20px;
  --radius-pill: 9999px;
}
```

---

*LELE' Ticket Design System v1.0 — Clean, accessible, and intentional design.*
