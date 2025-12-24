# Architecture Decision Records

This folder contains Architecture Decision Records (ADRs) documenting significant decisions made in the Voltronussy engine.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](ADR-001-typescript-primary.md) | TypeScript as Primary Implementation Track | Accepted |
| [ADR-002](ADR-002-simple-ecs-storage.md) | Simple Map-Based ECS Storage | Accepted |
| [ADR-003](ADR-003-plugins-first-class.md) | Plugins as First-Class Extension Mechanism | Accepted |
| [ADR-004](ADR-004-update-phases.md) | Three-Phase Update Loop | Accepted |

## Format

Each ADR follows this format:

```markdown
# ADR-NNN: Title

**Status:** Proposed | Accepted | Superseded | Deprecated
**Date:** YYYY-MM-DD

## Context
What problem are we solving?

## Decision
What did we decide and why?

## Consequences
What are the implications?
```

## Adding a New ADR

1. Create a new file: `ADR-NNN-short-title.md`
2. Use the next available number
3. Fill in the template
4. Add to the index above
5. Submit PR with the ADR and any related code changes
