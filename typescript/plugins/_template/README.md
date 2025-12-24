# My Plugin

> Replace this with a description of your plugin!

## What This Plugin Provides

- **MyComponent** — (describe what it stores)
- **MySystem** — (describe what it does)

## Installation

1. Add to your game's `game.json`:
   ```json
   {
     "plugins": ["voltronussy.my-plugin"]
   }
   ```

2. Import and use in your game:
   ```typescript
   import { MyComponent, MySystem } from '@voltronussy/my-plugin';
   
   // Add the system
   scheduler.addSystem(MySystem);
   
   // Use the component
   const entity = world.spawn();
   world.addComponent(entity, MyComponent, new MyComponent(42));
   ```

## API Reference

### Components

#### `MyComponent`

```typescript
class MyComponent {
  constructor(public value: number = 0);
}
```

Stores... (describe it)

### Systems

#### `MySystem`

- **Phase:** `update`
- **Priority:** `0`

Does... (describe it)

## Configuration

(Describe any configuration options, or remove this section)

## Examples

See `games/example-web` for a game using this plugin.

## Changelog

### 0.1.0

- Initial release
