# Zpotify Web App — UI Kit

## Overview
Interactive click-thru prototype of the Zpotify web app. Covers:
- **Init / Login page** — logo, auth methods (password + Telegram)
- **Home page** — fixed header, carousel of playlist/management sections
- **Music player** — expanding pill player at bottom center

## Design Width
1280px (desktop web, no mobile breakpoints in source)

## Key Screens
1. Init page (login) — centered, logo + auth buttons
2. Home page — header + two-column carousel + player
3. Player expanded state — pill expands with controls + progress

## Components
- `ZLogo` — animated Z logo (pulsing / spinning)
- `Header` — fixed top bar with logo + user widget
- `AuthPage` — init/login screen
- `HomePage` — main playlist view
- `Player` — expanding pill music player
- `SongList` — scrollable track list
- `Toast` — notification system
