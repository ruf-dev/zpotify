#!/bin/bash
# SessionStart hook (see .claude/settings.local.json): reports whether the zpotify backend is
# listening on :8087 and tells Claude to ask the user how to (re)start it. Never starts or kills
# anything itself -- restart stays an explicit user choice.
set -uo pipefail

PORT_PID=$(lsof -ti tcp:8087 2>/dev/null | head -1 || true)

if [ -n "$PORT_PID" ]; then
	UPTIME=$(ps -o etime= -p "$PORT_PID" 2>/dev/null | tr -d ' ')
	STATUS="already running (PID ${PORT_PID}, up ${UPTIME:-unknown})"
else
	STATUS="not running"
fi

CTX="Zpotify backend on :8087 is ${STATUS}. Before other work, ask the user (AskUserQuestion) whether to (re)start it now, since source may have changed since it was last started: option A 'desktop' -- \`make serve\` (Go API + Vite dev server with HMR on :15173, for local browser use), option B 'rc' -- \`make serve-rc\` (production bundle, single Go binary on :8087, for remote/mobile access through a reverse proxy), or skip. Only one mode runs at a time. If they pick a mode and something already holds :8087, first free the port: kill the PID from \`lsof -ti tcp:8087\`, then also check for an orphaned compiled \`service\` binary still holding it (killing the \`make\`/\`go run\` wrapper process alone can leave one behind) via \`lsof -nP -iTCP:8087 -sTCP:LISTEN\` and kill that PID too. Desktop mode also leaves Vite on :15173, so free that port the same way. Then run the chosen make target in the background."

jq -cn --arg c "$CTX" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$c}}'
exit 0
