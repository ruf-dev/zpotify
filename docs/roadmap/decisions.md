# Roadmap — strategic decisions

Captured decisions that shape the product direction. Reference before adding features.

---

## Core philosophy
zpotify is a **musician library**, not a content delivery platform. The organizing unit is the *album as an artistic statement*, not a flat pile of releases. This is the core differentiation from Spotify.

## Domain decisions

**Albums are playlists.**
An album's tracklist IS a playlist. The `albums` table holds metadata (title, year, type, cover). The `playlist_id` FK points to the tracklist. Album versions each get their own playlist. No separate join table.

**Album types are strictly separated in the UI.**
Artist discography tabs: Albums · Singles & EPs · Live · Compilations. Never mixed. Type is an ENUM on the `albums` table: `LP / EP / Single / Live / Compilation / Soundtrack`.

**Album versions live inside the album.**
A Deluxe or Remaster is not a separate album — it's a version. Version switcher on the album page swaps the tracklist in place. Each version has its own playlist.

**Physical file deduplication.**
One audio file on disk = one `files_meta` row (keyed by SHA-256 hash). Multiple `songs` rows can point to the same file — for cases where metadata differs but audio is identical (e.g. same recording on two albums).

**Song metadata variants.**
If two versions of a song differ only in metadata (title, artist credits, track number), they are two `songs` rows pointing to one `files_meta`. If they differ in audio — two files, two rows.

## Release strategy

| Phase | Target | Audience |
|---|---|---|
| M0 "It Works" | ~May 9 | Author only — daily use begins |
| M1 "The Library" | ~May 30 | Author only — core model complete |
| M2 "Alpha" | ~June 20 | Closed circle: friends & family |
| M3 "Public Prep" | ~July 2 | Public repo with narrative, admin tooling |

## Deferred (not before beta)
- Native mobile app
- Bulk folder / discography import
- Recommendations / ML features
- Social layer
