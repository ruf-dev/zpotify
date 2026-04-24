# Stack — frontend

## Runtime & build

- **React 18** + **TypeScript ~5.8**
- **Vite 7** — build tool; outputs to `dist/`, embedded into Go binary
- **gRPC-web** — all API calls go via generated proto clients, not REST fetch

Build pipeline:
```
npm run build:ui  →  tsc + vite build → dist/
make build-ui     →  npm link + cp dist/ → internal/transport/web/
```
The Go binary embeds `internal/transport/web/dist` and serves it at `/`.

---

## Architecture pattern

Feature Slice Design — layers top to bottom:

| Layer | Role |
|---|---|
| `dialogs/` | Overlays, modals |
| `pages/` | Route targets |
| `widgets/` | Self-contained business units with state |
| `components/` | Pure UI atoms (no business logic) |
| `processes/` | All backend communication (gRPC-web calls) |
| `hooks/` | React custom hooks |
| `model/` | TypeScript domain types |
| `app/` | Routing, generated API clients |

---

## State management

- **Zustand** — preferred for all new code
- **Hookstate** (`@hookstate/core`) — legacy, still in use

---

## Key dependencies

| Purpose | Library |
|---|---|
| UI framework | React ^18.0.0 |
| Routing | react-router-dom ^7.6.3 |
| State (new) | zustand ^5.0.8 |
| State (legacy) | @hookstate/core ^4.0.2 |
| Animations | framer-motion ^12.23.24 |
| Reactive streams | rxjs ^7.8.2 |
| Styling | sass ^1.92.1 |

---

## Styling conventions

- **CSS Modules only** — no inline styles, no styled-components
- **No hardcoded hex or px** — use CSS variables from `colors_and_type.css` and `sizes.css`
- Root class: `*Container`; wrapper class: `*Wrapper`
- CSS nesting for child selectors

---

## Service call pattern

All process classes extend `BaseService` which handles:
- Token injection
- Auto-refresh on `UNAUTHENTICATED + ACCESS_TOKEN_EXPIRED`
- Retry logic
