# Contributing to Voltronussy

Welcome! This guide explains how to add your game (and mechanics) to the repo.

---

## The 5-Minute Version

```bash
# 1. Clone and install
git clone https://github.com/kylebjordahl/voltronussy.git
cd voltronussy/typescript
pnpm install

# 2. Copy the game template
cp -r games/_template games/my-game

# 3. Edit games/my-game/game.json (update id, name, author)
# 4. Edit games/my-game/src/index.ts (add your mechanics!)

# 5. Run it
pnpm game my-game

# 6. Test everything
pnpm test

# 7. Commit and push (only your game folder)
git add games/my-game
git commit -m "game: add my-game"
git push origin my-game

# 8. Open a PR!
```

---

## Understanding the Architecture

When you create a game, you're working with:

- **Entities** — Unique IDs for game objects (players, enemies, bullets)
- **Components** — Data attached to entities (Position, Health, Sprite)
- **Systems** — Logic that runs on entities with specific components

The engine provides the infrastructure. **You provide the mechanics.**

```typescript
// Your game defines components (data)
class Position { constructor(public x = 0, public y = 0) {} }
class Velocity { constructor(public dx = 0, public dy = 0) {} }

// Your game defines systems (logic)
const MovementSystem: System = {
  name: 'Movement',
  fixedUpdate(world, dt) {
    for (const entity of world.query({ with: [Position, Velocity] })) {
      const pos = world.getComponent(entity, Position)!;
      const vel = world.getComponent(entity, Velocity)!;
      pos.x += vel.dx * dt;
      pos.y += vel.dy * dt;
    }
  }
};

// Register and use
scheduler.addSystem(MovementSystem);
const player = world.spawn();
world.addComponent(player, Position, new Position(100, 100));
world.addComponent(player, Velocity, new Velocity(10, 0));
```

---

## The Golden Rule: Folder Isolation

**Your PR should only touch YOUR folder:**

| You're adding... | You should only touch... |
|------------------|--------------------------|
| A new game | `games/your-game/` |
| A new plugin | `plugins/your-plugin/` |
| A new adapter | `adapters/your-adapter/` |
| Engine changes | `packages/*` (requires coordination) |

If your PR touches multiple areas, you probably need to split it.

---

## PR Checklist

Before submitting, ensure:

- [ ] CI passes (build + tests)
- [ ] PR template is filled out completely
- [ ] Your changes are isolated to the correct folder
- [ ] You've tested locally with `pnpm test`
- [ ] If plugin: `plugin.json` is valid and complete
- [ ] If game: `game.json` is valid and has a README
- [ ] If engine change: `engineApiVersion` is updated if breaking

---

## Running Tests Locally

### TypeScript (Primary)

```bash
cd typescript

# Install dependencies
pnpm install

# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @voltronussy/engine-core test

# Run linting
pnpm lint

# Build everything
pnpm build
```

### Python (Experimental)

```bash
cd python

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run linting
ruff check .
```

---

## Adding a New Game

### Step 1: Copy the template

```bash
cd typescript
cp -r games/_template games/my-game
```

### Step 2: Configure your game

Edit `games/my-game/game.json`:

```json
{
  "id": "my-game",
  "name": "My Cool Game",
  "version": "0.1.0",
  "engineApiVersion": "0.1",
  "author": "your-github-username",
  "description": "A short description of your game",
  "adapter": "adapter-webcanvas",
  "plugins": []
}
```

### Step 3: Add your mechanics (patches)

Your game's mechanics live in `games/my-game/src/`. Here's the pattern:

#### Define Components (your data)

```typescript
// games/my-game/src/index.ts

// Position component
class Position {
  constructor(public x: number = 0, public y: number = 0) {}
}

// Velocity component
class Velocity {
  constructor(public dx: number = 0, public dy: number = 0) {}
}

// Health component for a health system
class Health {
  constructor(public current: number = 100, public max: number = 100) {}
}

// Tag components for entity types
const PlayerTag = Symbol('PlayerTag');
const EnemyTag = Symbol('EnemyTag');
const BulletTag = Symbol('BulletTag');
```

#### Define Systems (your logic)

```typescript
// Movement system - runs physics
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

// Health system - handles damage and death
const HealthSystem: System = {
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

// Input system - player controls
const InputSystem: System = {
  name: 'Input',
  priority: -10, // Run before movement

  update(world: World, dt: number) {
    const input = world.getResource<InputState>(InputStateResource);
    if (!input) return;

    for (const entity of world.query({ with: [Velocity, PlayerTag] })) {
      const vel = world.getComponent(entity, Velocity)!;
      const speed = 200;

      vel.dx = 0;
      vel.dy = 0;

      if (input.isKeyDown('ArrowLeft')) vel.dx = -speed;
      if (input.isKeyDown('ArrowRight')) vel.dx = speed;
      if (input.isKeyDown('ArrowUp')) vel.dy = -speed;
      if (input.isKeyDown('ArrowDown')) vel.dy = speed;
    }
  }
};
```

#### Register everything and spawn entities

```typescript
// Create world and scheduler
const world = new WorldImpl();
const scheduler = new SchedulerImpl();

// Register systems
scheduler.addSystem(InputSystem);
scheduler.addSystem(MovementSystem);
scheduler.addSystem(HealthSystem);
scheduler.addSystem(RenderSystem);

// Spawn the player
const player = world.spawn();
world.addComponent(player, Position, new Position(400, 300));
world.addComponent(player, Velocity, new Velocity(0, 0));
world.addComponent(player, Health, new Health(100, 100));
world.addComponent(player, PlayerTag, true);

// Spawn some enemies
for (let i = 0; i < 5; i++) {
  const enemy = world.spawn();
  world.addComponent(enemy, Position, new Position(Math.random() * 800, Math.random() * 600));
  world.addComponent(enemy, Health, new Health(50, 50));
  world.addComponent(enemy, EnemyTag, true);
}

// Run the game
const adapter = new WebCanvasAdapter({ canvas, world, scheduler });
adapter.run();
```

### Step 4: Test locally

```bash
cd typescript
pnpm game my-game
```

This opens your game in the browser. Use the devtools console to debug.

### Step 5: Write a README

Create `games/my-game/README.md`:

```markdown
# My Game

> A short description

## How to Play

- Arrow keys to move
- Space to shoot
- etc.

## Screenshots

(optional but nice)

## Credits

Made by your-github-username
```

### Step 6: Submit PR

```bash
git add games/my-game
git commit -m "game: add my-game"
git push origin my-game
```

Then open a PR with:
- Title: `game: add my-game`
- Fill out the PR template
- Only touch `games/my-game/`

### Acceptance Criteria

- [ ] Game runs without errors
- [ ] Game doesn't break other games (CI passes)
- [ ] Has a README
- [ ] No secrets or API keys
- [ ] Uses only stable plugins (or bundles experimental ones)
- [ ] PR only touches `games/my-game/`

---

## Extracting Patches into Plugins

If you've built a mechanic in your game that would be useful to others, you can extract it into a **plugin**.

### When to make a plugin

| Keep in your game | Extract to a plugin |
|-------------------|---------------------|
| Mechanic is specific to your game | Mechanic is reusable |
| Tightly coupled to your game logic | Can work in any game |
| Experimental, still changing | Stable and tested |

### How to extract

1. **Create the plugin folder:**
   ```bash
   cp -r plugins/_template plugins/my-feature
   ```

2. **Move your reusable code:**
   ```typescript
   // plugins/my-feature/src/index.ts
   
   // Export your components
   export class Health {
     constructor(public current: number = 100, public max: number = 100) {}
   }
   
   // Export your systems
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
   
   // Plugin registration
   const plugin: Plugin = {
     register(registry: PluginRegistry) {
       registry.registerComponentType(Health, 'Health');
       registry.registerSystem(HealthSystem);
     }
   };
   export default plugin;
   ```

3. **Update plugin.json:**
   ```json
   {
     "id": "voltronussy.health",
     "name": "Health System",
     "version": "0.1.0",
     "engineApiVersion": "0.1",
     "status": "experimental",
     "tags": ["gameplay", "damage"],
     "dependsOn": [],
     "capabilities": ["health.damage", "health.death"]
   }
   ```

4. **Use it in your game:**
   ```typescript
   // games/my-game/game.json
   {
     "plugins": ["voltronussy.health"]
   }
   
   // games/my-game/src/index.ts
   import { Health, HealthSystem } from '@voltronussy/health';
   
   scheduler.addSystem(HealthSystem);
   world.addComponent(player, Health, new Health(100, 100));
   ```

5. **Submit two PRs:**
   - One for `plugins/my-feature/`
   - One for updating your game to use the plugin

---

## Adding a New Plugin (From Scratch)

### Step 1: Copy the template

```bash
cp -r typescript/plugins/_template typescript/plugins/my-feature
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

**Status values:**
- `experimental` — New, may change
- `stable` — Proven, safe to depend on
- `deprecated` — Being phased out

### Step 3: Implement

- Export components and systems
- Export a `register(registry)` function for the plugin host
- Only import from `@voltronussy/engine-abstractions`
- Never reach into engine internals

### Step 4: Add tests

```bash
# Your tests go in plugins/my-feature/test/
pnpm --filter ./plugins/my-feature test
```

### Step 5: Use it in a game

Create or modify a game to use your plugin. This proves it works.

### Step 6: Submit PR

- Title: `plugin: add my-feature`
- Fill out the PR template
- Only touch `plugins/my-feature/`

---

## Proposing Engine Changes

Engine changes (`packages/*`) are more sensitive. They need coordination.

### Process

1. **Open an issue first** with label `patch:proposal`
2. Describe the change and why it's needed
3. Wait for maintainer feedback
4. If accepted, it becomes `patch:accepted`
5. Implement as a plugin first if possible
6. Submit PR with tests and migration notes

### Breaking Changes

If your change:
- Removes or renames a public API
- Changes behavior that games depend on
- Requires games to update their code

Then you must:
1. Bump `engineApiVersion`
2. Add migration notes to the PR
3. Update all sample games to work with the new version

---

## Commit Message Format

We keep it simple:

```
<type>: <short description>

<optional body>
```

Types:
- `game:` — Game changes
- `plugin:` — Plugin changes
- `engine:` — Core engine changes
- `adapter:` — Adapter changes
- `docs:` — Documentation
- `ci:` — CI/build changes
- `fix:` — Bug fixes

Examples:
```
game: add space-shooter game
plugin: add aabb-collision with basic physics
engine: add query caching for performance
fix: resolve entity id recycling bug
```

---

## Code Style

### TypeScript

- Use strict TypeScript (no `any` unless absolutely necessary)
- Prefer `interface` over `type` for public APIs
- Use `readonly` for immutable data
- Run `pnpm lint` before committing

### Python

- Use type hints everywhere
- Prefer `dataclass` for components
- Use `Protocol` for abstractions
- Run `ruff check .` before committing

---

## Getting Help

- Open a Discussion for questions
- Tag `@maintainers` in your PR if stuck
- Check existing games/plugins for examples

---

*Keep it small. Keep it fun. Ship games.*
