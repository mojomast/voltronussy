import type { Adapter, Scheduler, World, InputState } from '@voltronussy/engine-abstractions';

/**
 * Options for the web canvas adapter.
 */
export interface WebCanvasAdapterOptions {
  /** Canvas element or selector */
  canvas: HTMLCanvasElement | string;
  /** Target width (default: 800) */
  width?: number;
  /** Target height (default: 600) */
  height?: number;
  /** Background color (default: '#000') */
  backgroundColor?: string;
}

/**
 * Resource key for accessing the canvas context in systems.
 */
export const CanvasContextResource = Symbol('CanvasContext');

/**
 * Resource key for accessing input state in systems.
 */
export const InputStateResource = Symbol('InputState');

/**
 * Web canvas adapter for browser games.
 */
export class WebCanvasAdapter implements Adapter {
  readonly name = 'webcanvas';

  private options: Required<WebCanvasAdapterOptions>;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private inputState: WebInputState | null = null;
  private running = false;
  private animationFrameId: number | null = null;
  private lastTime = 0;

  constructor(options: WebCanvasAdapterOptions) {
    this.options = {
      canvas: options.canvas,
      width: options.width ?? 800,
      height: options.height ?? 600,
      backgroundColor: options.backgroundColor ?? '#000',
    };
  }

  init(world: World): void {
    // Get canvas element
    if (typeof this.options.canvas === 'string') {
      const el = document.querySelector(this.options.canvas);
      if (!(el instanceof HTMLCanvasElement)) {
        throw new Error(`Canvas element not found: ${this.options.canvas}`);
      }
      this.canvas = el;
    } else {
      this.canvas = this.options.canvas;
    }

    // Set up canvas
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;

    // Get 2D context
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Failed to get 2D canvas context');
    }

    // Set up input handling
    this.inputState = new WebInputState(this.canvas);

    // Register resources so systems can access them
    world.setResource(CanvasContextResource, this.ctx);
    world.setResource(InputStateResource, this.inputState);
  }

  start(scheduler: Scheduler, world: World): void {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();

    scheduler.init(world);

    const loop = (currentTime: number) => {
      if (!this.running) return;

      const dt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      // Clear canvas
      if (this.ctx) {
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.options.width, this.options.height);
      }

      // Update input state
      this.inputState?.update();

      // Run scheduler
      scheduler.tick(world, dt);

      // Request next frame
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy(): void {
    this.stop();
    this.inputState?.destroy();
    this.inputState = null;
    this.ctx = null;
    this.canvas = null;
  }

  /**
   * Get the canvas element.
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * Get the 2D rendering context.
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }
}

/**
 * Web input state implementation.
 */
export class WebInputState implements InputState {
  private keysDown = new Set<string>();
  private keysPressed = new Set<string>();
  private keysReleased = new Set<string>();
  private pointerPosition: { x: number; y: number } | null = null;
  private pointerDown = false;

  private keyDownHandler: (e: KeyboardEvent) => void;
  private keyUpHandler: (e: KeyboardEvent) => void;
  private mouseMoveHandler: (e: MouseEvent) => void;
  private mouseDownHandler: (e: MouseEvent) => void;
  private mouseUpHandler: (e: MouseEvent) => void;

  constructor(private element: HTMLElement) {
    this.keyDownHandler = (e) => {
      if (!this.keysDown.has(e.code)) {
        this.keysPressed.add(e.code);
      }
      this.keysDown.add(e.code);
    };

    this.keyUpHandler = (e) => {
      this.keysDown.delete(e.code);
      this.keysReleased.add(e.code);
    };

    this.mouseMoveHandler = (e) => {
      const rect = this.element.getBoundingClientRect();
      this.pointerPosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    this.mouseDownHandler = () => {
      this.pointerDown = true;
    };

    this.mouseUpHandler = () => {
      this.pointerDown = false;
    };

    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
    element.addEventListener('mousemove', this.mouseMoveHandler);
    element.addEventListener('mousedown', this.mouseDownHandler);
    element.addEventListener('mouseup', this.mouseUpHandler);
  }

  /**
   * Called each frame to clear pressed/released states.
   */
  update(): void {
    this.keysPressed.clear();
    this.keysReleased.clear();
  }

  isKeyDown(key: string): boolean {
    return this.keysDown.has(key);
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key);
  }

  isKeyReleased(key: string): boolean {
    return this.keysReleased.has(key);
  }

  getPointerPosition(): { x: number; y: number } | null {
    return this.pointerPosition;
  }

  isPointerDown(): boolean {
    return this.pointerDown;
  }

  destroy(): void {
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
    this.element.removeEventListener('mousemove', this.mouseMoveHandler);
    this.element.removeEventListener('mousedown', this.mouseDownHandler);
    this.element.removeEventListener('mouseup', this.mouseUpHandler);
  }
}
