# Handoff: Trello-style Track Reorder

## Overview

This handoff documents **only one feature**: the drag-to-reorder interaction for tracks inside the Multitrack Upload modal. The rest of the modal (layout, fields, artist chips, cover, footer, validation) is already implemented in the production app — do not re-implement those.

The goal is to replace the current drag-reorder behavior (which uses native HTML5 drag-and-drop and produces a flat, default browser drag-ghost) with a custom pointer-driven interaction that feels like dragging a card in **Trello**:

1. Press-and-hold on a drag handle → the row **lifts off the surface** with a slight tilt, scale-up, and a tall pink-tinted shadow.
2. While dragging → other rows **slide smoothly out of the way** to open a slot at the pointer's current row index.
3. Release → the lifted card **eases into its new slot** with a slight overshoot, then the data model is committed.

## About the design files

The files in this bundle are **HTML/React design references** built with inline JSX and Babel-standalone. They are **not** production code to copy verbatim. The task is to recreate this drag interaction inside the existing Zpotify codebase (Vite + React + TypeScript, at `pkg/web/ZpotifyUI/`) using its established patterns. Treat the JSX in `modal.jsx` / `parts.jsx` as a specification of behavior, structure, and visual treatment — port the logic into idiomatic TS components in the real repo.

## Fidelity

**High-fidelity.** All measurements, easing curves, durations, and color tokens below are the intended production values. Match them exactly. Where a Zpotify CSS custom property exists (see "Design tokens" below), use the token — do not hardcode the literal hex/rgba.

## Scope: what's in, what's out

**In scope (this handoff):**
- Pointer-driven reorder on `TrackRow` inside the upload modal.
- The lift / tilt / shadow / glow treatment on the row being dragged.
- The smooth translate-to-make-room behavior on the other rows.
- The settle-into-slot animation on release, then commit to the tracks array.
- Disabling hover affordances on non-dragged rows while a drag is active.
- Restoring the resting card surface (`var(--bg-card)` background, subtle resting shadow) so the lift reads against something.

**Out of scope:**
- The modal shell, header, footer, submit button, playlist-mode toggle, cover field, playlist-name input, artist chip field, dropdowns, validation copy, toasts. All already shipped.
- Reorder of artist chips inside `ArtistChipsField` — keep its existing HTML5 DnD; it is not in this redesign.
- Keyboard reorder, screen-reader announcements, touch-long-press gestures beyond the basic pointer-events coverage that `pointerdown`/`pointermove`/`pointerup` give you. (Worth adding later, but not part of this ticket.)

## Interaction spec

### Pointer down — start drag

- Listen on the row's **drag handle only** (the six-dot grip on the left of the row). Not the whole row — the row contains an editable title and an artist field that need their own pointer events.
- On `pointerdown` (left button / primary pointer):
  - Measure the row's bounding rect.
  - Cache `height = rect.height + gap` where `gap = 6px` (the `0.375rem` flex gap between rows in the list). This is the per-row displacement unit used to shift neighbors.
  - Record `startY = event.clientY`, `fromIdx`, `id`.
  - Set `drag = { id, fromIdx, startY, dy: 0, height, settling: false }` and `dropIdx = fromIdx`.
  - `event.preventDefault()` to suppress text selection. Optionally `setPointerCapture` on the handle.
- If a drag is already in flight (including in the "settling" phase), ignore further pointerdowns.

### Pointer move — track + snap neighbors

Attach `pointermove` to `window` (not the handle) so the user can drag freely outside the modal. On each move:

- Compute `dy = event.clientY - drag.startY` (raw, un-snapped — the lifted card follows the cursor smoothly).
- Compute the snap target: `delta = Math.round(dy / drag.height)`, then `dropIdx = clamp(fromIdx + delta, 0, tracks.length - 1)`.
- Update both pieces of state. The lifted row uses raw `dy`; everyone else snaps to `dropIdx`.

### Pointer up — settle + commit

- Compute `targetDy = (dropIdx - fromIdx) * drag.height`.
- Set `drag.dy = targetDy` and `drag.settling = true` in the same render. The dragged row now has a transition active and will animate from its current `dy` to `targetDy`.
- After **230ms** (the settle duration), commit: splice the track from `fromIdx` to `dropIdx` in the array, then clear `drag` and `dropIdx`. On the next render the row is at its new index and its transform is back to identity — visually continuous because the displaced neighbors had already snapped to the same final slot.
- Also handle `pointercancel` the same as `pointerup`.

### Drag-style math (per row)

Given `drag`, `dropIdx`, and the row's own `idx`:

```
if (idx === drag.fromIdx) {
  // The lifted card — follows pointer
  transform: translateY({drag.dy}px) rotate(2.2deg) scale(1.025)
  boxShadow: 0 18px 40px rgba(0,0,0,0.7),
             0 0 0 1px var(--pink-border),
             0 0 32px var(--pink-shadow)
  background: var(--bg-elevated)
  borderColor: var(--pink-border)
  zIndex: 20
  cursor: grabbing
  transition: settling
    ? transform 0.23s cubic-bezier(0.2, 0.9, 0.3, 1.2),
      box-shadow 0.23s ease,
      border-color 0.23s ease
    : box-shadow 0.15s ease,
      border-color 0.15s ease
  willChange: transform
}
else if (drag.fromIdx < dropIdx && idx > drag.fromIdx && idx <= dropIdx) {
  // Below the source, within the drop range — shift up by one row
  transform: translateY(-{drag.height}px)
  transition: transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)
}
else if (drag.fromIdx > dropIdx && idx >= dropIdx && idx < drag.fromIdx) {
  // Above the source, within the drop range — shift down by one row
  transform: translateY({drag.height}px)
  transition: transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)
}
else {
  // Untouched
  transform: none
}
```

Notice the asymmetric easing: neighbors use a standard ease-out (`0.2, 0.8, 0.2, 1`) so they glide into place; the settling card uses a slight overshoot (`0.2, 0.9, 0.3, 1.2`) so the drop reads as a tactile "thunk."

## Visual treatment

### Resting card (no drag in progress)

Trello cards always look like physical cards — they need a surface to lift off of. Change the row's default style from transparent to a true card:

- `background: var(--bg-card)` (was `transparent`)
- `border: 1px solid var(--border-dim)`
- `box-shadow: 0 1px 0 rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.18)` — a subtle 1px nub of shadow so the lift has somewhere to come from
- On hover (only when no drag is in progress): `background: var(--bg-hover)`, `border-color: var(--border-mid)`
- `border-radius: var(--radius-md)` (1em-ish)

### Lifted card (the one being dragged)

- Tilt: `rotate(2.2deg)` — small enough not to look gimmicky, large enough to read as "this is detached"
- Scale: `scale(1.025)`
- Shadow stack (three layers, in order):
  1. `0 18px 40px rgba(0,0,0,0.7)` — the cast shadow
  2. `0 0 0 1px var(--pink-border)` — a hairline pink outline so the card edge stays defined against the now-blurred shadow
  3. `0 0 32px var(--pink-shadow)` — pink glow consistent with the rest of the brand's "this is the active thing" treatment
- Border color flips to `var(--pink-border)`
- Background lifts to `var(--bg-elevated)` (slightly brighter than `--bg-card`)
- `z-index: 20`
- Cursor on the handle: `grabbing`

### Neighbors during a drag

- No hover state — when `anyDragging` is true, the regular hover background should be suppressed so only the lifted card looks "active."
- Only `transform` and `transition` change. Background/border/shadow stay at their resting values.

### Handle

- Six-dot grip (existing `DragHandle` SVG).
- `cursor: grab` by default; `cursor: grabbing` while this row's drag is active.
- `touch-action: none` so mobile pointers don't trigger native scroll while dragging.
- Color: `var(--text-muted)` at rest, `var(--pink)` while this row is being dragged.

## State shape

```ts
type Drag = {
  id: string;       // track id being dragged (for matching across rerenders)
  fromIdx: number;  // index at drag start
  startY: number;   // event.clientY at pointerdown
  dy: number;       // current vertical offset (raw during move, snapped during settle)
  height: number;   // row height + gap, captured once at start
  settling: boolean;// true between pointerup and commit
} | null;

const [drag, setDrag]       = useState<Drag>(null);
const [dropIdx, setDropIdx] = useState<number | null>(null);
const dropIdxRef            = useRef<number | null>(null); // mirror for pointerup closure
const rowRefs               = useRef<Record<string, HTMLElement>>({});
```

`dropIdxRef` is needed because the `pointerup` handler is registered once per drag and would otherwise close over a stale `dropIdx`. Keep it in sync via an effect: `useEffect(() => { dropIdxRef.current = dropIdx; }, [dropIdx]);`

### Resetting on external changes

If the upstream tracks list changes for any reason (e.g. parent state replaces it), clear the drag state too — otherwise the captured `fromIdx` may point to a row that no longer exists. In the prototype this is wired as:

```jsx
useEffect(() => {
  setTracks(initialTracks);
  setDrag(null);
  setDropIdx(null);
}, [initialTracks]);
```

## Component API

The `TrackRow` props change as follows (this is the contract to match in TypeScript):

```ts
type TrackRowProps = {
  // ...existing props (track, num, onTitleChange, onArtistsChange, onRemove,
  //                   allArtists, onCreateArtist, lockedArtists)

  // NEW — replaces rowDragHandlers / isDragOver
  rowRef: (el: HTMLElement | null) => void;
  onHandlePointerDown: (e: React.PointerEvent) => void;
  dragStyle: React.CSSProperties | null;
  isDragging: boolean;   // this row is the lifted one
  anyDragging: boolean;  // some row in the list is being dragged
};
```

The parent (the modal) owns all drag state and passes pre-computed `dragStyle` per row. `TrackRow` itself is dumb — it merges `dragStyle` over its base style and wires `onHandlePointerDown` onto the handle.

## Design tokens

All values use existing Zpotify tokens from `components/tokens.css`. Do not invent new ones.

| Purpose | Token | Value |
|---|---|---|
| Lifted-card glow outline | `--pink-border` | `rgba(217,0,127,0.30)` |
| Lifted-card outer glow | `--pink-shadow` | `rgba(217,0,127,0.20)` |
| Lifted-card background | `--bg-elevated` | `#141414` |
| Resting card background | `--bg-card` | `#0d0d0d` |
| Resting card border | `--border-dim` | `rgba(255,255,255,0.06)` |
| Hover border | `--border-mid` | `rgba(255,255,255,0.11)` |
| Hover background | `--bg-hover` | `rgba(255,255,255,0.04)` |
| Card radius | `--radius-md` | `0.875em` |
| Handle color (active) | `--pink` | `#d9007f` |
| Handle color (idle) | `--text-muted` | `rgba(255,255,255,0.25)` |

**Non-tokenized values used here (one-off motion constants — fine to inline):**

- Tilt: `2.2deg`
- Scale: `1.025`
- Lifted shadow: `0 18px 40px rgba(0,0,0,0.7)`
- Resting shadow: `0 1px 0 rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.18)`
- Lifted glow blur: `32px`
- Neighbor-shift duration: `0.24s` with `cubic-bezier(0.2, 0.8, 0.2, 1)`
- Settle duration: `0.23s` with `cubic-bezier(0.2, 0.9, 0.3, 1.2)` (slight overshoot)
- Hover/border transition: `0.15s ease`
- Row gap (flex `gap`): `0.375rem` (~6px) — used as part of the per-row displacement unit
- Lifted `z-index: 20`

## Edge cases & gotchas

- **Stale closures.** Mirror `dropIdx` into a ref before the `pointerup` handler runs. Without this, the commit splices to the wrong index.
- **List length changes mid-drag.** Clamp `dropIdx` to `[0, tracks.length - 1]` on every move — if a parent removes a track while dragging, this prevents an out-of-range commit.
- **Clicks on input fields inside the row.** Don't put `onPointerDown` on the row container — only on the handle. The title and artist field need their own pointer events.
- **Modal scroll.** The modal body is scrollable. If you want auto-scroll-at-edge during drag (Trello does this), it's a follow-up — not in this ticket.
- **Touch.** `touch-action: none` on the handle is enough for the pointer-events model to capture touch drags on mobile WebKit/Blink. No separate `touchstart` listener needed.
- **`willChange: transform`** on both the lifted row and the displaced neighbors. Without it, Safari occasionally repaints the whole row mid-drag.
- **User-select.** Set `user-select: none` on the lifted row only while dragging — keep the rest of the row text-selectable at rest.
- **HTML5 DnD removal.** Remove `draggable`, `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd` from the row entirely. They will interfere with pointer-driven drag if left in.

## Reference files

- `Multitrack Upload.html` — entry point (full modal in context, with the live drag interaction).
- `multitrack/modal.jsx` — drag state machine, `getRowDragStyle`, `startDrag`, the `pointermove`/`pointerup` effect.
- `multitrack/parts.jsx` — `TrackRow` and `DragHandle`. Note the new `rowRef` / `onHandlePointerDown` / `dragStyle` / `anyDragging` props on `TrackRow`.

Search for the comment markers `Trello-style pointer drag` and `pointer-based reorder (Trello feel)` in `modal.jsx` to land on the relevant block, and `TrackRow` in `parts.jsx`.

## Acceptance criteria

A reviewer should be able to:

1. Mousedown on any row's grip and drag — the row lifts, tilts ~2°, gains a pink-glow shadow, and tracks the cursor smoothly.
2. As the cursor passes other rows' vertical midpoints, those rows translate up or down by one row-height with a 240ms ease.
3. Release at any point — the lifted card glides into the highlighted slot in ~230ms with a slight overshoot, then settles flat.
4. The underlying `tracks` array is reordered to match the visual result.
5. While a drag is in progress, hovering other rows does not change their background.
6. At rest, each row has a visible card surface (subtle background + 1px nub of shadow) so the lift has visual contrast.
7. Dragging works with mouse, trackpad, and touch (via pointer events).
