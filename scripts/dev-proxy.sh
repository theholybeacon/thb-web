#!/usr/bin/env bash
# Registers this project's reverse-proxy route(s) with the locally-running Caddy so that
# https://<host>.localhost forwards to this dev server. Runs automatically on every
# `npm run dev` (via "predev"). No sudo: it reloads the already-running Caddy through its
# local admin API (:2019). The shared Caddy must be started once:
#   macOS: sudo brew services start caddy
#   Linux: caddy run --config ~/.config/caddy/Caddyfile   (or a user systemd unit)
#
# Never fatal: if Caddy is missing or unreachable we warn and let `next dev` start anyway.

if BREW_PREFIX="$(brew --prefix 2>/dev/null)" && [ -n "$BREW_PREFIX" ]; then
  CADDY_ETC="$BREW_PREFIX/etc"
else
  CADDY_ETC="${XDG_CONFIG_HOME:-$HOME/.config}/caddy"
fi

SITES="$CADDY_ETC/sites"
GLOBAL_CFG="$CADDY_ETC/Caddyfile"
PROJ="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v caddy >/dev/null 2>&1; then
  echo "⚠ caddy not installed — skipping proxy registration (dev server still starts)"
  exit 0
fi

mkdir -p "$SITES"
cp "$PROJ"/caddy/*.caddy "$SITES"/

# A fresh Linux setup may have no top-level Caddyfile importing the sites dir.
if [ ! -f "$GLOBAL_CFG" ]; then
  printf 'import %s/*.caddy\n' "$SITES" > "$GLOBAL_CFG"
fi

if caddy reload --config "$GLOBAL_CFG" 2>/dev/null; then
  echo "✓ Caddy route(s) registered"
else
  echo "⚠ Caddy isn't running — start it once, then re-run: caddy reload --config $GLOBAL_CFG"
fi

exit 0
