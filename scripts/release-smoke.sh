#!/usr/bin/env bash
set -euo pipefail
npm run typecheck
npm run lint
npm run test
npm run build
./scripts/secret-scan.sh
echo "release-smoke: PASS"
