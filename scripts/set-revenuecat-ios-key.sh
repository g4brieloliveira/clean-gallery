#!/usr/bin/env bash
# Usage: ./scripts/set-revenuecat-ios-key.sh appl_XXXX
# Stores the public Apple SDK key in EAS for development/preview/production.
set -euo pipefail

KEY="${1:-}"
if [[ -z "$KEY" || "$KEY" != appl_* ]]; then
  echo "Usage: $0 appl_YOUR_REVENUECAT_IOS_KEY" >&2
  exit 1
fi

for ENV in development preview production; do
  echo "Setting EXPO_PUBLIC_REVENUECAT_IOS_API_KEY for $ENV…"
  eas env:create \
    --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY \
    --value "$KEY" \
    --environment "$ENV" \
    --visibility plaintext \
    --force \
    --non-interactive
done

echo "Done. Redeploy builds so they pick up the new key."
