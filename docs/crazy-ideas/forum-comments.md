# 💬 Forum Comments on Tracks / Albums / Playlists

**Status:** Crazy idea, not on roadmap  
**Dropped:** 2026-04-24

---

## The idea

Every track, album, and playlist gets a comment thread — like a mini forum attached to the music. Users can post thoughts, reactions, timestamps ("this drop at 1:32 🔥"), lore, hot takes. Think YouTube comments meets RateYourMusic meets old-school last.fm shoutboxes.

---

## Why it's interesting

- Turns zpotify from a passive player into a social layer around music
- Albums especially could have rich discussion — liner notes, hidden meanings, debate about track order
- Playlist comments could be collaborative annotation ("why did you put this after that?")
- Timestamp comments on tracks are genuinely novel for a self-hosted app

---

## Rough shape (if it were ever built)

### Data model
- `comments` table: `id`, `author_id`, `entity_type` (track/album/playlist), `entity_id`, `parent_id` (for threading), `body`, `created_at`, `edited_at`, `deleted_at`
- Soft delete only
- Threading: one level deep (reply to top-level comment) or full recursive — TBD
- Timestamp anchors: optional `track_position_ms` field for per-second comments on tracks

### API
- New `CommentService` in proto: `PostComment`, `DeleteComment`, `ListComments`, `EditComment`
- Paginated by cursor, sorted by `created_at` desc or threaded

### Frontend
- Comment panel slides in from the right or lives below the entity header
- Collapsible, doesn't block playback
- Markdown-lite input (bold, italic, links — no HTML)

### Permissions
- Any authenticated user can comment
- Author can edit/delete own comments
- Admins can hard-delete
- Could gate behind a new `can_comment` permission flag to keep it opt-in per-user

---

## Open questions / why it might stay crazy

- Moderation story is zero right now — who cleans up spam?
- Self-hosted instances: comment volume is tiny, so is the feature worth the surface area?
- Could become a vector for abuse on shared instances
- Real-time updates (new comments appearing live) would need WebSockets or SSE — new infra
- Search across comments adds complexity

---

## If this ever graduates

Tag it `social` and open a proper scoping session before touching the backlog.
