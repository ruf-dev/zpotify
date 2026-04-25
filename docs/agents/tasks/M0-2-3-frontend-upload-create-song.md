# Task Brief — M0-2 + M0-3 · Upload flow + Create song (frontend)

**Area:** frontend
**Priority:** high
**Goal:** Wire the already-designed upload UI to the real backend: file picker → upload → progress → Create Song form pre-filled with filename and file_id, calling `SongAPI.CreateSong`.

> Covers M0-2 (upload widget) and M0-3 (create song form) as one cohesive frontend slice — they share state and are shipped together.

---

## Scope

**Files to touch:**
- `src/processes/upload/UploadProcess.ts` (new) — HTTP multipart upload call
- `src/processes/song/SongProcess.ts` (new or extend existing) — `createSong` gRPC call via `SongAPI`
- `src/processes/artist/ArtistProcess.ts` (new or extend) — `listArtists` call for the artist multi-select
- `src/widgets/upload/` (existing design files) — connect to process, add progress state
- `src/widgets/create-song/CreateSongWidget.tsx` (new) — form: title, artist multi-select, file_id hidden
- `src/widgets/create-song/CreateSongWidget.module.css` (new)
- `src/dialogs/create-song/CreateSongDialog.tsx` (new) — wraps widget in `useDialog`
- `src/pages/upload/UploadPage.tsx` (new or extend) — page composition
- `src/model/song.ts` (new or extend) — `CreateSongRequest` type

**Do NOT touch:**
- `pkg/web/@zpotify/api/` — generated TS, never hand-edit
- Any generated proto client files
- Any file not listed above

---

## Implementation steps

### 1. Upload process (`src/processes/upload/UploadProcess.ts`)
- Extend `BaseService`
- Method `uploadAudio(file: File, onProgress: (pct: number) => void): Promise<number>` (returns `file_id`)
- Use `XMLHttpRequest` (not `fetch`) so `onprogress` fires reliably
- POST to `/api/upload/audio` as `multipart/form-data`, field name `file`
- Inject auth token from BaseService token mechanism (match existing process pattern)
- Parse response JSON: `{ file_id: number }`

### 2. Wire upload widget to process
- The existing design widget already has a file picker and progress bar
- Connect: on file select → call `UploadProcess.uploadAudio` → update progress state → on resolve store `file_id` in local state → open Create Song dialog via `useDialog`
- Use Zustand store for `uploadState` if the state is needed outside the widget; local `useState` is fine if it's widget-only
- Progress bar reads from the `onProgress` callback, stored as `number` (0–100)

### 3. Artist process (`src/processes/artist/ArtistProcess.ts`)
- `listArtists(): Promise<ArtistBase[]>` — calls `ArtistsAPI.ListArtists` gRPC method
- Returns array of `{ id: string, name: string }` mapped from proto response

### 4. Create Song form widget (`src/widgets/create-song/CreateSongWidget.tsx`)
- Props: `fileId: number`, `suggestedTitle: string` (pre-filled from filename, stripped of extension)
- Fields:
  - Title — text input, pre-filled with `suggestedTitle`
  - Artists — multi-select: fetches artist list on mount via `ArtistProcess`; supports type-to-filter; "Create new artist" option that submits just the name (for now: show a text field that accepts freetext artist name; creating a new artist record is out of scope — pass artist name as-is if no ID match, service will handle or return error)
  - Submit button — calls `SongProcess.createSong`
- On success: close dialog, optionally show toast (if toast system exists; skip if not)
- One file = one component rule — artist multi-select can be its own component file if complex

### 5. Create Song process (`src/processes/song/SongProcess.ts`)
- `createSong(req: CreateSongRequest): Promise<void>` — calls `SongAPI.CreateSong` gRPC RPC
- `CreateSongRequest` type in `src/model/song.ts`: `{ title: string; fileId: number; artistNames: string[] }`

### 6. Dialog (`src/dialogs/create-song/CreateSongDialog.tsx`)
- Open only via `useDialog` hook from `@/app/hooks/Dialog.tsx`
- Passes `fileId` and `suggestedTitle` as dialog params
- Renders `CreateSongWidget` inside standard dialog shell

### 7. Wire into Upload page
- After upload completes, call `openDialog('create-song', { fileId, suggestedTitle })` 
- Upload page itself stays simple — file picker + progress, no form logic

---

## Patterns to follow

- gRPC calls only in `src/processes/` — `XMLHttpRequest` for the upload HTTP call also lives here, not in the widget
- CSS Modules only — no inline styles; all colors/sizes via CSS variables
- Named functions: `function UploadProcess` not `const UploadProcess = () =>`
- One file, one component — artist multi-select gets its own file if it has internal state
- Dialogs via `useDialog` only — never mount dialog conditionally in JSX
- Zustand for shared state; local `useState` for widget-only state (progress is widget-local)
- `@/` alias always, no `../../` climbing

---

## Acceptance criteria

- [ ] File picker opens, user selects audio file, progress bar advances to 100%
- [ ] On upload success, Create Song dialog opens pre-filled with filename as title
- [ ] Artist multi-select populates from backend artist list
- [ ] Submitting the form calls `SongAPI.CreateSong` with correct payload
- [ ] Dialog closes on success
- [ ] No gRPC or fetch calls from widget or component files
- [ ] `npm run build:ui` passes with no type errors
- [ ] No hardcoded hex or px values
- [ ] No inline styles

---

## Context files to inject

- `CLAUDE.md` (frontend root)
- `src/processes/` — read one existing process for BaseService pattern
- `src/app/hooks/Dialog.tsx` — useDialog API
- `pkg/web/@zpotify/api/` — generated SongAPI + ArtistsAPI clients (read-only reference)
- `src/widgets/upload/` — existing design files to extend
