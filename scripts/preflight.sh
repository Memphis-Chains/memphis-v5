#!/usr/bin/env bash
set -euo pipefail
npm run typecheck
npm run lint
npm run test
