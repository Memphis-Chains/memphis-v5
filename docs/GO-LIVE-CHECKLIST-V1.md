# GO-LIVE CHECKLIST v1

## Pre-flight
- [ ] `npm ci`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `./scripts/secret-scan.sh`

## Config safety
- [ ] `NODE_ENV=production`
- [ ] `MEMPHIS_API_TOKEN` set
- [ ] production provider keys configured for selected default provider
- [ ] `DATABASE_URL` points to persistent storage

## Runtime checks
- [ ] `GET /health` returns ok
- [ ] `GET /v1/ops/status` returns health summary with color
- [ ] `GET /v1/metrics` reachable with auth
- [ ] gateway `/ops/status` returns health summary

## Post-deploy
- [ ] confirm logs are clean (no repeated errors)
- [ ] verify provider success/failure counters
- [ ] create checkpoint tag
