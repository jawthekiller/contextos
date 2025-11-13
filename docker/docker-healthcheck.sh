#!/bin/bash
set -e

# Use Railway's PORT if set, otherwise fallback to 3001 for local/dev
PORT="${PORT:-3001}"
URL="http://localhost:${PORT}/api/ping"

response=$(curl --write-out '%{http_code}' --silent --output /dev/null "$URL")

if [ "$response" -eq 200 ]; then
  echo "Server is up on $URL"
  exit 0
else
  echo "Server is down on $URL (HTTP $response)"
  exit 1
fi
