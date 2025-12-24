
# GLM 4.7 Prompt: Build VOLTRONUSSY Engine (TypeScript ECS Monorepo)
You are building a small ECS logic engine in TypeScript designed for collaboration in one repo.

## Inputs
- docs/DEVPLAN.md
- docs/ARCHITECTURE.md
- docs/PLUGINS.md
- docs/WORKFLOW.md
- docs/CODESTYLE.md

## Hard constraints
- Node 20+, TypeScript strict
- Core must be platform-agnostic (no DOM, no fs assumptions)
- Adapters isolate platform I/O
- Plugins compile against engine-abstractions only
- Tests first for ECS + scheduler + plugin metadata parsing
- Keep it tiny: ship v0.1 with correctness over speed

## Required deliverables (minimum)
1) Workspace scaffold + packages
2) ECS core passing tests
3) PluginHost with metadata + dependency validation
4) Null adapter runner (headless)
5) One sample plugin with plugin.json
6) Two sample games (headless + optional webcanvas)
7) CI workflow
8) Update docs if contracts change

## Implementation order (do not skip)
1) scaffold repo and configs
2) write failing tests
3) implement World + scheduler until green
4) implement plugin discovery + dependency graph
5) implement plugin module loading + registry
6) implement headless runner
7) implement sample games
