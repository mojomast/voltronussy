
# Initial Backlog (TypeScript)
## Epic: Bootstrap
- [ ] Monorepo scaffold (workspaces)
- [ ] Packages: abstractions, core, plugin-host
- [ ] Tooling: build, test, lint
- [ ] CI: build + test

## Epic: ECS core
- [ ] EntityId allocator (free list)
- [ ] World add/remove/get components
- [ ] Query API (slow but correct is fine)
- [ ] System scheduler with phases
- [ ] Unit tests

## Epic: PluginHost
- [ ] plugin.json schema + validation
- [ ] Dependency graph + readable errors
- [ ] Plugin module loading (dynamic import)
- [ ] Plugin registration via registry
- [ ] Unit tests

## Epic: Adapters
- [ ] adapter-null (headless runner)
- [ ] adapter-webcanvas (optional but recommended)

## Epic: Sample games
- [ ] example-headless (logs events)
- [ ] example-web (move a square, show score text)

## Epic: Patch demo plugin
- [ ] a small plugin (events bus or AABB collision)
- [ ] docs + tests
