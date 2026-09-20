## Dialog sizing

Large/scrollable dialogs (AddTrack, MultitrackUpload, TorrentManage) use shared size tokens from
`src/sizes.css`:

- `--dialog-max-height-desktop` — `calc(100vh - 2.5rem)`, landscape.
- `--dialog-max-height-mobile` / `--dialog-max-width-mobile` — `85dvh` / `95vw`, hard-set (both
  `height` and `max-height`) inside each dialog's `@media (orientation: portrait)` block. `dvh`,
  not `vh` — stays correct as mobile browser chrome shows/hides.

When touching a dialog's root `Container` class: if it has no `max-height` at all, or a portrait
block that only caps `width`, it's missing this and will overflow the viewport on mobile — wire
it to these tokens instead of a one-off value.
