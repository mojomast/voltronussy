
# GLM 4.7 Prompt: Build VOLTRONUSSY Engine (Python ECS Monorepo)
You are building a small ECS logic engine in Python designed for collaboration in one repo.

## Inputs
- docs/DEVPLAN.md
- docs/ARCHITECTURE.md
- docs/PLUGINS.md
- docs/WORKFLOW.md
- docs/CODESTYLE.md

## Hard constraints
- Python 3.12
- Core must be headless and testable
- Adapters isolate platform I/O
- Plugins use abstractions only (no core internals)
- Tests first for ECS + scheduler + plugin metadata parsing
- Keep it tiny: v0.1 correctness over speed

## Required deliverables (minimum)
1) pyproject scaffold + engine package
2) ECS core passing tests
3) PluginHost with metadata + dependency validation
4) Null runner
5) One sample plugin with plugin.json
6) Two sample games (headless required)
7) CI workflow (ruff + pytest)
8) Update docs if contracts change

## Implementation order (do not skip)
1) scaffold repo
2) write failing tests
3) implement World + scheduler until green
4) implement plugin discovery + dependency graph
5) implement plugin importing + registry
6) implement headless runner
7) implement sample games
