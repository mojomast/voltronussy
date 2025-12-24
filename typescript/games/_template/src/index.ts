/**
 * My Game - Entry Point
 *
 * This is the main entry point for your game.
 * Edit this file to set up your game!
 *
 * HOW PATCHES WORK:
 * ─────────────────
 * Your game can have any mechanics you want. They're called "patches" and
 * they live right here in your game folder. The pattern is:
 *
 * 1. Components = Data
 *    Classes that hold data (Position, Health, Velocity, etc.)
 *
 * 2. Systems = Logic
 *    Functions that process entities with specific components.
 *    They run each frame in three phases:
 *    - fixedUpdate: Fixed timestep (physics, collision)
 *    - update: Variable timestep (input, AI)
 *    - render: Drawing (don't mutate state here)
 *
 * 3. Register & Use
 *    scheduler.addSystem(YourSystem);
 *    world.addComponent(entity, YourComponent, new YourComponent());
 *
 * WANT TO SHARE A MECHANIC?
 * ─────────────────────────
 * If you build something useful for other games, extract it into a plugin:
 *   cp -r plugins/_template plugins/my-mechanic
 * See docs/CONTRIBUTING.md for details.
 */

import { WorldImpl, SchedulerImpl } from '@voltronussy/engine-core';
import { WebCanvasAdapter, CanvasContextResource, InputStateResource } from '@voltronussy/adapter-webcanvas';
import type { System, World, InputState } from '@voltronussy/engine-abstractions';

// =============================================================================
// Components — YOUR DATA
// =============================================================================

// Components are just classes that hold data. Create as many as you need!
// The engine doesn't care what they look like — you define the structure.

class Position {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {}
}

class Velocity {
  constructor(
    public dx: number = 0,
    public dy: number = 0
  ) {}
}

class Renderable {
  constructor(
    public width: number = 32,
    public height: number = 32,
    public color: string = '#fff'
  ) {}
}

// TIP: Add more components for your mechanics!
// Examples:
//   class Health { constructor(public current = 100, public max = 100) {} }
//   class Damage { constructor(public amount = 10) {} }
//   const PlayerTag = Symbol('PlayerTag');  // Tag component (no data)

// =============================================================================
// Systems — YOUR LOGIC
// =============================================================================

// Systems process entities that have specific components.
// They run in phases: fixedUpdate → update → render
// Lower priority numbers run first.

/**
 * Moves entities based on their velocity.
 * Runs in fixedUpdate for consistent physics regardless of framerate.
 */
const MovementSystem: System = {
  name: 'Movement',
  priority: 0,

  fixedUpdate(world: World, dt: number) {
    const entities = world.query({ with: [Position, Velocity] });

    for (const entity of entities) {
      const pos = world.getComponent(entity, Position)!;
      const vel = world.getComponent(entity, Velocity)!;

      pos.x += vel.dx * dt;
      pos.y += vel.dy * dt;
    }
  },
};

/**
 * Handles keyboard input to move the player.
 */
const InputSystem: System = {
  name: 'Input',
  priority: -10, // Run before movement

  update(world: World, _dt: number) {
    const input = world.getResource<InputState>(InputStateResource);
    if (!input) return;

    // Find player entity (first entity with velocity)
    const entities = world.query({ with: [Velocity] });
    const player = entities.toArray()[0];
    if (!player) return;

    const vel = world.getComponent(player, Velocity)!;
    const speed = 200;

    vel.dx = 0;
    vel.dy = 0;

    if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) {
      vel.dx = -speed;
    }
    if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) {
      vel.dx = speed;
    }
    if (input.isKeyDown('ArrowUp') || input.isKeyDown('KeyW')) {
      vel.dy = -speed;
    }
    if (input.isKeyDown('ArrowDown') || input.isKeyDown('KeyS')) {
      vel.dy = speed;
    }
  },
};

/**
 * Renders entities with Position and Renderable components.
 */
const RenderSystem: System = {
  name: 'Render',
  priority: 100, // Run last

  render(world: World, _dt: number) {
    const ctx = world.getResource<CanvasRenderingContext2D>(CanvasContextResource);
    if (!ctx) return;

    const entities = world.query({ with: [Position, Renderable] });

    for (const entity of entities) {
      const pos = world.getComponent(entity, Position)!;
      const render = world.getComponent(entity, Renderable)!;

      ctx.fillStyle = render.color;
      ctx.fillRect(
        pos.x - render.width / 2,
        pos.y - render.height / 2,
        render.width,
        render.height
      );
    }
  },
};

// =============================================================================
// Game Setup — SPAWN YOUR ENTITIES
// =============================================================================

function setupGame(world: World) {
  // Create player entity
  const player = world.spawn();
  world.addComponent(player, Position, new Position(400, 300));
  world.addComponent(player, Velocity, new Velocity(0, 0));
  world.addComponent(player, Renderable, new Renderable(32, 32, '#00ff00'));

  // TIP: Add more entities here!
  // Example: Spawn some enemies
  //
  // for (let i = 0; i < 5; i++) {
  //   const enemy = world.spawn();
  //   world.addComponent(enemy, Position, new Position(Math.random() * 800, Math.random() * 600));
  //   world.addComponent(enemy, Health, new Health(50, 50));
  //   world.addComponent(enemy, EnemyTag, true);
  // }
}

// =============================================================================
// Main — WIRE EVERYTHING TOGETHER
// =============================================================================

function main() {
  // Create world and scheduler
  const world = new WorldImpl();
  const scheduler = new SchedulerImpl();

  // Register your systems (order determined by priority, not registration order)
  scheduler.addSystem(InputSystem);
  scheduler.addSystem(MovementSystem);
  scheduler.addSystem(RenderSystem);

  // TIP: Add your custom systems here!
  // scheduler.addSystem(HealthSystem);
  // scheduler.addSystem(CollisionSystem);

  // Create adapter
  const adapter = new WebCanvasAdapter({
    canvas: '#game-canvas',
    width: 800,
    height: 600,
    backgroundColor: '#1a1a2e',
  });

  // Initialize
  adapter.init(world);
  setupGame(world);

  // Start game loop
  adapter.start(scheduler, world);
}

// Wait for DOM to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
