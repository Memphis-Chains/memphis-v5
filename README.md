Real-deal.

# memphis-v4

Production-first Memphis v4 foundation.

Status:
- Public baseline release: `v0.1.0`
- Current track: BLUEPRINT Phase 0 execution (`ROADMAP-V0.2.0-BLUEPRINT-P0.md`)
- Operating mode: quality-first, no rushed shortcuts

## Why this exists
`memphis-v4` is the clean codebase line for the next generation Memphis architecture:
- TypeScript shell
- Rust core entry (workspace + core + NAPI bridge)
- Safe migration path via feature-flag fallback

## Quick start
```bash
npm install
cp .env.example .env
npm run dev
```

## Quality gate (required before push)
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

With Rust workspace enabled, also run:
```bash
cargo test --workspace
```

## Release
Follow deterministic release flow:
- `docs/RELEASE-PROCESS.md`

## Roadmaps
- `ROADMAP-V0.1.1.md` — reliability/documentation hardening
- `ROADMAP-V0.2.0-BLUEPRINT-P0.md` — Rust/NAPI Phase 0 execution
- `docs/BLUEPRINT-GAP-ANALYSIS.md` — blueprint target vs current state

## Working agreement
- `WORKING-AGREEMENT.md`

## Current key docs
- `docs/NAPI-CONTRACT-V1.md`
- `docs/V0.2.0-RC-CHECKLIST.md`

## Security notes
- Never commit secrets.
- Keep `.env` local only.
- Prefer short-lived PAT tokens with minimal scopes.
