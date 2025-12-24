
# DEVPLAN: VOLTRONUSSY Engine (Python ECS) 🧠⚙️
Purpose: a small ECS logic engine + plugin ecosystem for safe collaboration in one repo.

Target: ship v0.1 quickly, then iterate.
Baseline: Python 3.12, folder-based plugins, headless-first tests.

## Success criteria (v0.1)
- Headless engine loop that runs systems/components for tests.
- Plugin system with metadata: tags, deps, engineApiVersion, status.
- Null adapter runner for CI.
- Optional pygame adapter for playability.
- Two tiny example games (headless required).
- CI: lint + tests on PR.
- Docs: architecture, plugins, workflow.

## Non-goals (v0.1)
- No editor, no networking, no heavy physics.
- Avoid inheritance trees as gameplay model.

---

## Phase 0: Bootstrap (1 day)
Deliverables:
- `pyproject.toml` scaffold (uv recommended, poetry ok)
- engine package:
  - abstractions
  - core
  - plugin_host
- ruff + pytest configured
- CI workflow: lint + tests

---

## Phase 1: Red phase (contracts + tests) (1 to 2 days)
Define protocols/types:
- EntityId, World, System, Scheduler, Registry, Plugin interface
Write failing tests:
- entity lifecycle
- component add/remove/get
- queries
- scheduler stable order
- plugin.json parse + dependency validation

---

## Phase 2: ECS core (2 to 4 days)
Implement minimal World:
- entity allocator with free list
- component stores as dicts first
Implement scheduler phases:
- fixed_update, update, render hook

---

## Phase 3: PluginHost + tagging (2 to 3 days)
- discover plugins in /plugins
- validate plugin.json
- build dependency graph and refuse cycles
- import plugin code with importlib and call register(registry)

Promotion:
- plugin proves itself in games, adds tests/docs, then promote or bless

---

## Phase 4: Adapters (parallel)
- null adapter runner (deterministic dt)
- optional pygame adapter

---

## Phase 5: Example games (parallel)
- example_headless: logs important events
- optional example_pygame: move entity, draw rect

---

## Phase 6: CI, guardrails, release
- main protected, required checks
- PR template + CODEOWNERS
- versioning: engineApiVersion "0.1"
- tag release: engine-v0.1.0

Last updated: December 23, 2025
