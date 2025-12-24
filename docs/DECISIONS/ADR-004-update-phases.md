# ADR-004: Three-Phase Update Loop

**Status:** Accepted  
**Date:** 2024-12-23

## Context

Games need different update phases for different purposes:
- Physics and simulation need fixed timesteps
- Input and game logic run every frame
- Rendering should be separate from simulation

## Decision

**Three-phase update loop: fixedUpdate, update, render.**

```typescript
interface System {
  fixedUpdate?(world: World, dt: number): void;  // Fixed timestep
  update?(world: World, dt: number): void;       // Variable timestep
  render?(world: World, dt: number): void;       // Presentation only
}
```

Phases:
1. **fixedUpdate** — Runs at fixed intervals (e.g., 60Hz), accumulates leftover time. Used for physics, deterministic simulation.
2. **update** — Runs once per frame with variable dt. Used for input, AI, animation.
3. **render** — Runs after update. Should NOT mutate simulation state. Adapters use this.

Reasons:
1. **Determinism** — Fixed timestep enables reproducible physics
2. **Separation** — Rendering is clearly separate from simulation
3. **Flexibility** — Systems choose which phases they need
4. **Standard pattern** — Well-established in game engines

## Consequences

- Scheduler must track accumulated time for fixedUpdate
- Systems can implement any subset of phases
- Render phase mutations are a code smell (but not enforced in v0.1)
- Future: could add a `lateUpdate` phase if needed
