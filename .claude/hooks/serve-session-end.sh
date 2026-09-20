#!/bin/bash
# SessionEnd hook (see .claude/settings.local.json): stops the local `make serve-rc` (go service
# serving the embedded UI bundle) when the Claude session closes (Ctrl+C from the binary, logout,
# etc.), so the server's lifetime matches the conversation's.
set -uo pipefail

PORT_PID=$(lsof -ti tcp:8087 2>/dev/null || true)
if [ -n "$PORT_PID" ]; then
	kill $PORT_PID 2>/dev/null || true
fi

pkill -f "[g]o run ./cmd/service -dev" 2>/dev/null || true
pkill -f "[m]ake serve-rc" 2>/dev/null || true

exit 0
