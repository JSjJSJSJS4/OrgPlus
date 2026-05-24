# Design Document
## EventPlan — UI/UX Design System & Component Guidelines

**Version:** 1.0.0  
**Status:** Active  
**Last Updated:** May 2026  

---

## 1. Design Philosophy

EventPlan's design is driven by three core principles:

1. **Premium Dark Aesthetic** — The interface uses a deep navy/slate dark theme with purple-to-blue gradient accents. Users should feel they are using a professional-grade product, not a school project.

2. **Glassmorphism UI Language** — Cards, panels, and modals use frosted glass layering (backdrop blur + transparent backgrounds) to create visual depth without overwhelming users with solid colors.

3. **Micro-Interactions & Purposeful Motion** — Every interactive element responds to user actions with smooth transitions, hover lifts, and loading spinners to confirm that the system is alive and responsive.

---

## 2. Color Palette

### 2.1 Base Background Layers

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0b0f19` | Page background (deepest layer) |
| `--bg-card` | `rgba(15, 23, 42, 0.65)` | Glass panel cards |
| `--bg-subtle` | `rgba(30, 41, 59, 0.45)` | Secondary glass cards |
| `--bg-hover` | `rgba(15, 23, 42, 0.80)` | Glass card on hover |

### 2.2 Accent Colors

| Token | Hex / HSL | Usage |
|---|---|---|
| `--primary` | `#a855f7` (Purple-500) | Primary actions, active nav items |
| `--primary-dark` | `#7c3aed` (Violet-600) | Button hover states |
| `--secondary` | `#6366f1` (Indigo-500) | Gradient pair with primary |
| `--blue` | `#3b82f6` (Blue-500) | Info states, officer badges |
| `--teal` | `#14b8a6` (Teal-500) | Committee roles |
| `--emerald` | `#10b981` (Emerald-500) | Success states, approved badges |
| `--amber` | `#f59e0b` (Amber-500) | Warning states, pending badges |
| `--rose` | `#f43f5e` (Rose-500) | Error states, rejected badges |

### 2.3 Text Colors

| Token | Value | Usage |
|---|---|---|
| `--text-primary` | `#f1f5f9` (Slate-100) | Body copy, default text |
| `--text-secondary` | `#94a3b8` (Slate-400) | Labels, captions |
| `--text-muted` | `#475569` (Slate-600) | Placeholders, disabled |
| `--text-white` | `#ffffff` | Headings on dark backgrounds |

### 2.4 Border Colors

| Token | Value | Usage |
|---|---|---|
| `--border-default` | `rgba(255,255,255,0.06)` | Standard glass panel border |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Elevated glass panels |
| `--border-purple` | `rgba(168,85,247,0.30)` | Hover states on cards |

---

## 3. Typography

### 3.1 Font Families

```css
/* Primary: Headings and UI labels */
font-family: 'Outfit', sans-serif;

/* Secondary: Body text and descriptions */
font-family: 'Inter', sans-serif;

/* Fallback stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

Both fonts are loaded via Google Fonts with `display=swap` for performance.

### 3.2 Type Scale

| Role | Size | Weight | Font | Usage |
|---|---|---|---|---|
| Display | `2.25rem` (36px) | 800 (ExtraBold) | Outfit | Hero/welcome headings |
| H1 | `1.75rem` (28px) | 700 (Bold) | Outfit | Page titles |
| H2 | `1.25rem` (20px) | 700 (Bold) | Outfit | Section headings |
| H3 | `1rem` (16px) | 700 (Bold) | Outfit | Card titles |
| Body | `0.875rem` (14px) | 400 (Regular) | Inter | Standard UI copy |
| Small | `0.75rem` (12px) | 400-600 | Inter | Labels, captions |
| Micro | `0.625rem` (10px) | 700 (Bold) | Inter | Badges, tags, chips |

---

## 4. Spacing System

EventPlan follows Tailwind's default 4px base unit spacing:

| Scale | Size | Usage |
|---|---|---|
| `1` | 4px | Tight gaps between inline elements |
| `2` | 8px | Compact padding inside badges |
| `3` | 12px | Default button padding (vertical) |
| `4` | 16px | Card internal padding |
| `5` | 20px | Section gaps |
| `6` | 24px | Card-to-card gaps |
| `8` | 32px | Page section separation |
| `12` | 48px | Empty state vertical padding |

---

## 5. Glass Panel Component

The core design primitive used throughout the application.

### 5.1 Standard Glass Panel

```css
.glass-panel {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### 5.2 Hoverable Glass Panel

```css
.glass-panel-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-panel-hover:hover {
  background: rgba(15, 23, 42, 0.80);
  border-color: rgba(168, 85, 247, 0.30);
  box-shadow: 0 10px 30px -10px rgba(168, 85, 247, 0.15);
  transform: translateY(-2px);
}
```

### 5.3 Form Input Glass

```css
.glass-input {
  background: rgba(15, 23, 42, 0.40);
  border: 1px solid rgba(255, 255, 255, 0.10);
  color: #f8fafc;
  transition: all 0.2s ease-in-out;
}
.glass-input:focus {
  background: rgba(15, 23, 42, 0.70);
  border-color: rgba(168, 85, 247, 0.50);
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.20);
  outline: none;
}
```

---

## 6. Color-Coded Role Badge System

Roles are visually differentiated with consistent HSL-tailored color pairs that adjust for theme state:

| Role | Badge Color | Tailwind Classes (Light Mode) | Tailwind Classes (Dark Mode) |
|---|---|---|---|
| Super Admin | Rose | `text-red-700 bg-red-50 border-red-200` | `dark:text-red-400 dark:bg-red-950/40 dark:border-red-500/30` |
| Officer | Blue | `text-blue-700 bg-blue-50 border-blue-200` | `dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-500/30` |
| Committee Member | Teal | `text-teal-700 bg-teal-50 border-teal-200` | `dark:text-teal-400 dark:bg-teal-950/40 dark:border-teal-500/30` |
| Member | Emerald | `text-emerald-700 bg-emerald-50 border-emerald-200` | `dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-500/30` |
| Applicant | Amber | `text-amber-700 bg-amber-50 border-amber-200` | `dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-500/30` |

---

## 7. Status Badge System

Consistent status indicators used across applications, events, and attendance:

| Status | Color | Tailwind Classes (Light Mode) | Tailwind Classes (Dark Mode) |
|---|---|---|---|
| Approved / Present | Emerald | `text-emerald-700 bg-emerald-50 border-emerald-200` | `dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30` |
| Pending / Absent | Amber | `text-amber-700 bg-amber-50 border-amber-200` | `dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30` |
| Screening | Blue | `text-blue-400 bg-blue-500/10 border-blue-500/30` |
| Interview | Purple | `text-purple-400 bg-purple-500/10 border-purple-500/30` |
| Rejected / Error | Rose | `text-rose-400 bg-rose-500/10 border-rose-500/30` |
| Completed | Slate | `text-slate-400 bg-slate-900 border-slate-800` |
| Live / Ongoing | Emerald (animated) | `text-emerald-400 animate-pulse` |

---

## 8. Button System

### 8.1 Primary Button (Gradient)

```css
.bg-gradient-button {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  transition: all 0.2s ease-in-out;
}
.bg-gradient-button:hover {
  opacity: 0.95;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.40);
}
```

Usage: Primary CTAs — "Submit Application", "Approve & Schedule", "Save Profile"

### 8.2 Ghost Button

```css
background: transparent;
border: 1px solid rgba(100, 116, 139, 0.40); /* slate-500/40 */
color: #94a3b8;
```

Usage: Secondary actions — "Cancel", "View Details", "Back"

### 8.3 Destructive Button

```css
background: rgba(244, 63, 94, 0.10);
border: 1px solid rgba(244, 63, 94, 0.30);
color: #f43f5e;
```

Usage: Dangerous actions — "Reject Application", "Remove from Committee", "Cancel Registration"

---

## 9. Layout Structure

### 9.1 Desktop (≥1024px)

```
┌────────────────────────────────────────────────────┐
│  Sidebar (256px fixed)  │  Content Area (fluid)    │
│                         │                          │
│  [Logo]                 │  [Sticky Header Bar]     │
│                         │                          │
│  Navigation links...    │  [Page Content]          │
│                         │                          │
│  [User Card]            │                          │
│  [Sign Out]             │                          │
└────────────────────────────────────────────────────┘
```

### 9.2 Mobile (<1024px)

```
┌──────────────────────────────┐
│  [Logo]         [☰ Menu]    │  ← Sticky mobile header
├──────────────────────────────┤
│                              │
│  [Page Content]              │
│                              │
└──────────────────────────────┘
  ↓ When ☰ is clicked:
┌──────────────────────────────┐
│  Slide-in sidebar drawer     │
│  (overlays content)          │
└──────────────────────────────┘
```

---

## 10. Decorative Design Elements

### 10.1 Background Orbs

Used on the auth page and main content area for depth:
```html
<!-- Purple orb — top-left -->
<div class="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[80px] animate-pulse-slow" />

<!-- Blue orb — bottom-right -->
<div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse-slow" />
```

### 10.2 Subtle Grid Overlay

Applied to feature/hero panels:
```html
<div class="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
```

### 10.3 Gradient Text

```css
.text-gradient {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 11. Animation Guidelines

| Animation | Duration | Easing | Usage |
|---|---|---|---|
| Card hover lift | 300ms | `cubic-bezier(0.4,0,0.2,1)` | All hoverable cards |
| Modal entrance | 200ms | `ease-in` | All modal/overlay overlays |
| Spinner | ∞ loop | `linear` | Loading states |
| Orb pulse | 8s loop | `ease-in-out` | Background decorative elements |
| Border highlight | 200ms | `ease-in-out` | Focused inputs, active navs |

---

## 12. Custom Scrollbar Styling

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #0b0f19; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #334155; }
```

---

## 13. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| `sm` | 640px | Grid collapses to single column, modals go full-width |
| `md` | 768px | 2-column grids enabled, sidebar transitions from drawer to static |
| `lg` | 1024px | Full sidebar rendered statically, desktop header replaces mobile header |
| `xl` | 1280px | Max content width of `max-w-7xl` applied |

---

## 14. Accessibility Standards

- **Contrast Ratio**: All text/background combinations meet WCAG 2.1 AA (4.5:1 minimum)
- **Focus Indicators**: All interactive elements have visible `:focus` states
- **Screen Readers**: Semantic `<button>`, `<table>`, `<nav>`, `<main>`, `<aside>` elements used throughout
- **Alt Text**: All avatar images have meaningful `alt` attributes
- **Color Independence**: Status is never conveyed by color alone — text labels always accompany colored badges
