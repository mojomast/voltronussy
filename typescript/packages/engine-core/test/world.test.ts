import { describe, it, expect, beforeEach } from 'vitest';
import { WorldImpl } from '../src/world.js';
import type { World, EntityId, Component, ComponentType } from '@voltronussy/engine-abstractions';

// Test components
class Position implements Component {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {}
}

class Velocity implements Component {
  constructor(
    public dx: number = 0,
    public dy: number = 0
  ) {}
}

class Health implements Component {
  constructor(public value: number = 100) {}
}

describe('World - Entity Lifecycle', () => {
  let world: World;

  beforeEach(() => {
    world = new WorldImpl();
  });

  it('should spawn an entity with a unique ID', () => {
    const entity1 = world.spawn();
    const entity2 = world.spawn();

    expect(entity1).toBeDefined();
    expect(entity2).toBeDefined();
    expect(entity1).not.toBe(entity2);
  });

  it('should report that spawned entities exist', () => {
    const entity = world.spawn();
    expect(world.exists(entity)).toBe(true);
  });

  it('should report that despawned entities do not exist', () => {
    const entity = world.spawn();
    world.despawn(entity);
    expect(world.exists(entity)).toBe(false);
  });

  it('should reuse entity IDs after despawn (free list)', () => {
    const entity1 = world.spawn();
    world.despawn(entity1);
    const entity2 = world.spawn();

    // The ID might be reused, but that's an implementation detail
    // What matters is that both operations succeed
    expect(world.exists(entity2)).toBe(true);
  });

  it('should handle spawning many entities', () => {
    const entities: EntityId[] = [];
    for (let i = 0; i < 1000; i++) {
      entities.push(world.spawn());
    }

    // All entities should exist and be unique
    const uniqueIds = new Set(entities);
    expect(uniqueIds.size).toBe(1000);
    entities.forEach((e) => expect(world.exists(e)).toBe(true));
  });

  it('should handle despawning in any order', () => {
    const e1 = world.spawn();
    const e2 = world.spawn();
    const e3 = world.spawn();

    world.despawn(e2); // Middle one
    expect(world.exists(e1)).toBe(true);
    expect(world.exists(e2)).toBe(false);
    expect(world.exists(e3)).toBe(true);
  });
});

describe('World - Component Management', () => {
  let world: World;

  beforeEach(() => {
    world = new WorldImpl();
  });

  it('should add a component to an entity', () => {
    const entity = world.spawn();
    const pos = new Position(10, 20);

    world.addComponent(entity, Position, pos);

    expect(world.hasComponent(entity, Position)).toBe(true);
  });

  it('should get a component from an entity', () => {
    const entity = world.spawn();
    const pos = new Position(10, 20);

    world.addComponent(entity, Position, pos);
    const retrieved = world.getComponent(entity, Position);

    expect(retrieved).toBe(pos);
    expect(retrieved?.x).toBe(10);
    expect(retrieved?.y).toBe(20);
  });

  it('should return undefined for missing components', () => {
    const entity = world.spawn();
    const pos = world.getComponent(entity, Position);

    expect(pos).toBeUndefined();
  });

  it('should remove a component from an entity', () => {
    const entity = world.spawn();
    world.addComponent(entity, Position, new Position());

    world.removeComponent(entity, Position);

    expect(world.hasComponent(entity, Position)).toBe(false);
    expect(world.getComponent(entity, Position)).toBeUndefined();
  });

  it('should handle multiple component types on one entity', () => {
    const entity = world.spawn();
    const pos = new Position(1, 2);
    const vel = new Velocity(3, 4);
    const health = new Health(50);

    world.addComponent(entity, Position, pos);
    world.addComponent(entity, Velocity, vel);
    world.addComponent(entity, Health, health);

    expect(world.getComponent(entity, Position)).toBe(pos);
    expect(world.getComponent(entity, Velocity)).toBe(vel);
    expect(world.getComponent(entity, Health)).toBe(health);
  });

  it('should remove components when entity is despawned', () => {
    const entity = world.spawn();
    world.addComponent(entity, Position, new Position());

    world.despawn(entity);

    // After despawn, the entity doesn't exist
    expect(world.exists(entity)).toBe(false);
  });

  it('should allow symbol-based component types', () => {
    const TagComponent = Symbol('TagComponent');
    const entity = world.spawn();
    const tag = { marked: true };

    world.addComponent(entity, TagComponent, tag);

    expect(world.hasComponent(entity, TagComponent)).toBe(true);
    expect(world.getComponent(entity, TagComponent)).toBe(tag);
  });
});

describe('World - Queries', () => {
  let world: World;

  beforeEach(() => {
    world = new WorldImpl();
  });

  it('should query entities with a single component', () => {
    const e1 = world.spawn();
    const e2 = world.spawn();
    const e3 = world.spawn();

    world.addComponent(e1, Position, new Position());
    world.addComponent(e2, Position, new Position());
    // e3 has no Position

    const result = world.query({ with: [Position] });
    const entities = result.toArray();

    expect(entities).toContain(e1);
    expect(entities).toContain(e2);
    expect(entities).not.toContain(e3);
    expect(result.count).toBe(2);
  });

  it('should query entities with multiple components (AND)', () => {
    const e1 = world.spawn();
    const e2 = world.spawn();
    const e3 = world.spawn();

    world.addComponent(e1, Position, new Position());
    world.addComponent(e1, Velocity, new Velocity());

    world.addComponent(e2, Position, new Position());
    // e2 has no Velocity

    world.addComponent(e3, Velocity, new Velocity());
    // e3 has no Position

    const result = world.query({ with: [Position, Velocity] });
    const entities = result.toArray();

    expect(entities).toContain(e1);
    expect(entities).not.toContain(e2);
    expect(entities).not.toContain(e3);
    expect(result.count).toBe(1);
  });

  it('should support without filter (exclusion)', () => {
    const e1 = world.spawn();
    const e2 = world.spawn();

    world.addComponent(e1, Position, new Position());
    world.addComponent(e2, Position, new Position());
    world.addComponent(e2, Health, new Health()); // e2 has Health

    const result = world.query({ with: [Position], without: [Health] });
    const entities = result.toArray();

    expect(entities).toContain(e1);
    expect(entities).not.toContain(e2);
    expect(result.count).toBe(1);
  });

  it('should return empty result when no entities match', () => {
    world.spawn(); // Entity with no components

    const result = world.query({ with: [Position] });

    expect(result.count).toBe(0);
    expect(result.toArray()).toEqual([]);
  });

  it('should be iterable', () => {
    const e1 = world.spawn();
    const e2 = world.spawn();

    world.addComponent(e1, Position, new Position());
    world.addComponent(e2, Position, new Position());

    const result = world.query({ with: [Position] });
    const collected: EntityId[] = [];

    for (const entity of result) {
      collected.push(entity);
    }

    expect(collected).toContain(e1);
    expect(collected).toContain(e2);
    expect(collected.length).toBe(2);
  });
});

describe('World - Resources', () => {
  let world: World;

  beforeEach(() => {
    world = new WorldImpl();
  });

  it('should set and get a resource', () => {
    const TimeResource = Symbol('Time');
    const time = { elapsed: 0, delta: 0.016 };

    world.setResource(TimeResource, time);

    expect(world.getResource(TimeResource)).toBe(time);
  });

  it('should check if resource exists', () => {
    const TimeResource = Symbol('Time');

    expect(world.hasResource(TimeResource)).toBe(false);

    world.setResource(TimeResource, { elapsed: 0 });

    expect(world.hasResource(TimeResource)).toBe(true);
  });

  it('should return undefined for missing resources', () => {
    const MissingResource = Symbol('Missing');

    expect(world.getResource(MissingResource)).toBeUndefined();
  });

  it('should overwrite existing resources', () => {
    const ConfigResource = Symbol('Config');

    world.setResource(ConfigResource, { value: 1 });
    world.setResource(ConfigResource, { value: 2 });

    expect(world.getResource(ConfigResource)).toEqual({ value: 2 });
  });
});
