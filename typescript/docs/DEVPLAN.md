
# DEVPLAN: VOLTRONUSSY Engine (TypeScript ECS) 🧠⚙️
Purpose: a small universal ECS logic engine + plugin ecosystem for safe collaboration in one repo.

Target: ship a usable v0.1 fast, then iterate.
Baseline: Node 20+, TypeScript (strict), workspaces monorepo.
Tests: vitest or jest (choose one, document it).

## Success criteria (v0.1)
- A headless engine loop that runs systems/components deterministically enough for tests.
- Plugin system with metadata: tags, dependencies, engineApiVersion, status.
- Null adapter runner for CI.
- Optional web-canvas adapter for something playable.
- At least 2 tiny games using the same core.
- CI: install, build, test on PR.
- Docs: architecture, plugins, workflow.

## Non-goals (v0.1)
- No editor, no networking, no full physics solver.
- Avoid OOP inheritance hierarchies as the gameplay model.

---

## Phase 0: Bootstrap (1 day)
Deliverables:
- Workspace scaffold (pnpm/yarn/npm, pick one)
- Packages:
  - `@voltronussy/engine-abstractions`
  - `@voltronussy/engine-core`
  - `@voltronussy/plugin-host`
- Base config: tsconfig, eslint, prettier (lightweight), test runner
- CI workflow: install, build, test

---

## Phase 1: Red phase (contracts + tests) (1 to 2 days)
Define interfaces first:
- EntityId, World, System, Scheduler, Registry
Write failing tests:
- create/destroy entity deterministically
- add/remove/get component
- query by component set
- scheduler stable ordering
- plugin metadata parse + dependency validation

---

## Phase 2: ECS core (2 to 4 days)
Implement minimal World:
- entity allocator with free list
- component stores per type (Map<EntityId, T> first)
Implement scheduler:
- fixedUpdate, update, render hooks
Keep it small and correct.

---

## Phase 3: PluginHost + tagging (2 to 3 days)
- Discover plugin folders
- Validate plugin.json
- Build dependency graph, detect cycles
- Load plugin module (dynamic import) and call `register(registry)`

Promotion path:
1) plugin proves itself in at least one game
2) tests + docs
3) promote into core or bless as stable plugin

---

## Phase 4: Adapters (parallel)
- adapter-null: headless runner, deterministic dt
- adapter-webcanvas (optional): minimal draw primitives + input mapping

---

## Phase 5: Example games (parallel)
- example-headless: prints/logs events, proves simulation
- example-web: move entity, basic collision or score text

---

## Phase 6: CI, guardrails, release
- main protected, required checks
- PR template and CODEOWNERS
- versioning: engineApiVersion "0.1"
- tag release: engine-v0.1.0

---

## The GLM build instruction
Hand GLM:
- this file
- docs/ARCHITECTURE.md
- docs/PLUGINS.md
- docs/WORKFLOW.md
Ask it to scaffold, write tests first, implement core, add plugin host, add a null runner, then add sample games.
Last updated: December 23, 2025
