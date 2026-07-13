#!/usr/bin/env bash
# Registers this project's reverse-proxy route(s) with the locally-running Caddy so that
# https://<host>.localhost forwards to this dev server. Runs automatically on every
# `npm run dev` (via "predev"). No sudo: it reloads the already-running Caddy through its
# local admin API (:2019). The shared Caddy must be started once with:
#   sudo brew services start caddy
set -e

CADDY_ETC="$(brew --prefix 2>/dev/null)/etc"; CADDY_ETC="${CADDY_ETC:-/opt/homebrew/etc}"
SITES="$CADDY_ETC/sites"
GLOBAL_CFG="$CADDY_ETC/Caddyfile"
PROJ="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$SITES"
cp "$PROJ"/caddy/*.caddy "$SITES"/

if caddy reload --config "$GLOBAL_CFG" 2>/dev/null; then
  echo "✓ Caddy route(s) registered"
else
  echo "⚠ Caddy isn't running — start it once: sudo brew services start caddy"
fi
