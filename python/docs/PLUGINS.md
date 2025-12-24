
# Plugins & patches (Python) 🔧
Goal: ship features without touching core, then promote the good ones.

## Plugin folder contract
Each plugin lives in `/plugins/<name>`:
- plugin.json metadata
- plugin module/package
- tests/
- README.md usage

Plugins must only import from engine abstractions (not core internals).

## plugin.json schema (v0.1)
```json
{
  "id": "voltronussy.physics.aabb",
  "name": "AABB Physics",
  "version": "0.1.0",
  "engineApiVersion": "0.1",
  "status": "experimental",
  "tags": ["physics", "collision"],
  "dependsOn": [
    { "id": "voltronussy.core.events", "version": ">=0.1.0" }
  ],
  "capabilities": ["collision.aabb", "rigidbody.basic"]
}
```

## Loading model (v0.1)
Simple and explicit:
- plugin_host scans `/plugins/*/plugin.json`
- validates schema
- resolves deps
- imports plugin code by path (importlib)
- calls `register(registry)`

Later, you can support python entry points, but v0.1 should stay folder-based and obvious.

## Promotion checklist
- Used by at least one game
- Tests in CI
- Docs
- No breaking other sample games
- Maintainer review

## Feature flags
If you might break games, add config flags and default them safe.
