import type { Adapter, Scheduler, World, InputState } from '@voltronussy/engine-abstractions';

/**
 * Options for the null adapter.
 */
export interface NullAdapterOptions {
  /** Fixed delta time per tick (default: 1/60) */
  fixedDt?: number;
  /** Maximum number of ticks to run (default: Infinity) */
  maxTicks?: number;
  /** Callback after each tick */
  onTick?: (tickNumber: number, dt: number) => void;
  /** Callback when loop stops */
  onStop?: () => void;
}

/**
 * Null adapter for headless execution.
 * Useful for testing, CI, and simulations without rendering.
 */
export class NullAdapter implements Adapter {
  readonly name = 'null';

  private options: Required<NullAdapterOptions>;
  private running = false;
  private tickCount = 0;

  constructor(options: NullAdapterOptions = {}) {
    this.options = {
      fixedDt: options.fixedDt ?? 1 / 60,
      maxTicks: options.maxTicks ?? Infinity,
      onTick: options.onTick ?? (() => {}),
      onStop: options.onStop ?? (() => {}),
    };
  }

  init(world: World): void {
    // Nothing to initialize for null adapter
  }

  start(scheduler: Scheduler, world: World): void {
    this.running = true;
    this.tickCount = 0;

    scheduler.init(world);

    while (this.running && this.tickCount < this.options.maxTicks) {
      scheduler.tick(world, this.options.fixedDt);
      this.tickCount++;
      this.options.onTick(this.tickCount, this.options.fixedDt);
    }

    if (!this.running) {
      this.options.onStop();
    }
  }

  stop(): void {
    this.running = false;
  }

  destroy(): void {
    this.running = false;
  }

  /**
   * Get the number of ticks executed.
   */
  getTickCount(): number {
    return this.tickCount;
  }
}

/**
 * Null input state - always returns false/null.
 */
export class NullInputState implements InputState {
  isKeyDown(_key: string): boolean {
    return false;
  }

  isKeyPressed(_key: string): boolean {
    return false;
  }

  isKeyReleased(_key: string): boolean {
    return false;
  }

  getPointerPosition(): { x: number; y: number } | null {
    return null;
  }

  isPointerDown(): boolean {
    return false;
  }
}

/**
 * Run a simulation for a fixed number of ticks.
 * Convenience function for testing.
 */
export function runSimulation(
  scheduler: Scheduler,
  world: World,
  ticks: number,
  dt = 1 / 60
): void {
  const adapter = new NullAdapter({ maxTicks: ticks, fixedDt: dt });
  adapter.start(scheduler, world);
}
