# Design System — Graphic Design English Trainer

> Derived from the reference dashboard screenshot (HubSpot-style CRM workspace UI).
> Applied to: Graphic Design English Trainer — a mission-based English teaching trainer for graphic design professors.

---

## 1. Design Movement

**Neo-Minimal Workspace UI** — Clean, task-focused dashboard aesthetic with strategic accent pops. Inspired by modern SaaS CRM tools (HubSpot, Linear, Notion). Functional clarity over decoration, with one vivid accent color breaking the neutral field.

---

## 2. Color Philosophy

The palette is built around a near-white neutral base, deep charcoal for authority, and a single electric lime-green accent that signals "active," "progress," and "achievement." This mirrors the gamification logic of Duolingo but in a professional, academic register.

| Token | Value (OKLCH) | Role |
|---|---|---|
| `--background` | `oklch(0.97 0.003 240)` | Page background — warm off-white |
| `--foreground` | `oklch(0.12 0.01 240)` | Primary text — near-black charcoal |
| `--card` | `oklch(1 0 0)` | Card surface — pure white |
| `--card-foreground` | `oklch(0.12 0.01 240)` | Card text |
| `--primary` | `oklch(0.82 0.22 130)` | Lime-green accent — active states, CTA, progress |
| `--primary-foreground` | `oklch(0.1 0.02 130)` | Text on lime-green |
| `--secondary` | `oklch(0.93 0.005 240)` | Subtle fill — filter chips, inactive states |
| `--secondary-foreground` | `oklch(0.35 0.01 240)` | Text on secondary |
| `--muted` | `oklch(0.95 0.003 240)` | Disabled / placeholder backgrounds |
| `--muted-foreground` | `oklch(0.55 0.012 240)` | Placeholder text, metadata labels |
| `--accent` | `oklch(0.82 0.22 130)` | Same as primary — used for highlights |
| `--accent-foreground` | `oklch(0.1 0.02 130)` | Text on accent |
| `--destructive` | `oklch(0.58 0.24 27)` | Error / wrong answer |
| `--destructive-foreground` | `oklch(0.98 0 0)` | Text on destructive |
| `--border` | `oklch(0.90 0.004 240)` | Subtle dividers |
| `--input` | `oklch(0.90 0.004 240)` | Input borders |
| `--ring` | `oklch(0.82 0.22 130)` | Focus ring — lime |
| `--sidebar` | `oklch(0.10 0.01 240)` | Dark sidebar background |
| `--sidebar-foreground` | `oklch(0.85 0.005 240)` | Sidebar text |
| `--sidebar-primary` | `oklch(0.82 0.22 130)` | Active sidebar item |
| `--sidebar-primary-foreground` | `oklch(0.1 0.02 130)` | Text on active sidebar |
| `--sidebar-accent` | `oklch(0.18 0.01 240)` | Sidebar hover |
| `--sidebar-accent-foreground` | `oklch(0.92 0.005 240)` | Text on sidebar hover |
| `--sidebar-border` | `oklch(1 0 0 / 8%)` | Sidebar dividers |
| `--success` | `oklch(0.82 0.22 130)` | Correct answer — same as primary |
| `--warning` | `oklch(0.78 0.18 75)` | Partial / hint state |

---

## 3. Typography System

Two-font system: a geometric sans-serif display font for headings and a humanist sans for body text. No Inter.

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / Hero | `DM Sans` | 800 (ExtraBold) | 2.5rem–4rem |
| Section Heading | `DM Sans` | 700 (Bold) | 1.25rem–1.75rem |
| Card Title | `DM Sans` | 600 (SemiBold) | 1rem–1.125rem |
| Body / Instruction | `Noto Sans KR` | 400 (Regular) | 0.875rem–1rem |
| Label / Metadata | `Noto Sans KR` | 400 | 0.75rem |
| Badge / Tag | `DM Sans` | 600 | 0.6875rem |
| Code / Keyword | `JetBrains Mono` | 500 | 0.875rem |

```html
<!-- Google Fonts CDN -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
```

---

## 4. Layout Paradigm

**Asymmetric Sidebar + Content Grid**

- Left sidebar: narrow (64px collapsed / 220px expanded), dark background (`--sidebar`), icon-first navigation
- Main content: off-white background, generous padding (2rem), card-based grid layout
- Top bar: dark pill-shaped schedule/progress bar spanning full width
- Cards: white surfaces with soft shadow, large border-radius (16px), hover lift effect
- No centered hero layouts — content starts from left edge with sidebar offset

```
┌──────────┬────────────────────────────────────────┐
│  Sidebar │  Top Progress Bar (dark pill)           │
│  (dark)  ├────────────────────────────────────────┤
│          │  Page Header (title + stats)            │
│  64px    ├────────────────────────────────────────┤
│  icons   │  Mission Grid (cards)                   │
│          │                                         │
│          │  Stage Exercises (card panels)          │
└──────────┴────────────────────────────────────────┘
```

---

## 5. Component Specifications

### Cards
- Background: `var(--card)` — white
- Border-radius: `16px`
- Box-shadow: `0 2px 8px oklch(0 0 0 / 6%), 0 0 1px oklch(0 0 0 / 8%)`
- Hover: `translateY(-2px)`, shadow deepens to `0 8px 24px oklch(0 0 0 / 10%)`
- Padding: `1.25rem 1.5rem`
- Active/selected: left border `4px solid var(--primary)` + lime tint background

### Active Card (Mission in Progress)
- Background: `var(--primary)` — lime-green fill
- Text: `var(--primary-foreground)` — dark
- Shadow: `0 8px 32px oklch(0.82 0.22 130 / 35%)`

### Buttons
- Primary: lime-green fill, dark text, `border-radius: 999px` (pill shape)
- Secondary: white fill, dark border, pill shape
- Icon button: circular, `40px`, soft gray background
- CTA: dark/black fill with white text (matches the "New Task" button in reference)

### Filter Chips
- Default: `var(--secondary)` background, rounded-full
- Active: white background, subtle shadow, bold text
- Hover: slight shadow lift

### Progress Bar (Top)
- Dark pill container (`oklch(0.12 0.01 240)`)
- Lime-green fill indicating current position
- White circular avatar markers at stage points
- Current time indicator: small lime badge with drop shadow

### Sidebar Icons
- 40px circular icon buttons
- Active: dark fill (`oklch(0.12 0.01 240)`) with white icon
- Inactive: transparent with muted icon
- Hover: `var(--sidebar-accent)` background

### Badges
- Rounded-full, small padding
- Colors: lime (success), red (error), amber (warning), gray (neutral)
- Font: DM Sans 600, 11px

---

## 6. Signature Elements

1. **Lime-green progress pill** — The top navigation bar doubles as a visual timeline/progress indicator. Used for mission progress, stage completion, and current position.
2. **Dark sidebar with circular icon buttons** — Minimal, icon-only navigation that collapses to 64px. Active state uses solid dark circle.
3. **White card grid on off-white background** — Cards float above the background with soft shadows. The contrast between white cards and off-white page creates subtle depth without borders.

---

## 7. Interaction Philosophy

- **Gamification through visual state changes**: Cards transform visually when active (lime fill), completed (checkmark badge), or locked (muted opacity)
- **Immediate feedback**: Correct answers trigger lime-green flash; wrong answers trigger red shake animation
- **Progress is always visible**: XP bar, stage progress, and streak counter are persistent in the top bar
- **Micro-interactions**: Button press scales to 0.97, cards lift on hover, progress bars animate smoothly

---

## 8. Animation Guidelines

| Interaction | Duration | Easing |
|---|---|---|
| Card hover lift | 180ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Button press | 120ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Correct answer flash | 300ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Wrong answer shake | 400ms | `cubic-bezier(0.36, 0.07, 0.19, 0.97)` |
| Stage unlock | 500ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Progress bar fill | 600ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Modal/drawer open | 250ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Page transition | 200ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| List item stagger | 40ms per item | `cubic-bezier(0.23, 1, 0.32, 1)` |

---

## 9. Spacing System

Based on 4px base unit:

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Icon gap, tight label spacing |
| `space-2` | 8px | Badge padding, chip padding |
| `space-3` | 12px | Small card padding |
| `space-4` | 16px | Standard element gap |
| `space-5` | 20px | Card internal padding |
| `space-6` | 24px | Section gap |
| `space-8` | 32px | Large section padding |
| `space-10` | 40px | Page section gap |
| `space-12` | 48px | Hero padding |

---

## 10. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Badges, chips, small tags |
| `radius-md` | 10px | Input fields, small buttons |
| `radius-lg` | 16px | Cards, panels |
| `radius-xl` | 24px | Large cards, modals |
| `radius-full` | 9999px | Pill buttons, avatars, progress bars |
