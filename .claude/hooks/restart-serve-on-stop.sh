#!/bin/bash
# Personal dev-loop hook (see .claude/settings.local.json Stop hook): rebuilds the UI and
# restarts `make serve` after a turn touches source, so the local instance (go service serving the
# embedded UI bundle) stays on current code without the developer restarting it by hand.
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT" || exit 0

MARKER=".claude/hooks/.last-serve-restart"
LOG=".claude/hooks/serve.log"

if [ -f "$MARKER" ]; then
	CHANGED=$(find . \( -name node_modules -o -name .git -o -name graphify-out -o -name dist -o -name worktrees \) -prune -o \
		\( -name '*.go' -o -name '*.ts' -o -name '*.tsx' -o -name '*.css' -o -name '*.sql' -o -name '*.proto' \) \
		-newer "$MARKER" -print 2>/dev/null | head -n 1)
else
	CHANGED="first-run"
fi

if [ -z "$CHANGED" ]; then
	exit 0
fi

PORT_PID=$(lsof -ti tcp:8087 2>/dev/null || true)
if [ -n "$PORT_PID" ]; then
	kill $PORT_PID 2>/dev/null || true
fi

touch "$MARKER"

nohup make serve >"$LOG" 2>&1 </dev/null &
SERVE_PID=$!
disown

caffeinate -d -u -w "$SERVE_PID" >/dev/null 2>&1 &
disown

exit 0
