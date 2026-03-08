# RELEASE CHECKLIST (v0)

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test`
5. `npm run build`
6. `./scripts/secret-scan.sh`
7. Verify quick smoke:
   - `npm run cli -- health --json`
   - `npm run cli -- providers:health --json`
8. Confirm CI green on PR.
9. Tag release + changelog note.
