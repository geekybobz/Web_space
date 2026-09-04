#!/bin/zsh

set -euo pipefail

project_root="${0:A:h}"
host="${WEBSPACE_HOST:-127.0.0.1}"
port="${WEBSPACE_PORT:-2026}"
wifi_host="${WEBSPACE_WIFI_HOST:-0.0.0.0}"
wifi_port="${WEBSPACE_WIFI_PORT:-2032}"
preview_url="http://localhost:${port}/dist/index.html?localPreview=1"
asset_version="$(date +%s)"

cd "$project_root"

python3 tools/build_index.py --asset-version "$asset_version"
python3 tools/validate_site.py

if python3 tools/local_preview_server.py --help 2>&1 | grep -q -- '--wifi-host'; then
  python3 tools/local_preview_server.py --host "$host" --port "$port" --wifi-host "$wifi_host" --wifi-port "$wifi_port" &
else
  python3 tools/local_preview_server.py --port "$port" &
fi
server_pid=$!

sleep 1
open "$preview_url"

wait "$server_pid"
