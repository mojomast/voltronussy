# My Game

> Replace this with a description of your game!

## How to Run

```bash
cd typescript
pnpm game my-game
```

## How to Play

- **Arrow keys / WASD** — Move
- (Add your controls here)

## Mechanics

This game includes the following custom mechanics:

- **Movement** — Entities with Position and Velocity move each frame
- (List your mechanics here)

## Screenshots

(Add screenshots if you want)

## Code Overview

### Components (Data)

| Component | Description |
|-----------|-------------|
| `Position` | X/Y coordinates |
| `Velocity` | Movement speed |
| (Add yours) | |

### Systems (Logic)

| System | Phase | Priority | Description |
|--------|-------|----------|-------------|
| `InputSystem` | update | -10 | Handles player input |
| `MovementSystem` | fixedUpdate | 0 | Moves entities |
| `RenderSystem` | render | 1000 | Draws entities |
| (Add yours) | | | |

## Want to reuse a mechanic?

If you've built something cool that other games could use, consider extracting it into a plugin:

```bash
cp -r plugins/_template plugins/my-mechanic
# Move your reusable code there
```

See [../../docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md) for the full guide.

## Credits

Made by [your-github-username]
