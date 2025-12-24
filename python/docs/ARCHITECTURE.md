
# Architecture: VOLTRONUSSY Engine (Python) 🧩
Same triangle philosophy:
- Narrow core, wide ecosystem.

## Layers
### 1) abstractions (the treaty)
Public protocols/types that plugins and games rely on.
Treat changes as breaking unless carefully versioned.

### 2) core (the brainstem)
ECS storage, World, scheduler, time-step utilities.
No rendering libs.

### 3) plugin_host (the docking bay)
Discovers plugin folders, validates metadata, resolves deps, imports plugin modules,
calls register(registry).

### 4) adapters (hands and eyes)
Optional, for playability. Core stays headless and testable.
- null adapter for CI
- optional pygame adapter for 2D

### 5) games (the lions)
Each game composes:
- core + one adapter + chosen plugins + game systems/components

## ECS shape (v0.1)
- Entity: opaque int id
- Component: dataclass or plain object
- System: update(world, dt)

## Update phases
- fixed_update
- update
- render (adapter hook, should not mutate simulation state)

## Constraints
- No global singletons.
- Prefer simple and correct over clever optimization.
