#!/bin/bash
# Stop hook (see .claude/settings.local.json): when the zpotify service is already running and
# source changed since it was last (re)started, rebuild what the running mode needs and restart it.
#   desktop (Vite on :15173): the UI hot-reloads, so only Go/config changes restart it.
#   rc (no Vite):            the UI bundle is embedded, so any Go/config/UI change rebuilds and restarts.
# Never starts a service that is not running -- first start stays an explicit choice.
# `--stamp` records the current source fingerprint; the Makefile serve targets call it on launch.
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$ROOT" || exit 0

STAMP=.claude/hooks/serve.stamp
LOG=.claude/hooks/serve.log
LOCK=.claude/hooks/serve.restart.lock
UI_DIR=pkg/client/ZpotifyUI

fingerprint_go() {
	{
		git ls-files -z -co --exclude-standard -- '*.go' go.mod go.sum migrations \
			| grep -zv '_test\.go$' | grep -zv '^tests/' | tr '\0' '\n'
		echo config/dev.yaml
		echo config/config.yaml
	} | xargs shasum 2>/dev/null | shasum | cut -d' ' -f1
}

fingerprint_ui() {
	git ls-files -z -co --exclude-standard -- "$UI_DIR/src" "$UI_DIR/public" "$UI_DIR/index.html" \
		"$UI_DIR/package.json" "$UI_DIR/vite.config.ts" \
		| grep -zv '\.test\.tsx\?$' | tr '\0' '\n' | xargs shasum 2>/dev/null | shasum | cut -d' ' -f1
}

write_stamp() {
	printf 'go=%s\nui=%s\n' "$1" "$2" >"$STAMP"
}

# Only processes started from this repo: other projects' dev servers must never be touched.
listeners() {
	local pid cwd
	for pid in $(lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null); do
		cwd=$(lsof -p "$pid" -a -d cwd -Fn 2>/dev/null | sed -n 's/^n//p')
		case "$cwd" in
		"$ROOT" | "$ROOT"/*) echo "$pid" ;;
		esac
	done
}

GO_FP=$(fingerprint_go)
UI_FP=$(fingerprint_ui)

if [ "${1:-}" = "--stamp" ]; then
	write_stamp "$GO_FP" "$UI_FP"
	exit 0
fi

[ -n "$(listeners 8087)" ] || exit 0

if [ ! -f "$STAMP" ]; then
	write_stamp "$GO_FP" "$UI_FP"
	exit 0
fi

SAVED_GO=$(sed -n 's/^go=//p' "$STAMP")
SAVED_UI=$(sed -n 's/^ui=//p' "$STAMP")

if [ -n "$(listeners 15173)" ]; then
	TARGET=serve
	[ "$GO_FP" != "$SAVED_GO" ] || exit 0
else
	TARGET=serve-rc
	[ "$GO_FP" != "$SAVED_GO" ] || [ "$UI_FP" != "$SAVED_UI" ] || exit 0
fi

mkdir "$LOCK" 2>/dev/null || exit 0
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

write_stamp "$GO_FP" "$UI_FP"

for PORT in 8087 15173; do
	for PID in $(listeners "$PORT"); do
		kill "$PID" 2>/dev/null
	done
done

for _ in $(seq 1 20); do
	[ -z "$(listeners 8087)$(listeners 15173)" ] && break
	sleep 0.5
done

printf '\n--- %s: rebuild + restart (make %s) ---\n' "$(date '+%F %T')" "$TARGET" >>"$LOG"
nohup make "$TARGET" >>"$LOG" 2>&1 </dev/null &
disown
exit 0
