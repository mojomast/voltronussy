/**
 * Example Headless Game
 *
 * Demonstrates the engine running without any graphics.
 * Useful for testing and CI.
 */

import { WorldImpl, SchedulerImpl } from '@voltronussy/engine-core';
import { NullAdapter } from '@voltronussy/adapter-null';
import type { System, World, EntityId } from '@voltronussy/engine-abstractions';

// =============================================================================
// Components
// =============================================================================

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

class Name {
  constructor(public value: string = 'Entity') {}
}

// =============================================================================
// Systems
// =============================================================================

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

// Tracks tick count
let tickCount = 0;

const LoggingSystem: System = {
  name: 'Logging',
  priority: 100,

  update(world: World, _dt: number) {
    tickCount++;

    // Log every 20 ticks
    if (tickCount % 20 === 0) {
      console.log(`\n--- Tick ${tickCount} ---`);

      const entities = world.query({ with: [Position, Name] });
      for (const entity of entities) {
        const pos = world.getComponent(entity, Position)!;
        const name = world.getComponent(entity, Name)!;
        console.log(`  ${name.value}: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`);
      }
    }
  },
};

// =============================================================================
// Game Setup
// =============================================================================

function setupGame(world: World): EntityId[] {
  const entities: EntityId[] = [];

  // Create some entities with different velocities
  const entity1 = world.spawn();
  world.addComponent(entity1, Position, new Position(0, 0));
  world.addComponent(entity1, Velocity, new Velocity(10, 5));
  world.addComponent(entity1, Name, new Name('Mover A'));
  entities.push(entity1);

  const entity2 = world.spawn();
  world.addComponent(entity2, Position, new Position(100, 100));
  world.addComponent(entity2, Velocity, new Velocity(-5, 10));
  world.addComponent(entity2, Name, new Name('Mover B'));
  entities.push(entity2);

  const entity3 = world.spawn();
  world.addComponent(entity3, Position, new Position(50, 50));
  // No velocity - this entity is static
  world.addComponent(entity3, Name, new Name('Static'));
  entities.push(entity3);

  return entities;
}

// =============================================================================
// Main
// =============================================================================

function main() {
  console.log('=== Voltronussy Headless Example ===\n');
  console.log('Running 100 ticks of simulation...\n');

  // Create world and scheduler
  const world = new WorldImpl();
  const scheduler = new SchedulerImpl({ fixedTimestep: 1 / 60 });

  // Add systems
  scheduler.addSystem(MovementSystem);
  scheduler.addSystem(LoggingSystem);

  // Setup game
  const entities = setupGame(world);
  console.log(`Created ${entities.length} entities`);

  // Create null adapter for headless execution
  const adapter = new NullAdapter({
    maxTicks: 100,
    fixedDt: 1 / 60,
    onStop: () => {
      console.log('\n=== Simulation Complete ===');
      console.log(`Total ticks: ${adapter.getTickCount()}`);
    },
  });

  // Initialize and run
  adapter.init(world);
  adapter.start(scheduler, world);
}

main();
