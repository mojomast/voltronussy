# API Versioning Policy

This document describes how we version the engine API and handle breaking changes.

## Current Version

**Engine API Version: `0.1`**

## Version Format

We use a simple `MAJOR.MINOR` format for the engine API:

- **MAJOR** — Breaking changes that require game updates
- **MINOR** — New features, backwards-compatible

Note: Individual packages have their own semver versions (`0.1.0`, `0.1.1`, etc.), but the engine API version is what plugins and games use for compatibility checking.

## Compatibility Rules

### For Games

- Games declare `engineApiVersion` in `game.json`
- A game works with any engine that has the same major version
- Example: A game with `"engineApiVersion": "0.1"` works with engine API `0.1`, `0.1.1`, etc.

### For Plugins

- Plugins declare `engineApiVersion` in `plugin.json`
- Plugins are checked at load time
- Incompatible plugins are rejected with a clear error message

```json
{
  "id": "voltronussy.my-plugin",
  "engineApiVersion": "0.1",
  ...
}
```

## Breaking Changes

A change is considered **breaking** if it:

- Removes a public function, type, or interface
- Changes the signature of a public function
- Changes behavior that games or plugins rely on
- Removes or renames configuration options

### Before Making a Breaking Change

1. **Open an issue** with label `engine:breaking-change`
2. **Discuss** with maintainers and affected game authors
3. **Get approval** before implementing

### When Making a Breaking Change

1. **Bump the MAJOR version** of `engineApiVersion`
2. **Update all sample games** to work with the new version
3. **Write migration notes** in the PR description
4. **Add to CHANGELOG** with clear upgrade instructions

## Deprecation Process

We don't just remove things. We deprecate first:

### Step 1: Mark Deprecated

```typescript
/**
 * @deprecated Use `newMethod()` instead. Will be removed in API version 0.3.
 */
function oldMethod(): void {
  console.warn('oldMethod() is deprecated. Use newMethod() instead.');
  // ... implementation
}
```

### Step 2: Wait One Minor Version

Give games and plugins time to migrate. At minimum, one minor version must pass before removal.

### Step 3: Remove

In the next major version, the deprecated API can be removed.

## Checking Compatibility

### In Code

```typescript
import { ENGINE_API_VERSION } from '@voltronussy/engine-abstractions';

console.log(`Engine API Version: ${ENGINE_API_VERSION}`);
```

### In plugin.json

The plugin host automatically checks:

```json
{
  "engineApiVersion": "0.1"
}
```

If a plugin requires a different version, you'll see:

```
Plugin validation failed for "my.plugin":
Incompatible engineApiVersion. Plugin requires "0.2", engine is "0.1"
```

## Migration Guides

When we release a new major version, we'll create a migration guide:

- `/docs/migrations/0.1-to-0.2.md`

These guides will include:
- What changed
- Why it changed
- Step-by-step migration instructions
- Before/after code examples

## Pre-1.0 Policy

While we're in `0.x` versions, we're still finding our footing. Breaking changes may happen more frequently than after 1.0. However, we still follow the deprecation process and provide migration guides.

Once we reach `1.0`, we commit to much stricter stability guarantees.

---

*Last updated: December 23, 2025*
