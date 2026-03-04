# Slip It — "Nuit de Soirée" Theme

A premium dark party theme inspired by Midnight Galaxy + Tech Innovation,
designed for a mobile party game with Ionic/Angular.

## Color Palette

| Role | Hex | Token | Usage |
|------|-----|-------|-------|
| **Crimson Party** | `#e94560` | `--ion-color-primary` | CTAs, active states, brand accent |
| **Gold Rush** | `#f5a623` | `--ion-color-secondary` | Secondary actions, secret words, highlights |
| **Violet Deep** | `#6a0dad` | `--ion-color-tertiary` | Rare accents, special modes |
| **Navy Cosmos** | `#0f1117` | `--ion-background-color` | Base background |
| **Champagne** | `#f0eff4` | `--ion-text-color` | Primary text (dark mode) |
| **Muted Silver** | `#a8a9b4` | `--ion-color-medium` | Hints, labels, secondary text |

### Semantic Colors

| Role | Hex | Usage |
|------|-----|-------|
| Success | `#2dd36f` | Correct actions, confirm |
| Warning | `#ffc409` | Timer urgency, caution |
| Danger | `#eb445a` | Errors, destructive actions |

### Podium Metals

| Role | Hex | Token |
|------|-----|-------|
| Gold | `#ffd700` | `--pam-gold` |
| Silver | `#c0c0c0` | `--pam-silver` |
| Bronze | `#cd7f32` | `--pam-bronze` |

## Typography

- **Font Family**: Nunito (Google Fonts) — rounded, friendly, great for a party game
- **Headings**: Nunito Bold/Black (700–900)
- **Body**: Nunito Regular/SemiBold (400–600)

### Type Scale (strict — all font-sizes must use these tokens)

| Token | Size | Pixel | Usage |
|-------|------|-------|-------|
| `--pam-font-2xs` | 0.65rem | 10.4px | Tiny labels, superscripts |
| `--pam-font-xs` | 0.75rem | 12px | Captions, badges, legal, date labels |
| `--pam-font-sm` | 0.875rem | 14px | Hints, sub-labels, secondary text |
| `--pam-font-base` | 1rem | 16px | Body text, buttons |
| `--pam-font-lg` | 1.125rem | 18px | Emphasis, large body, list names |
| `--pam-font-xl` | 1.5rem | 24px | Section titles, stat values |
| `--pam-font-2xl` | 1.875rem | 30px | Page subtitles, card targets |
| `--pam-font-3xl` | 2.25rem | 36px | Feature numbers, hero sub-elements |
| `--pam-font-4xl` | 2.75rem | 44px | Hero headline, secret words |

## Surfaces & Elevation

### Surfaces (alpha over background)

| Token | Value | Usage |
|-------|-------|-------|
| `--pam-surface` | `rgba(255,255,255, 0.07)` | Default card/item/row bg |
| `--pam-surface-hover` | `rgba(255,255,255, 0.12)` | Hover state |
| `--pam-surface-active` | `rgba(255,255,255, 0.16)` | Active/pressed state |

### Glassmorphism

| Token | Value | Usage |
|-------|-------|-------|
| `--pam-glass-bg` | `rgba(255,255,255, 0.08)` | Glass card backgrounds |
| `--pam-glass-border` | `rgba(255,255,255, 0.14)` | Glass card borders |
| `--pam-glass-blur` | `14px` | Backdrop blur amount |

### Elevation (3 levels max — V3 compliant)

| Level | Token | Value |
|-------|-------|-------|
| 0 — Flat | — | No shadow (default) |
| 1 — Subtle | `--pam-shadow-sm` | `0 2px 6px rgba(0,0,0, 0.15)` |
| 2 — Raised | `--pam-shadow-md` | `0 4px 16px rgba(0,0,0, 0.22)` |
| 3 — Floating | `--pam-shadow-lg` | `0 8px 24px rgba(0,0,0, 0.28)` |

## Border Radius (Rounded system — friendly, modern)

| Token | Value | Usage |
|-------|-------|-------|
| `--pam-radius-sm` | 8px | Small chips, inputs, items |
| `--pam-radius-md` | 16px | Buttons, cards, panels |
| `--pam-radius-lg` | 24px | Large cards, modals, overlays |
| `--pam-radius-xl` | 32px | Feature panels |
| `--pam-radius-pill` | 999px | Pills, badges, tags |

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--pam-space-xs` | 4px | Tight gaps, border offset |
| `--pam-space-sm` | 8px | Small gaps, item padding |
| `--pam-space-md` | 16px | Default padding, card content |
| `--pam-space-lg` | 24px | Section padding, card margins |
| `--pam-space-xl` | 32px | Large section gaps |
| `--pam-space-2xl` | 48px | Hero padding, page top margin |

## Animation Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--pam-anim-fast` | 150ms | Press feedback, micro-interactions |
| `--pam-anim-normal` | 280ms | Slide, fade, page enter |
| `--pam-anim-slow` | 500ms | Pop, dramatic reveals |

## Design Rules

1. **No random font-sizes** — all text uses `--pam-font-*` tokens
2. **No hardcoded surfaces** — use `--pam-surface`, `--pam-glass-bg` tokens
3. **No hardcoded blur** — always `var(--pam-glass-blur)`
4. **No hardcoded podium colors** — use `--pam-gold/silver/bronze`
5. **Glows are accent-only** — reserved for primary CTAs and podium
6. **Border radius from token** — always `--pam-radius-*`
7. **Spacing from scale** — prefer `--pam-space-*` for consistency
