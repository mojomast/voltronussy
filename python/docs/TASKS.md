
# Initial Backlog (Python)
## Epic: Bootstrap
- [ ] pyproject.toml scaffold (uv or poetry)
- [ ] engine package with abstractions/core/plugin_host
- [ ] ruff + pytest + CI

## Epic: ECS core
- [ ] Entity allocator (free list)
- [ ] World add/remove/get
- [ ] Query helper(s)
- [ ] Scheduler with phases
- [ ] Unit tests

## Epic: PluginHost
- [ ] plugin.json schema + validation
- [ ] dependency graph + cycle detection
- [ ] import plugin modules by path
- [ ] registry for systems/resources
- [ ] tests

## Epic: Adapters
- [ ] null adapter (headless runner)
- [ ] optional pygame adapter

## Epic: Sample games
- [ ] example_headless
- [ ] optional example_pygame

## Epic: Patch demo plugin
- [ ] events bus or AABB collision plugin
- [ ] tests + docs
