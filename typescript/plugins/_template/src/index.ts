/**
 * Plugin Template
 *
 * This is the entry point for your plugin.
 * Plugins export reusable components and systems that games can import.
 *
 * HOW PLUGINS WORK:
 * ─────────────────
 * 1. Plugins export Components (data) and Systems (logic)
 * 2. Games import and use them like any other module
 * 3. The plugin.json file describes metadata and dependencies
 *
 * Games can use your plugin by:
 * 1. Adding it to their game.json plugins array
 * 2. Importing components/systems: import { Health } from '@voltronussy/my-plugin'
 *
 * RULES:
 * ──────
 * - Only import from @voltronussy/engine-abstractions (never engine-core)
 * - Don't use global state that affects other games
 * - Namespace your components and systems
 * - Prefer additive changes over breaking changes
 */

import type { Plugin, PluginRegistry, System, World, Component } from '@voltronussy/engine-abstractions';

// =============================================================================
// Components — EXPORTED FOR GAMES TO USE
// =============================================================================

/**
 * Example component — replace with your own!
 *
 * Games will import and use this:
 *   import { MyComponent } from '@voltronussy/my-plugin';
 *   world.addComponent(entity, MyComponent, new MyComponent(42));
 */
export class MyComponent implements Component {
  constructor(public value: number = 0) {}
}

// =============================================================================
// Systems — EXPORTED FOR GAMES TO USE
// =============================================================================

/**
 * Example system — replace with your own!
 *
 * Games will import and register this:
 *   import { MySystem } from '@voltronussy/my-plugin';
 *   scheduler.addSystem(MySystem);
 */
export const MySystem: System = {
  name: 'MySystem',
  priority: 0,

  init(world: World) {
    console.log('MySystem initialized!');
  },

  update(world: World, dt: number) {
    const entities = world.query({ with: [MyComponent] });

    for (const entity of entities) {
      const component = world.getComponent(entity, MyComponent)!;
      // Do something with the component
      component.value += dt;
    }
  },
};

// =============================================================================
// Plugin Registration — FOR THE PLUGIN HOST
// =============================================================================

/**
 * The plugin object that will be loaded by the plugin host.
 *
 * This is used by the engine's plugin system for:
 * - Automatic component/system registration
 * - Dependency resolution
 * - Editor/tooling support
 *
 * Games can also import components/systems directly without using the registry.
 */
const plugin: Plugin = {
  register(registry: PluginRegistry) {
    // Register component types (for serialization, editor support, etc.)
    registry.registerComponentType(MyComponent, 'MyComponent');

    // Register systems
    registry.registerSystem(MySystem);

    console.log('Plugin template registered!');
  },
};

export default plugin;

// Also export register function for direct usage
export const register = plugin.register;
