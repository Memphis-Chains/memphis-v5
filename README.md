Real-deal.

# memphis-v4

Production-first, basic-but-working foundation for Memphis v4.

## Quick start
```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts
- `npm run dev` — run local entrypoint
- `npm run typecheck` — TypeScript checks
- `npm run lint` — ESLint
- `npm test` — Vitest
- `npm run build` — compile to `dist/`

## Quality gate (required before push)
Run all commands and push only when all pass:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Release quick path
See: `docs/RELEASE-PROCESS.md`

## Working mode
See: `WORKING-AGREEMENT.md` (quality-first, source-of-truth, release discipline)

## Current phase
Baseline published (`v0.1.0`).
Current execution track: `ROADMAP-V0.1.1.md`.
