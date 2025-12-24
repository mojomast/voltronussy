
# Plugins & Patches (TypeScript) 🔧

> Goal: Ship features without touching core. Prove them in games. Promote the good ones.

## Two Kinds of Custom Mechanics

### 1. Game-Local Patches (Default)

When you create a game, you can add any mechanics you want directly in your game folder:

```
games/my-game/
├── src/
│   └── index.ts    ← Your components and systems live here
├── game.json
└── README.md
```

These mechanics are **local to your game**. Other games can't use them.

### 2. Shared Plugins

When you have a mechanic that would be useful in multiple games, extract it into a plugin:

```
plugins/my-plugin/
├── src/
│   └── index.ts    ← Export your components and systems
├── plugin.json
├── test/
│   └── index.test.ts
└── README.md
```

Other games can now depend on your plugin.

---

## Creating a Plugin

### Step 1: Copy the template

```bash
cp -r plugins/_template plugins/my-feature
```

### Step 2: Configure plugin.json

```json
{
  "id": "voltronussy.my-feature",
  "name": "My Feature",
  "version": "0.1.0",
  "engineApiVersion": "0.1",
  "status": "experimental",
  "tags": ["utility"],
  "dependsOn": [],
  "capabilities": ["my-feature.core"]
}
```

### Step 3: Implement your plugin

```typescript
// plugins/my-feature/src/index.ts

import type { Plugin, PluginRegistry, System, World, Component } from '@voltronussy/engine-abstractions';

// Export your component
export class Health implements Component {
  constructor(public current: number = 100, public max: number = 100) {}
}

// Export your system
export const HealthSystem: System = {
  name: 'Health',
  priority: 10,

  update(world: World, dt: number) {
    for (const entity of world.query({ with: [Health] })) {
      const health = world.getComponent(entity, Health)!;
      if (health.current <= 0) {
        world.despawn(entity);
      }
    }
  }
};

// Plugin registration for plugin-host
const plugin: Plugin = {
  register(registry: PluginRegistry) {
    registry.registerComponentType(Health, 'Health');
    registry.registerSystem(HealthSystem);
  }
};

export default plugin;
```

### Step 4: Use it in a game

```json
// games/my-game/game.json
{
  "plugins": ["voltronussy.my-feature"]
}
```

```typescript
// games/my-game/src/index.ts
import { Health, HealthSystem } from '@voltronussy/my-feature';

scheduler.addSystem(HealthSystem);

const player = world.spawn();
world.addComponent(player, Health, new Health(100, 100));
```

---

## Plugin Folder Contract

Each plugin lives in `/plugins/<name>`:

```
plugins/my-plugin/
├── plugin.json     ← Required: metadata
├── src/
│   └── index.ts    ← Required: exports components, systems, plugin
├── test/
│   └── *.test.ts   ← Required: tests
├── package.json    ← Required: npm package config
└── README.md       ← Required: usage documentation
```

**Plugins compile against `@voltronussy/engine-abstractions` only.**

Never import from `engine-core` or other packages directly.

---

## plugin.json Schema (v0.1)

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

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique ID in format `namespace.name` |
| `name` | Yes | Human-readable name |
| `version` | Yes | Semver version |
| `engineApiVersion` | Yes | Engine API version this plugin targets |
| `status` | Yes | `experimental`, `stable`, or `deprecated` |
| `tags` | No | Array of category tags |
| `dependsOn` | No | Array of plugin dependencies |
| `capabilities` | No | What this plugin provides |

### Status Values

- **experimental** — New, API may change. Use at your own risk.
- **stable** — Proven, API locked. Safe to depend on.
- **deprecated** — Being phased out. Migrate away.

---

## Interoperability Rules

1. **No engine internals.** Only import from `@voltronussy/engine-abstractions`.
2. **No global singletons.** Don't affect other games without explicit opt-in.
3. **Namespace everything.** Prefix your components and systems.
4. **Prefer additive changes.** Don't break existing users.

---

## Dependency Resolution

The plugin-host handles dependencies:

1. Loads all `plugin.json` files
2. Builds a dependency graph
3. Detects and rejects cycles
4. Returns a safe load order

Example error:

```
DependencyError: Circular dependency detected: a → b → c → a
```

---

## Promotion Path (Plugin → Core)

Plugins that prove stable can be promoted to core.

### Promotion Checklist

- [ ] Used by at least one game in `/games`
- [ ] Has tests running in CI
- [ ] Has documentation
- [ ] Doesn't break other sample games
- [ ] Maintainer review and approval

### Promotion Options

1. **Move to core** — Becomes part of `/packages/engine-*`
2. **Blessed plugin** — Stays in `/plugins` with `status: "stable"`

---

## Feature Flags

If a change might break games, add a config flag:

```typescript
interface PluginConfig {
  enableNewBehavior?: boolean;  // Default: false
}
```

Default to the safe behavior. Let games opt into new behavior.
