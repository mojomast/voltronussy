import type {
  System,
  Scheduler,
  SchedulerConfig,
  World,
} from '@voltronussy/engine-abstractions';

/**
 * Default scheduler configuration.
 */
const DEFAULT_CONFIG: Required<SchedulerConfig> = {
  fixedTimestep: 1 / 60, // 60 Hz
  maxAccumulatedTime: 0.25, // Prevent spiral of death
};

/**
 * Scheduler implementation with fixed and variable timestep phases.
 */
export class SchedulerImpl implements Scheduler {
  private systems: System[] = [];
  private sortedSystems: System[] = [];
  private needsSort = false;
  private accumulator = 0;
  private config: Required<SchedulerConfig>;

  constructor(config: SchedulerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  addSystem(system: System): void {
    this.systems.push(system);
    this.needsSort = true;
  }

  removeSystem(system: System): void {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems.splice(index, 1);
      this.needsSort = true;
    }
  }

  init(world: World): void {
    this.ensureSorted();
    for (const system of this.sortedSystems) {
      system.init?.(world);
    }
  }

  destroy(world: World): void {
    for (const system of this.sortedSystems) {
      system.destroy?.(world);
    }
  }

  tick(world: World, dt: number): void {
    this.ensureSorted();

    // Accumulate time for fixed updates
    this.accumulator += dt;

    // Cap accumulated time to prevent spiral of death
    if (this.accumulator > this.config.maxAccumulatedTime) {
      this.accumulator = this.config.maxAccumulatedTime;
    }

    // Run fixed updates
    const fixedDt = this.config.fixedTimestep;
    while (this.accumulator >= fixedDt) {
      for (const system of this.sortedSystems) {
        system.fixedUpdate?.(world, fixedDt);
      }
      this.accumulator -= fixedDt;
    }

    // Run variable update (once per frame)
    for (const system of this.sortedSystems) {
      system.update?.(world, dt);
    }

    // Run render (once per frame)
    for (const system of this.sortedSystems) {
      system.render?.(world, dt);
    }
  }

  private ensureSorted(): void {
    if (this.needsSort) {
      // Stable sort by priority (lower first)
      this.sortedSystems = [...this.systems].sort((a, b) => {
        const priorityA = a.priority ?? 0;
        const priorityB = b.priority ?? 0;
        return priorityA - priorityB;
      });
      this.needsSort = false;
    }
  }
}
