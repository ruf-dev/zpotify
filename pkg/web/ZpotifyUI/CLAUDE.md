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

Layer hierarchy (lower = more primitive, cannot import from higher):

| Layer               | Path                         | Rule                                                                                                               |
|---------------------|------------------------------|--------------------------------------------------------------------------------------------------------------------|
| **pages / dialogs** | `src/pages/`, `src/dialogs/` | Top-level route targets and modal screens. No reuse expected.                                                      |
| **widgets**         | `src/widgets/`               | Self-contained units with business logic (e.g. login widget, player bar). Can be composed into pages.              |
| **components**      | `src/components/`            | Pure UI atoms — buttons, inputs, cards. No business logic, no direct store access.                                 |
| **processes**       | `src/processes/`             | All backend communication. Every gRPC call must go through here, never called directly from components or widgets. |
| **hooks**           | `src/hooks/`                 | Shared React hooks.                                                                                                |
| **model**           | `src/model/`                 | Shared TypeScript types and domain models.                                                                         |
| **app**             | `src/app/`                   | App wiring: routing, generated API clients (`src/app/api/`), layouts.                                              |

**Bigger component = higher in the hierarchy.** A widget can import components; a page can import widgets and
components; nothing imports from pages.

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

## Coding rules
- Components should be a named functions - not a const arrow functions
- One file – one component.
- Icons and minor components should be located at `src/assets/icons`
- For dialog should only use global Dialog via useDialog hook. Import it from `@/app/hooks/Dialog.tsx`
- Dialog screens (multi-step modal views) must live in a `screens/` subfolder inside the dialog directory (e.g. `src/dialogs/AddTrack/screens/ChooseScreen.tsx`). The root dialog file imports from `screens/`.


## Path Alias

`@/` resolves to `src/` — use it for all imports (e.g. `@/components/base/Button`).

## Commands

```bash
npm run dev          # Vite dev server
npm run build:ui     # tsc + vite build
npm run lint         # ESLint
```
