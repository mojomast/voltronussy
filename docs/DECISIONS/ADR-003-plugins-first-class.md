# ADR-003: Plugins as First-Class Extension Mechanism

**Status:** Accepted  
**Date:** 2024-12-23

## Context

We want contributors to be able to extend the engine without touching core. We need a clear extension mechanism with:

- Metadata (versioning, dependencies, tags)
- Isolation (plugins can't break each other)
- Discoverability (easy to find and use plugins)
- Promotion path (good plugins can become core)

## Decision

**Folder-based plugins with plugin.json metadata.**

Each plugin is a folder in `/plugins/<name>/` containing:
- `plugin.json` — Metadata file (required)
- `src/` — Source code
- `test/` — Tests
- `README.md` — Usage documentation

plugin.json schema:
```json
{
  "id": "voltronussy.my-feature",
  "name": "My Feature",
  "version": "0.1.0",
  "engineApiVersion": "0.1",
  "status": "experimental|stable|deprecated",
  "tags": ["category"],
  "dependsOn": [{ "id": "...", "version": ">=0.1.0" }],
  "capabilities": ["what.it.provides"]
}
```

Reasons:
1. **Explicit** — All metadata in one file, easy to validate
2. **Discoverable** — Plugin-host scans folders, no magic
3. **Versioned** — Plugins declare engine compatibility
4. **Isolated** — Each plugin is its own package/module

## Consequences

- Plugin-host must validate plugin.json strictly
- Plugin-host must resolve dependencies and detect cycles
- Plugins must only import from engine-abstractions, not internals
- Promotion to core is a deliberate process, not automatic
