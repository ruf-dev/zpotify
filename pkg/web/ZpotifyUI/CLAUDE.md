## Exploration Rules

- Do NOT scan the full project
- Read only files directly relevant to the specific task
- Ask me which file to edit if uncertain — don't explore to find out
- Never read more than 3 files before acting

## Stack

- React 18 + TypeScript, Vite, react-router-dom v7
- State: **Zustand** (preferred over hookstate for new code)
- Styling: **CSS Modules** (`.module.css`)
- Animations & transitions: CSS first — use `framer-motion` only when CSS cannot achieve the effect
- Backend: gRPC-web via generated clients in `src/app/api/`

## Architecture — Feature Slice Design

Layers ordered high → low. A layer may only import from layers **below** it — never upward.

```
pages / dialogs  →  widgets  →  features  →  entities  →  components  →  shared  →  app
```

| Layer | Path | Description |
|---|---|---|
| **pages / dialogs** | `src/pages/`, `src/dialogs/` | Route targets and modal screens. No reuse expected. |
| **widgets** | `src/widgets/` | Self-contained units with business logic. Composed into pages. |
| **features** | `src/features/` | User-facing feature slices (e.g. `auth`, `upload`). |
| **entities** | `src/entities/` | Domain objects and their state (e.g. `song`, `user`). |
| **components** | `src/components/` | Pure UI atoms — no business logic, no store access. |
| **shared** | `src/shared/` | Cross-cutting code: `ui/`, `model/`, `lib/`, `api/`. Importable from any layer. |
| **app** | `src/app/` | App wiring: routing, layouts, generated gRPC clients (`src/app/api/`), global hooks. Importable from any layer. |

### Naming conventions

- `entities/{name}/` — lowercase singular (`song`, `user`)
- `features/{name}/` — lowercase (`auth`, `upload`)
- `widgets/{Name}/` — PascalCase (`MusicPlayer`, `Header`)
- `pages/{name}/` — lowercase route name (`home`, `playlist`)
- `dialogs/{Name}/` — PascalCase (`EditTrack`, `MultitrackUpload`)
- `shared/` segments are fixed: `ui/`, `model/`, `lib/`, `api/`

### Internal slice structure

- Pair each component file with its `.module.css`/`.module.scss` in the same folder.
- Place hooks in the same folder as the entity/widget they belong to (e.g. `entities/user/useUser.ts`).
- Group tightly-coupled subcomponents into named subfolders (e.g. `widgets/MusicPlayer/buttons/`).
- No mandatory `ui/`, `model/`, `lib/` segments inside a slice — add them only when grouping is needed.

### Local components pattern

Any slice (page, widget, dialog, feature) may have a `components/` subfolder for atomic UI that is **only used within that slice** and not intended for reuse elsewhere. Each local component lives in its own named subfolder with a paired `.module.css`:

```
pages/segments/SidebarSegment/
├── SidebarSegment.tsx
├── SidebarSegment.module.css
└── components/
    ├── LogoRow/
    │   ├── LogoRow.tsx
    │   └── LogoRow.module.css
    ├── NavItem/
    │   ├── NavItem.tsx
    │   └── NavItem.module.css
    └── UserPill/
        ├── UserPill.tsx
        └── UserPill.module.css
```

- Each component has its own folder — never flat files directly in `components/`.
- Each folder contains exactly one component file and its paired `.module.css`.
- CSS classes belong in the component's own `.module.css`, not the parent's.
- The parent's `.module.css` keeps only layout/container classes used directly in the parent JSX.

### Large widget pattern (tabbed / multi-screen)

Use this structure when a widget has multiple top-level views (tabs, steps, sections):

```
widgets/{Name}/
├── {Name}Widget.tsx          # root: owns nav state, renders sidebar + content area
├── {Name}Widget.module.css   # root styles + shared layout classes used by screens
├── components/               # widget-private UI atoms reused across screens
│   └── {ComponentName}/
│       ├── {ComponentName}.tsx
│       └── {ComponentName}.module.css
└── screens/                  # one component per tab/view
    └── {TabName}Screen/
        └── {TabName}Screen.tsx
```

Rules:
- Root widget owns tab selection state (`useState`) and renders the nav + content shell. No business logic.
- Define tabs as a typed constant array at module level (`const TABS: Tab[] = [...]`), not inline JSX.
- Export types co-located with the component that defines them (e.g. `Tab` exported from `SettingsTabButton.tsx`).
- Screens are self-contained: they call entity hooks directly (`useUISettings()`) — no prop-drilling from root.
- Screens import shared layout classes from the root widget's `.module.css` (e.g. `cls.SettingsGroup`); no separate CSS file needed per screen unless it has unique styles.
- `components/` holds layout primitives shared by multiple screens (e.g. `SettingsRow`: label + description + `children` slot).
- This same `screens/` convention applies to `dialogs/` (multi-step modal flows).

### Local widget pattern

A **local widget** is a self-contained component with its own data fetching that belongs exclusively to one parent slice (page, segment, dialog). It lives in a `Widget/` subfolder next to the parent, not in the global `src/widgets/`:

```
pages/segments/SidebarSegment/
├── SidebarSegment.tsx
├── Widget/
│   └── SidebarArtistsWidget/
│       ├── SidebarArtistsWidget.tsx
│       └── SidebarArtistsWidget.module.css
└── components/
    └── ArtistRow/
```

- Use `components/` for pure UI atoms (no business logic, no API calls).
- Use `Widget/` for units that own their own data fetching but are not reused outside the parent slice.
- If a widget needs to be reused across slices, move it to `src/widgets/`.

### Barrel / index.ts

- Do **not** create `index.ts` barrel files for slices. Always import by full file path.
- Barrel files are allowed only at `src/app/api/` (generated gRPC client re-exports).

### Export conventions

- Components: **default export**
- Utilities, types, hooks: **named exports**

## Styling Rules

- Always use CSS Modules — no inline styles, no `styled-components` for new code
- Use CSS nesting for child selectors inside a module
- All colors, borders, spacing tokens, sizes come from global CSS variables defined in `src/colors_and_type.css`:
    - Brand colors: `--color-fg-primary`, `--color-fg-secondary`, `--color-fg-tertiary`, `--color-fg-accent`,
      `--color-fg-disabled`
    - Backgrounds: `--color-bg-base`, `--color-bg-secondary`, `--color-bg-accent`
    - Borders: `--color-border`, `--color-border-light`
    - Status: `--color-error`, `--color-warning`, `--color-info`
- Do NOT write px, em and other in styling files or components directly. Use variables instead. Variable should be located at src/sizes.css
- Never hardcode color hex values in component CSS — always reference a variable
- Prefer CSS `transition`, `animation`, and `@keyframes` over JS-driven animation
- Root style for component should have suffix `Container`
- Classes that wraps some components should have suffix `Wrapper`
- Do NOT use `!important` `z-index`
- Use rem units for font sizes and spacing

## Where things live

| What | Path | Rule |
|---|---|---|
| SVG icons (React components) | `src/assets/icons/` | One file per icon, named export, no business logic. Never inline SVG in a component file. |
| Static assets (`.svg`, `.png`, brand logos) | `src/assets/` | Raw files only — no `.tsx` here unless it's an icon component in `icons/`. |
| Pure UI atoms | `src/components/` | No store access, no API calls. Each in its own named subdirectory with paired `.module.css`. |
| Domain objects + state | `src/entities/` | Zustand stores, types, and hooks scoped to one domain entity. |
| User-facing feature slices | `src/features/` | Encapsulates one user action end-to-end (e.g. `auth`, `upload`). |
| Composed business widgets | `src/widgets/` | Combines components + entities + features. No page-routing logic. |
| Route screens | `src/pages/` | One file per route. Composes widgets; no raw UI atoms. |
| Modal flows | `src/dialogs/` | Multi-step dialogs only. Each screen in a `screens/` subfolder. |
| Cross-cutting utilities | `src/shared/` | `ui/`, `model/`, `lib/`, `api/` segments only. No domain knowledge. |
| App wiring | `src/app/` | Routing, layouts, generated gRPC clients, global hooks. |

## Coding rules
- Components should be a named functions - not a const arrow functions
- All functions inside components (handlers, helpers) must also be named function declarations — never `const fn = () => {}`
- One file – one component.
- Always use `cn()` from `classnames` for combining CSS class names — never template literals (e.g. `cn(cls.Foo, isActive && cls.Active)`, not `` `${cls.Foo} ${cls.Active}` ``).
- For dialog should only use global Dialog via useDialog hook. Import it from `@/app/hooks/Dialog.tsx`
- Dialog screens (multi-step modal views) must live in a `screens/` subfolder inside the dialog directory (e.g. `src/dialogs/AddTrack/screens/ChooseScreen.tsx`). The root dialog file imports from `screens/`.


## Path Alias

`@/` resolves to `src/` — use it for all imports (e.g. `@/components/base/Button`).

## Commands

```bash
bun run build     # tsc + vite build
bun lint         # ESLint
bun gen # Generate proto contract 
```
