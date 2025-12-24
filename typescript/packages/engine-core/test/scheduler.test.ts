import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SchedulerImpl } from '../src/scheduler.js';
import { WorldImpl } from '../src/world.js';
import type { System, Scheduler, World } from '@voltronussy/engine-abstractions';

// Helper to create a mock system
function createMockSystem(name: string, priority = 0): System & {
  initCalls: number;
  fixedUpdateCalls: number;
  updateCalls: number;
  renderCalls: number;
  destroyCalls: number;
  callOrder: string[];
} {
  const system = {
    name,
    priority,
    initCalls: 0,
    fixedUpdateCalls: 0,
    updateCalls: 0,
    renderCalls: 0,
    destroyCalls: 0,
    callOrder: [] as string[],

    init(world: World) {
      system.initCalls++;
      system.callOrder.push('init');
    },
    fixedUpdate(world: World, dt: number) {
      system.fixedUpdateCalls++;
      system.callOrder.push('fixedUpdate');
    },
    update(world: World, dt: number) {
      system.updateCalls++;
      system.callOrder.push('update');
    },
    render(world: World, dt: number) {
      system.renderCalls++;
      system.callOrder.push('render');
    },
    destroy(world: World) {
      system.destroyCalls++;
      system.callOrder.push('destroy');
    },
  };
  return system;
}

describe('Scheduler - System Ordering', () => {
  let scheduler: Scheduler;
  let world: World;

  beforeEach(() => {
    scheduler = new SchedulerImpl();
    world = new WorldImpl();
  });

  it('should run systems in priority order (lower first)', () => {
    const order: string[] = [];

    const systemA: System = {
      name: 'A',
      priority: 10,
      update: () => order.push('A'),
    };
    const systemB: System = {
      name: 'B',
      priority: 5,
      update: () => order.push('B'),
    };
    const systemC: System = {
      name: 'C',
      priority: 15,
      update: () => order.push('C'),
    };

    scheduler.addSystem(systemA);
    scheduler.addSystem(systemB);
    scheduler.addSystem(systemC);
    scheduler.tick(world, 0.016);

    expect(order).toEqual(['B', 'A', 'C']);
  });

  it('should maintain stable order for equal priorities', () => {
    const order: string[] = [];

    const systemA: System = {
      name: 'A',
      priority: 0,
      update: () => order.push('A'),
    };
    const systemB: System = {
      name: 'B',
      priority: 0,
      update: () => order.push('B'),
    };
    const systemC: System = {
      name: 'C',
      priority: 0,
      update: () => order.push('C'),
    };

    scheduler.addSystem(systemA);
    scheduler.addSystem(systemB);
    scheduler.addSystem(systemC);

    // Run multiple times to ensure stability
    for (let i = 0; i < 5; i++) {
      order.length = 0;
      scheduler.tick(world, 0.016);
      expect(order).toEqual(['A', 'B', 'C']);
    }
  });

  it('should run phases in correct order: fixedUpdate, update, render', () => {
    const system = createMockSystem('test');
    scheduler.addSystem(system);

    // Simulate enough time for one fixed update
    scheduler.tick(world, 0.016);

    // Check phase order
    expect(system.callOrder).toEqual(['fixedUpdate', 'update', 'render']);
  });
});

describe('Scheduler - Fixed Timestep', () => {
  let scheduler: SchedulerImpl;
  let world: World;

  beforeEach(() => {
    scheduler = new SchedulerImpl({ fixedTimestep: 1 / 60 });
    world = new WorldImpl();
  });

  it('should run fixedUpdate at fixed intervals', () => {
    let fixedUpdateCount = 0;
    const system: System = {
      name: 'counter',
      fixedUpdate: () => fixedUpdateCount++,
    };

    scheduler.addSystem(system);

    // dt of 1/30 = 2x the fixed timestep
    scheduler.tick(world, 1 / 30);

    // Should have run twice
    expect(fixedUpdateCount).toBe(2);
  });

  it('should accumulate time across ticks', () => {
    let fixedUpdateCount = 0;
    const system: System = {
      name: 'counter',
      fixedUpdate: () => fixedUpdateCount++,
    };

    scheduler.addSystem(system);

    // Two ticks of half the timestep each
    scheduler.tick(world, 1 / 120);
    expect(fixedUpdateCount).toBe(0); // Not enough time yet

    scheduler.tick(world, 1 / 120);
    expect(fixedUpdateCount).toBe(1); // Now it runs
  });

  it('should cap accumulated time to prevent spiral of death', () => {
    let fixedUpdateCount = 0;
    const system: System = {
      name: 'counter',
      fixedUpdate: () => fixedUpdateCount++,
    };

    scheduler = new SchedulerImpl({
      fixedTimestep: 1 / 60,
      maxAccumulatedTime: 0.1, // Max 6 fixed updates
    });
    scheduler.addSystem(system);

    // Simulate a huge lag spike (1 second)
    scheduler.tick(world, 1.0);

    // Should be capped, not 60 updates
    expect(fixedUpdateCount).toBeLessThanOrEqual(6);
  });

  it('should only run update and render once per tick', () => {
    const system = createMockSystem('test');
    scheduler.addSystem(system);

    // dt that would trigger multiple fixedUpdates
    scheduler.tick(world, 1 / 20); // 3x the fixed timestep

    expect(system.fixedUpdateCalls).toBe(3);
    expect(system.updateCalls).toBe(1);
    expect(system.renderCalls).toBe(1);
  });
});

describe('Scheduler - Lifecycle', () => {
  let scheduler: Scheduler;
  let world: World;

  beforeEach(() => {
    scheduler = new SchedulerImpl();
    world = new WorldImpl();
  });

  it('should call init on all systems', () => {
    const system = createMockSystem('test');
    scheduler.addSystem(system);

    scheduler.init(world);

    expect(system.initCalls).toBe(1);
  });

  it('should call destroy on all systems', () => {
    const system = createMockSystem('test');
    scheduler.addSystem(system);

    scheduler.destroy(world);

    expect(system.destroyCalls).toBe(1);
  });

  it('should remove a system', () => {
    const system = createMockSystem('test');
    scheduler.addSystem(system);
    scheduler.removeSystem(system);

    scheduler.tick(world, 0.016);

    expect(system.updateCalls).toBe(0);
  });

  it('should handle systems without all methods', () => {
    const minimalSystem: System = {
      name: 'minimal',
      update: () => {}, // Only has update
    };

    scheduler.addSystem(minimalSystem);

    // Should not throw
    expect(() => {
      scheduler.init(world);
      scheduler.tick(world, 0.016);
      scheduler.destroy(world);
    }).not.toThrow();
  });
});
