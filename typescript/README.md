
# VOLTRONUSSY ENGINE (TypeScript) 🦁⚡

> 🟢 **PRIMARY TRACK** — This is the main implementation of the Voltronussy engine.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run the example web game
pnpm game example-web

# Run the headless example
pnpm game example-headless

# Run all tests
pnpm test

# Build everything
pnpm build
```

---

## Creating Your Game (Complete Guide)

### Step 1: Copy the template

```bash
cp -r games/_template games/my-game
```

### Step 2: Update game.json

```json
{
  "id": "my-game",
  "name": "My Cool Game",
  "version": "0.1.0",
  "engineApiVersion": "0.1",
  "author": "your-github-username",
  "description": "A short description",
  "adapter": "adapter-webcanvas",
  "plugins": []
}
```

### Step 3: Write your game code

Edit `games/my-game/src/index.ts`:

```typescript
import { WorldImpl, SchedulerImpl } from '@voltronussy/engine-core';
import { WebCanvasAdapter, CanvasContextResource, InputStateResource } from '@voltronussy/adapter-webcanvas';
import type { System, World, InputState } from '@voltronussy/engine-abstractions';

// ===== COMPONENTS (your data) =====

class Position {
  constructor(public x: number = 0, public y: number = 0) {}
}

class Velocity {
  constructor(public dx: number = 0, public dy: number = 0) {}
}

class Renderable {
  constructor(public color: string = '#fff', public size: number = 32) {}
}

// ===== SYSTEMS (your logic) =====

const MovementSystem: System = {
  name: 'Movement',
  priority: 0,
  
  fixedUpdate(world: World, dt: number) {
    for (const entity of world.query({ with: [Position, Velocity] })) {
      const pos = world.getComponent(entity, Position)!;
      const vel = world.getComponent(entity, Velocity)!;
      pos.x += vel.dx * dt;
      pos.y += vel.dy * dt;
    }
  }
};

const RenderSystem: System = {
  name: 'Render',
  priority: 1000,
  
  render(world: World) {
    const ctx = world.getResource<CanvasRenderingContext2D>(CanvasContextResource);
    if (!ctx) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    for (const entity of world.query({ with: [Position, Renderable] })) {
      const pos = world.getComponent(entity, Position)!;
      const render = world.getComponent(entity, Renderable)!;
      ctx.fillStyle = render.color;
      ctx.fillRect(pos.x, pos.y, render.size, render.size);
    }
  }
};

// ===== SETUP & RUN =====

const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

const world = new WorldImpl();
const scheduler = new SchedulerImpl();

// Register systems
scheduler.addSystem(MovementSystem);
scheduler.addSystem(RenderSystem);

// Spawn a player
const player = world.spawn();
world.addComponent(player, Position, new Position(400, 300));
world.addComponent(player, Velocity, new Velocity(50, 30));
world.addComponent(player, Renderable, new Renderable('#0f0', 32));

// Run!
const adapter = new WebCanvasAdapter({ canvas, world, scheduler });
adapter.run();
```

### Step 4: Run it

```bash
pnpm game my-game
```

### Step 5: Add a README and submit PR

Create `games/my-game/README.md`, then:

```bash
git add games/my-game
git commit -m "game: add my-game"
git push
# Open a PR!
```

---

## Structure

```
typescript/
├── packages/
│   ├── engine-abstractions/   # Public types and interfaces
│   ├── engine-core/           # ECS implementation (World, Scheduler)
│   └── plugin-host/           # Plugin loading and validation
├── adapters/
│   ├── adapter-null/          # Headless adapter for CI/testing
│   └── adapter-webcanvas/     # Browser canvas adapter
├── plugins/
│   └── _template/             # Copy this to create a new plugin
├── games/
│   ├── _template/             # Copy this to create a new game
│   ├── example-headless/      # Headless demo
│   └── example-web/           # Playable web demo
├── scripts/
│   └── run-game.js            # Game runner script
└── docs/                      # TypeScript-specific documentation
```

---

## Adding Mechanics to Your Game

Your game can define any mechanics you want. They live in your game folder.

### Components = Data

```typescript
// Simple component
class Health {
  constructor(public current: number = 100, public max: number = 100) {}
}

// Tag component (no data, just a marker)
const PlayerTag = Symbol('PlayerTag');
const EnemyTag = Symbol('EnemyTag');
```

### Systems = Logic

```typescript
const DamageSystem: System = {
  name: 'Damage',
  priority: 10,
  
  update(world: World, dt: number) {
    // Find all entities with Health
    for (const entity of world.query({ with: [Health] })) {
      const health = world.getComponent(entity, Health)!;
      
      // Kill entities with no health
      if (health.current <= 0) {
        world.despawn(entity);
      }
    }
  }
};
```

### System Phases

- **fixedUpdate** — Fixed timestep (60fps). Use for physics, collision.
- **update** — Variable timestep. Use for input, AI, game logic.
- **render** — After update. Use for drawing. Don't mutate state here.

### System Priority

Lower priority runs first:

```typescript
const InputSystem: System = { priority: -10 };    // Runs first
const MovementSystem: System = { priority: 0 };   // Runs second
const RenderSystem: System = { priority: 1000 };  // Runs last
```

---

## Creating a Plugin (Shared Mechanics)

If your mechanic would be useful in other games, make it a plugin:

```bash
cp -r plugins/_template plugins/my-plugin
```

Edit `plugins/my-plugin/plugin.json` and `src/index.ts`.

See [../docs/CONTRIBUTING.md](../docs/CONTRIBUTING.md) for the full guide.

---

## Golden Rules

1. **Core stays small.** New features begin life in `/plugins` or your game.
2. **No surprise breakage.** If your change breaks a game, fix or feature-flag.
3. **PRs are the docking port.** Main stays green.
4. **Plugins use public APIs only.** Only import from `@voltronussy/engine-abstractions`.

---

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design.

**Key concepts:**
- **Entity** — An opaque ID representing a game object
- **Component** — Plain data attached to entities (classes or symbols)
- **System** — Logic that operates on entities with specific components
- **World** — Container for all entities and components
- **Scheduler** — Runs systems in correct order and phases

---

## Read Next

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System design
- [PLUGINS.md](docs/PLUGINS.md) — Plugin system details
- [DEVPLAN.md](docs/DEVPLAN.md) — Development roadmap
- [/docs/CONTRIBUTING.md](/docs/CONTRIBUTING.md) — How to contribute

---

*Last updated: December 23, 2025*
