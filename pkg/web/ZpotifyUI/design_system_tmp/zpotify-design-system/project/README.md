# Zpotify Design System

## Overview
**Zpotify** is a self-hosted Spotify alternative — a personal music streaming app built with Go (backend) and React/TypeScript (frontend). It streams music, supports Telegram-based and username/password authentication, and provides a minimal dark music player experience. The product is a single-surface web app (no separate marketing site or mobile app found).

### Sources
- **GitHub repo:** https://github.com/ruf-dev/zpotify (branch: `master`)
- **Frontend path:** `pkg/web/ZpotifyUI/` (Vite + React + TypeScript)
- **Backend:** Go server at repo root (`cmd/`, `internal/`, `pkg/`)
- **Logo:** `assets/logo.svg` (uploaded directly by user)

---

## CONTENT FUNDAMENTALS

### Tone & Voice
- **Casual and personal.** This is a hobbyist/self-hosted project. The copy is minimal and direct.
- **Lowercase-friendly.** Labels like `"Password"`, `"Soon, There will be some great music. Keep in touch"` — conversational, not corporate.
- **No emoji** in UI copy. None found in source.
- **First-person neutral.** Not "you" or "I" — interface labels are just nouns and verbs.
- **Work-in-progress vibe** is embraced (literally — the init page has a "work in progress" message).

### Casing
- Button labels: Title Case (`"Password"`)
- Navigation labels: PascalCase component names become short nouns
- Error messages: Sentence case
- Chip labels: lowercase (`.Label { text-transform: lowercase }`)

### Specific Copy Examples
- `"Soon, There will be some great music. Keep in touch"` — init page tagline (animated gradient)
- `"Password"` — auth button label
- `"loading"` — loading state placeholder
- Toast notifications: terse error/warning/info strings

---

## VISUAL FOUNDATIONS

### Color
- **Background system:** pure black (`#000000`) base, dark purple (`#310049`) for cards/inputs, deep magenta-purple (`#600052`) for borders and elevated surfaces.
- **Brand color:** Hot pink `#d9007f` — used for primary text, icons, player UI, logo fill, and glows.
- **Pink scale:** `#d9007f` → `#dc6dae` → `#d186b2` → `#f1a0d2` (primary → secondary → tertiary → accent)
- **Disabled:** `#9f8d98` (grayed-out muted pink)
- **Status:** error `#c1253d`, warning `#ffa500`, info `#e5f4d5`
- **Overall vibe:** High-contrast dark mode. Black + deep purples + vivid magenta. No gradients on backgrounds — gradients only on animated text. No glassmorphism.

### Typography
- **Single font:** `Comfortaa` (Google Fonts) — a rounded geometric sans-serif. Used at all weights 300–700.
- **Base size:** 16px across all elements (`* { font-size: 16px }`)
- **Scale:** display 2.5em, h1 2em, h2 1.5em, body 1em, caption 0.75em
- **Color:** Primary text uses `--main-fg-color` (#d9007f); body/secondary uses `--secondary-fg-color` (#dc6dae); tertiary/captions use `--thirdy-fg-color` (#d186b2)
- **Animated gradient text:** Used for the init page tagline — pink-to-green gradient shifting animation.

### Spacing
- Base unit: `1em`. All spacing in multiples of em.
- Header: fixed `6vh` height
- Player: fixed, `7vh` from bottom
- Section cards: `1em` padding, `2em` bottom padding
- Body margin: `8vh` top, `16vh` bottom (leaves room for fixed header + player)

### Borders & Cards
- **Border radius:** `1em` for cards/inputs; `15em` for pill buttons; `6em`/`16em` for circular logo button
- **Card style:** `border: 1px solid var(--accent-bg-color)` + `background: var(--main-bg-color)` + `border-radius: 1em`
- **Input style:** `border: 1px solid #999` with `border-radius: 1em`; bg `--secondary-bg-color`; border brightens to `#c5c4c4` on focus
- No box shadows on cards — elevation is conveyed through border color only

### Animations
- **Logo idle:** pulsing pink glow ring (`box-shadow` keyframe, 2s linear infinite)
- **Logo playing:** full rotation (`rotate(360deg)`, 10s linear infinite)
- **Animated Z logo:** SVG clip-path wipe animation — three stripes reveal left-to-right then disappear (3s ease infinite, staggered 0.25s per stripe)
- **Button hover:** `scale(1.05)`, `0.2s ease`
- **Player expand:** `0.3s ease-in-out` width transition, overflow hidden → visible
- **Song playing state:** text-shadow pulsing glow (4s alternate infinite)
- **No bouncy/spring animations** — all easing is `ease` or `ease-in-out`. Subtle and smooth.

### Hover & Press States
- **Hover:** `scale(1.05)` on buttons and interactive elements (not color change)
- **Hover on list items:** `background: rgba(119,137,145,0.2)` — very subtle tinted overlay
- **Hover on chips:** `background: var(--secondary-bg-color)` — darkens slightly
- **Cursor:** `pointer` on all interactive elements
- **Press/active states:** Not explicitly defined (no `:active` transforms found)
- **Disabled:** `cursor: not-allowed`, muted pink color

### Layout
- **Fixed elements:** Header (top, 6vh), Player (bottom center, 7vh up)
- **Main content:** centered carousel of section cards, 45vw wide each, with snap scrolling
- **Carousel:** horizontal scroll-snap, no scrollbar, center-snapped items
- **No sidebar** — navigation is minimal: logo → home, user widget top-right
- **Responsive:** TODO comment in code — not yet responsive for different screen sizes

### Backgrounds & Imagery
- **No background images or textures** — pure black
- **No full-bleed photos**
- **No illustrations** beyond the animated Z logo SVG
- **No gradients on layout surfaces** — gradient only on animated text

### Iconography
See ICONOGRAPHY section below.

### Use of Transparency/Blur
- Song hover: `rgba(119,137,145,0.2)` — subtle transparent overlay
- No backdrop-filter/blur found
- Player progress track and glows use rgba transparency for fades

### Corner Radii
- `1em` — cards, inputs, toasts, section borders
- `15em` — pill buttons (auth buttons, chips)
- `6em` — player container (rounded pill)
- `16em` — logo button (circle)
- `5px` — play/pause button wrapper (slight rounding)
- `15px` — progress bar, volume slider tracks

---

## ICONOGRAPHY

### Approach
- **Custom SVG components** for all icons — no external icon library.
- Icons are React components (`.tsx`) with inline SVG or CSS animations.
- No emoji used as icons.
- No unicode chars used as icons.
- No icon font (despite the Google Fonts import referencing `family=Comfortaa` — the `icon` param was likely a copy/paste artifact; no Material Icons used).

### Icon Inventory
| Asset | File | Usage |
|---|---|---|
| Animated Z Logo | `assets/logo.svg` | App logo, header, player button |
| Telegram Logo (PNG) | `assets/TgLogo.png` | Telegram auth button |
| Pen / Edit | `assets/pen.svg` | Edit action |
| Bin / Delete | `src/assets/Bin.tsx` (custom) | Delete action |
| More Dots | `src/assets/MoreDots.tsx` (custom) | Context menu trigger |
| Shuffle Arrows | `src/assets/player/ShuffleArrows.tsx` | Shuffle toggle in player |
| Play/Pause | `src/components/player/buttons/PlayPauseButton.tsx` | Player control |
| Track Rewind | `src/components/player/buttons/TrackRewindButton.tsx` | Skip back/forward |

### Substitutions
- The Google Fonts URL in index.css uses `?family=Comfortaa` — this only loads the text font. No icon font is present.

---

## FILE INDEX

```
/
├── README.md                   — This file
├── colors_and_type.css         — All CSS variables + type styles
├── assets/
│   ├── logo.svg                — Brand logo (pink circle, Z mark)
│   ├── TgLogo.png              — Telegram logo
│   ├── pen.svg                 — Edit icon
│   └── AnimatedZ.css           — Animated Z logo keyframes
├── preview/
│   ├── colors-brand.html       — Brand color swatches
│   ├── colors-semantic.html    — Semantic color tokens
│   ├── type-scale.html         — Typography scale
│   ├── type-specimens.html     — Type specimens
│   ├── spacing-tokens.html     — Spacing + radius tokens
│   ├── shadows-animations.html — Shadows + animation tokens
│   ├── components-buttons.html — Button variants
│   ├── components-inputs.html  — Input + chip components
│   ├── components-player.html  — Music player component
│   ├── components-song.html    — Song list item
│   ├── components-toast.html   — Toast notifications
│   └── brand-logo.html         — Logo variants
└── ui_kits/
    └── web_app/
        ├── README.md           — UI kit overview
        └── index.html          — Interactive web app prototype
```

---

## UI KITS
- **Web App** (`ui_kits/web_app/`): Interactive click-thru prototype of the Zpotify web app. Covers init/login page, home page with playlist segments, and music player.
