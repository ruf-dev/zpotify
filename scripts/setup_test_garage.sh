#!/usr/bin/env bash
# Bootstraps the e2e Garage container (docker-compose.yaml: test-garage): a fresh node has no
# layout and no S3 key. Safe to re-run — every step is a no-op if already done.
set -euo pipefail

CONTAINER="${GARAGE_CONTAINER:-zpotify-test-garage}"
ZONE="${GARAGE_ZONE:-z1}"
CAPACITY="${GARAGE_CAPACITY:-1G}"
KEY_NAME="${GARAGE_KEY_NAME:-zpotify-test}"
KEY_ID="${GARAGE_KEY_ID:-GKae2e0ae2e0ae2e0ae2e0ae2e}"
KEY_SECRET="${GARAGE_KEY_SECRET:-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef}"

garage() {
  docker exec "$CONTAINER" /garage "$@"
}

echo "--- Waiting for Garage ($CONTAINER) ---"
i=0
until garage status >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "Garage did not become ready in time" >&2
    exit 1
  fi
  sleep 1
done

layout_version=$(garage layout show 2>/dev/null | awk -F': ' '/Current cluster layout version/{print $2}')

if [ "$layout_version" = "0" ]; then
  node_id=$(garage status 2>/dev/null | awk '/^[0-9a-f]{16}/{print $1; exit}')
  if [ -z "$node_id" ]; then
    echo "Could not determine Garage node id from 'garage status'" >&2
    exit 1
  fi

  echo "Assigning layout to node $node_id (zone=$ZONE, capacity=$CAPACITY)"
  garage layout assign "$node_id" -z "$ZONE" -c "$CAPACITY"
  garage layout apply --version 1
else
  echo "Layout already applied (version $layout_version), skipping"
fi

if ! garage key info "$KEY_ID" >/dev/null 2>&1; then
  garage key import --yes -n "$KEY_NAME" "$KEY_ID" "$KEY_SECRET" >/dev/null
fi

garage key allow --create-bucket "$KEY_ID" >/dev/null

echo "--- Garage e2e setup complete: host port ${TEST_GARAGE_PORT:-19100}, key $KEY_ID ---"
