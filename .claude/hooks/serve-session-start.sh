#!/bin/bash
# SessionStart hook (see .claude/settings.local.json): brings up `make serve` (build-ui + go
# service serving the embedded UI bundle) for the session.
#
#   - port 8087 free            -> start serve, silently
#   - port busy, source=startup -> emit additionalContext telling Claude to ask the user
#                                  whether to keep the running instance or restart fresh
#   - port busy, source=resume  -> leave it (no nagging on every resume/compact)
#   - invoked with --restart    -> kill whatever holds 8087 and start a fresh serve
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT" || exit 0

MARKER=".claude/hooks/.last-serve-restart"
LOG=".claude/hooks/serve.log"

start_serve() {
	touch "$MARKER"
	nohup make serve >"$LOG" 2>&1 </dev/null &
	local pid=$!
	disown
	caffeinate -d -u -w "$pid" >/dev/null 2>&1 &
	disown
}

kill_serve() {
	local port_pid
	port_pid=$(lsof -ti tcp:8087 2>/dev/null || true)
	[ -n "$port_pid" ] && kill $port_pid 2>/dev/null || true
	pkill -f "[g]o run ./cmd/service -dev" 2>/dev/null || true
	pkill -f "[m]ake serve" 2>/dev/null || true
	local i
	for i in $(seq 1 20); do
		lsof -ti tcp:8087 >/dev/null 2>&1 || return 0
		sleep 0.25
	done
}

if [ "${1:-}" = "--restart" ]; then
	kill_serve
	start_serve
	exit 0
fi

INPUT=$(cat 2>/dev/null || true)
SOURCE=$(printf '%s' "$INPUT" | jq -r '.source // "startup"' 2>/dev/null || echo startup)

PORT_PID=$(lsof -ti tcp:8087 2>/dev/null | head -1 || true)

if [ -z "$PORT_PID" ]; then
	start_serve
	exit 0
fi

case "$SOURCE" in
	startup | clear)
		UPTIME=$(ps -o etime= -p "$PORT_PID" 2>/dev/null | tr -d ' ')
		CTX="zpotify \`make serve\` is already listening on :8087 (PID ${PORT_PID}, up ${UPTIME:-unknown}). Before anything else this session, call AskUserQuestion asking whether to keep this running instance or restart it fresh. If they pick restart, run: bash .claude/hooks/serve-session-start.sh --restart"
		jq -cn --arg c "$CTX" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$c}}'
		;;
esac

exit 0
