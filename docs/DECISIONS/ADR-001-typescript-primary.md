# ADR-001: TypeScript as Primary Implementation Track

**Status:** Accepted  
**Date:** 2024-12-23

## Context

We have two implementation tracks: TypeScript and Python. Both follow the same architecture and philosophy, but we need to choose one as the primary track to:

- Focus development effort
- Provide clear guidance to contributors
- Establish the "reference implementation" that Python can follow

## Decision

**TypeScript is the primary track.**

Reasons:
1. **Faster path to playable** — Web canvas runs in any browser, zero install friction for players
2. **Better tooling** — pnpm workspaces, vitest, esbuild provide fast dev loops
3. **Lower contributor barrier** — Most web-familiar developers can jump in immediately
4. **Type safety** — TypeScript's strict mode catches bugs early

## Consequences

- TypeScript track gets priority for new features and bug fixes
- Python track is marked as "experimental" in documentation
- Both tracks share the same architecture docs and philosophy
- Python can catch up later if there's community interest
- All sample games and primary examples are TypeScript-first
