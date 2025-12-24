
# Architecture: VOLTRONUSSY Engine (TypeScript) 🧩
The engine is shaped like a triangle:
- Wide at the edges (many games + plugins)
- Narrow at the center (small core that does not change every day)

## Layers
### 1) engine-abstractions (the treaty)
Public interfaces, contracts, and types that games and plugins compile against.

Rule: if it is in abstractions, changing it is expensive.

### 2) engine-core (the brainstem)
ECS storage, World, scheduler, time-step utilities.
No DOM. No WebGL. No Node fs assumptions.

### 3) plugin-host (the docking bay)
Loads plugin metadata, resolves dependencies, and lets plugins register:
- components
- systems
- resources/services

### 4) adapters (hands and eyes)
Platform I/O, graphics, and input. Core does not know about canvas or terminal.
Adapters translate platform events into normalized input state and render calls.

### 5) games (the lions)
Each game composes:
- core
- one adapter
- selected plugins
- game-specific systems/components

## ECS shape (v0.1)
- Entity: opaque id
- Component: plain data object
- System: logic over components

## Update phases
- FixedUpdate: deterministic-ish steps (physics, movement)
- Update: variable dt (input, AI, animation state)
- Render: presentation (should not mutate simulation state)

## Interop: patches are plugins first
New capabilities start as plugins:
- camera smoothing, AABB collision, particles, UI text, etc.

When stable across multiple games, a plugin can be promoted into core or blessed as a stable plugin.

## Versioning
- engineApiVersion: string like "0.1"
- plugins declare engineApiVersion + dependencies
- plugin-host refuses incompatible plugins with readable errors

## Constraints (intentionally strict)
- No inheritance trees as a gameplay model.
- Prefer simple and correct storage first.
- Avoid hidden global state.
