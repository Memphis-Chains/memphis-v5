# RELEASE-PROCESS.md — memphis-v4

Real-deal.

## Goal
Deterministic release flow with clear gates and rollback-ready discipline.

## Preconditions
- Work only in: `/home/memphis_ai_brain_on_chain/memphis-v4`
- Clean tree before release:
  - `git status`
- Correct remote:
  - `git remote -v`

## 1) Quality gate (mandatory)
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

If any step fails: **stop release**.

## 2) Commit and push
```bash
git add .
git commit -m "<scope>: <what changed>"
git push
```

## 3) Tag release
```bash
git tag -a vX.Y.Z -m "release: vX.Y.Z"
git push origin vX.Y.Z
```

## 4) Publish GitHub release
- Repository: `https://github.com/Memphis-Chains/memphis-v4`
- Releases → Draft new release
- Tag: `vX.Y.Z`
- Include:
  - Scope
  - What changed
  - Known limits
  - Rollback hint

## 5) Post-release verification
```bash
git fetch --tags
git tag -l | grep vX.Y.Z
```

And verify release page shows expected notes/assets.

## PAT note (HTTPS flow)
On this host, stable push path is HTTPS + PAT.
If release touches `.github/workflows/*`, PAT must include:
- `repo`
- `workflow`

## Rollback hint
If release is broken:
1. Identify last known-good tag
2. Communicate rollback intent
3. Create fix branch or hotfix tag
4. Re-release with explicit note
