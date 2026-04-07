# ZpotifyUI Development Manifesto

## Tech Stack & Architecture
- **Framework**: React 18+ with TypeScript.
- **Build Tool**: Vite for fast development and bundling.
- **State Management**: Zustand and @hookstate/core.
- **Styling**: CSS Modules, Sass, and styled-components.
- **Animations**: Framer Motion.
- **Communication**: gRPC-web and Protobuf (`src/app/api/zpotify`).
- **Structure**:
  - `src/app`: Core application logic, routing, and API integration.
  - `src/components`: UI components organized by feature (auth, player, song, etc.).
  - `src/model`: Domain data models and TypeScript types.
  - `src/processes`: Service-like logic handling business rules and API interactions.
  - `src/pages`: Top-level page components.

## Development Principles
- **Type Safety**: Maintain strict TypeScript typing. Avoid `any` at all costs.
- **Component Design**: Use functional components with hooks. Prefer modular CSS (CSS Modules) for styles.
- **API Integration**: All backend communication should go through the generated gRPC clients in `src/app/api/zpotify`. Do not modify `.pb.ts` files manually as they are generated.
- **State Flow**: Use Zustand for global state and Hookstate for complex local state. Ensure state transitions are predictable and observable.
- **Consistency**: Follow the existing naming convention (e.g., `ComponentName.tsx` and `ComponentName.module.css` in the same folder).

## AI Assistant Guidelines
- **Context Awareness**: When modifying components, respect the existing animation patterns (Framer Motion) and UI layout.
- **Error Handling**: Follow the patterns in `src/processes/Errors.ts` and `src/components/notifications`.
- **Imports**: Use absolute paths (e.g., `@/components/...`) where configured in `vite.config.ts` or `tsconfig.json`.
- **Performance**: Be mindful of re-renders, especially in the music player and song lists.
- **Documentation**: Keep comments meaningful and follow the project's existing frequency.

## Styling
- **Imports**: imported files and packages should go in the following order separated with one extra line
  - external libraries (`react`, `classnames` and etc)
  - local style files (`@/componenents/Button.module.css`). Alias for style file is always cls
  - local TypeScript files 
  - local TSX files (components)
