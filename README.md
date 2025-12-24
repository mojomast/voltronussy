# VOLTRONUSSY Engine 🦁⚡

> A tiny ECS game engine for friends to build games together in one repo.

[![TypeScript](https://img.shields.io/badge/TypeScript-Primary-blue)](typescript/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**New here? Start with [GETTING_STARTED.md](GETTING_STARTED.md)!**

## What is this?

Voltronussy is a **collaborative monorepo** where anyone can:

1. **Clone the repo** and start building immediately
2. **Create a game** in `games/your-game/` with your own mechanics
3. **Add custom mechanics as patches** — your game can include its own systems, components, and plugins
4. **Submit a PR** so your game is playable by everyone

**No gatekeeping.** You don't need permission to add features. Your game is your sandbox.

### What's in the repo?

- **Engine** — A small, stable ECS (Entity-Component-System) core
- **Plugins** — Shared feature patches that extend the engine
- **Adapters** — Platform bindings (web canvas, terminal, etc.)
- **Games** — Individual games built by contributors (each can have its own patches!)

**Philosophy:** Keep the core small. Ship features as plugins first. Promote the good ones.

---

## TL;DR — How to Contribute

```bash
# 1. Clone and setup
git clone https://github.com/mojomast/voltronussy.git
cd voltronussy/typescript
pnpm install

# 2. Create your game from template
cp -r games/_template games/my-game

# 3. Edit games/my-game/src/index.ts — add your mechanics!

# 4. Run and test
pnpm game my-game
pnpm test

# 5. Submit a PR (only touching games/my-game/)
```

That's it. Your game can have any mechanics you want. They live in your game folder.

---

## Two Tracks

| Track | Status | Stack | Playable via |
|-------|--------|-------|--------------|
| **TypeScript** | 🟢 Primary | Node 20+, pnpm, vitest | Browser (canvas) |
| **Python** | 🟡 Experimental | Python 3.12, pytest | pygame (optional) |

The TypeScript track is the primary implementation. Python exists for contributors who prefer it, but may lag behind.

---

## Quick Start (TypeScript)

```bash
# Clone the repo
git clone https://github.com/mojomast/voltronussy.git
cd voltronussy/typescript

# Install dependencies
pnpm install

# Run the example web game
pnpm game example-web

# Run tests
pnpm test
```

---

## Create Your Own Game

**Your game can have its own custom mechanics!** You don't need to modify the engine.

1. **Copy the template:**
   ```bash
   cp -r typescript/games/_template typescript/games/my-cool-game
   ```

2. **Edit your game:**
   - Update `game.json` with your game's metadata
   - **Add your custom systems and components in `src/`** ← your mechanics live here!
   - Write a short `README.md`

3. **Test it locally:**
   ```bash
   cd typescript
   pnpm game my-cool-game
   ```

4. **Submit a PR:**
   - Your PR should only touch `games/my-cool-game/`
   - Fill out the PR template
   - CI must pass

**See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for the complete step-by-step guide.**

---

## Adding Custom Mechanics (Patches) to Your Game

Every game can define its own systems and components. These are your "patches" — custom mechanics that work with the engine.

### Example: Adding a Health System

In `games/my-game/src/index.ts`:

```typescript
// 1. Define a component (just data)
class Health {
  constructor(public current: number = 100, public max: number = 100) {}
}

// 2. Define a system (the logic)
const HealthSystem: System = {
  name: 'Health',
  priority: 10,
  
  update(world: World, dt: number) {
    const entities = world.query({ with: [Health] });
    for (const entity of entities) {
      const health = world.getComponent(entity, Health)!;
      if (health.current <= 0) {
        world.despawn(entity);  // Entity dies
      }
    }
  }
};

// 3. Register it with the scheduler
scheduler.addSystem(HealthSystem);

// 4. Use it when spawning entities
const enemy = world.spawn();
world.addComponent(enemy, Health, new Health(50, 50));
```

That's it! Your mechanic is now part of your game.

### Want to share a mechanic?

If your patch is useful to others, you can extract it into a **plugin** so other games can use it:

```bash
cp -r plugins/_template plugins/my-feature
# Move your reusable code there
# Other games can now depend on it
```

---

## Plugins (Shared Patches)

Plugins are **reusable patches** that can be shared across multiple games.

When to make a plugin vs. keep it in your game:
- **Keep in game:** Your mechanic is specific to your game
- **Make a plugin:** Other games would benefit from your mechanic

1. **Copy the plugin template:**
   ```bash
   cp -r typescript/plugins/_template typescript/plugins/my-feature
   ```

2. **Define your plugin:**
   - Edit `plugin.json` with metadata, tags, and dependencies
   - Implement in `src/` (export your components and systems)
   - Add tests in `test/`

3. **Use it in a game:**
   - Add your plugin to a game's `plugins` array in `game.json`
   - Import and use the components/systems

4. **Submit a PR:**
   - Your PR should only touch `plugins/my-feature/`
   - Document usage in your plugin's `README.md`

See [typescript/docs/PLUGINS.md](typescript/docs/PLUGINS.md) for the full plugin contract.

---

## Promotion: Plugin → Core

Plugins that prove stable can be promoted:

1. Used by at least one game in `/games`
2. Has tests running in CI
3. Has documentation
4. Doesn't break other sample games
5. Maintainer review and approval

Promoted plugins either:
- Move into `/packages/engine-*` as a core module
- Stay as a **blessed plugin** with `status: "stable"`

See [docs/GOVERNANCE.md](docs/GOVERNANCE.md) for the full process.

---

## Project Structure

```
/
├── docs/                    # Top-level governance and contribution docs
├── typescript/              # 🟢 Primary track
│   ├── packages/
│   │   ├── engine-abstractions/   # Public types and interfaces
│   │   ├── engine-core/           # ECS implementation
│   │   └── plugin-host/           # Plugin loading and validation
│   ├── adapters/
│   │   ├── adapter-null/          # Headless runner for CI
│   │   └── adapter-webcanvas/     # Browser canvas adapter
│   ├── plugins/                   # Community plugins
│   ├── games/                     # Community games
│   └── docs/                      # TypeScript-specific docs
└── python/                  # 🟡 Experimental track
    ├── engine/
    ├── plugins/
    ├── games/
    └── docs/
```

---

## Labels & Workflow

We use GitHub Issues and PRs with specific labels:

| Label | Meaning |
|-------|---------|
| `patch:proposal` | New plugin/feature idea |
| `patch:accepted` | Approved for development |
| `patch:ready-for-promotion` | Ready for core review |
| `game:submission` | New game PR |
| `engine:breaking-change` | Requires version bump |

See [docs/GOVERNANCE.md](docs/GOVERNANCE.md) for the full patch queue process.

---

## Engine API Versioning

- Current version: `0.1`
- Breaking changes require a version bump
- Plugins declare their required `engineApiVersion`
- Incompatible plugins are rejected with clear error messages

---

## Contributing

1. Read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
2. Pick your track (TypeScript recommended)
3. Create a game or plugin
4. Submit a PR

**Most PRs should only touch ONE folder** (`games/your-game` or `plugins/your-plugin`).

---

## Summary: The Contributor Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   1. CLONE                                                      │
│      git clone https://github.com/mojomast/voltronussy.git     │
│      cd voltronussy/typescript                                  │
│      pnpm install                                               │
│                                                                 │
│   2. CREATE YOUR GAME                                           │
│      cp -r games/_template games/my-game                        │
│      # Edit game.json with your info                            │
│      # Add your mechanics in src/index.ts                       │
│                                                                 │
│   3. ADD MECHANICS (Patches)                                    │
│      ┌─────────────────────────────────────────────┐            │
│      │  // Your components (data)                  │            │
│      │  class Health { current: number; max: number }           │
│      │                                             │            │
│      │  // Your systems (logic)                    │            │
│      │  const DamageSystem = { update(world, dt) { ... } }      │
│      │                                             │            │
│      │  // Register and use                        │            │
│      │  scheduler.addSystem(DamageSystem);         │            │
│      │  world.addComponent(entity, Health, ...);   │            │
│      └─────────────────────────────────────────────┘            │
│                                                                 │
│   4. TEST & RUN                                                 │
│      pnpm game my-game   # Play it!                             │
│      pnpm test           # Make sure nothing broke              │
│                                                                 │
│   5. SUBMIT PR                                                  │
│      git add games/my-game                                      │
│      git commit -m "game: add my-game"                          │
│      git push && open PR                                        │
│                                                                 │
│   6. (OPTIONAL) SHARE A MECHANIC                                │
│      If your patch is useful to others:                         │
│      cp -r plugins/_template plugins/my-mechanic                │
│      # Move reusable code there                                 │
│      # Other games can now use it!                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

That's the whole workflow. **Clone → Create → Add Mechanics → Submit PR.**

---

## License

MIT — See [LICENSE](LICENSE) in each track folder.

---

*Last updated: December 23, 2025*
