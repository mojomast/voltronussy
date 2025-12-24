# Example Headless Game

A minimal headless game demonstrating the Voltronussy engine.

## What It Does

- Creates entities with Position and Velocity components
- Runs a movement system that updates positions
- Logs state every few ticks
- Runs for 100 ticks and exits

## Running

```bash
cd typescript
pnpm game example-headless
```

## Why Headless?

Headless games are useful for:
- Testing engine features
- CI validation
- Benchmarking
- Simulations without graphics
