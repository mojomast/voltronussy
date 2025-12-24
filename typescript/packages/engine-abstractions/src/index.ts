/**
 * @voltronussy/engine-abstractions
 *
 * Public types and interfaces that games and plugins compile against.
 * If it's in this package, changing it is expensive - think carefully.
 */

// =============================================================================
// Entity
// =============================================================================

/**
 * Opaque identifier for an entity.
 * Never rely on the internal structure of this type.
 */
export type EntityId = number & { readonly __brand: unique symbol };

/**
 * Create an EntityId from a number (internal use only).
 */
export function createEntityId(id: number): EntityId {
  return id as EntityId;
}

// =============================================================================
// Component
// =============================================================================

/**
 * A component is just a plain data object.
 * Components should not contain logic - that belongs in systems.
 */
export type Component = object;

/**
 * A unique identifier for a component type.
 * Use the component's constructor or a symbol.
 */
export type ComponentType<T extends Component = Component> =
  | (new (...args: unknown[]) => T)
  | symbol;

// =============================================================================
// System
// =============================================================================

/**
 * Systems contain the logic that operates on entities and components.
 * Implement one or more of the update methods.
 */
export interface System {
  /** System name for debugging */
  readonly name: string;

  /** Priority for ordering (lower runs first). Default: 0 */
  readonly priority?: number;

  /**
   * Called during initialization, after all systems are registered.
   * Use this to cache queries or set up resources.
   */
  init?(world: World): void;

  /**
   * Fixed timestep update. Called zero or more times per frame.
   * Use for physics, deterministic simulation.
   * @param dt Fixed delta time (e.g., 1/60)
   */
  fixedUpdate?(world: World, dt: number): void;

  /**
   * Variable timestep update. Called once per frame.
   * Use for input, AI, animation state.
   * @param dt Time since last frame
   */
  update?(world: World, dt: number): void;

  /**
   * Render phase. Called once per frame after update.
   * Should NOT mutate simulation state.
   * @param dt Time since last frame (same as update)
   */
  render?(world: World, dt: number): void;

  /**
   * Called when the system is removed or the world is destroyed.
   */
  destroy?(world: World): void;
}

// =============================================================================
// Query
// =============================================================================

/**
 * A query describes which entities a system wants to operate on.
 */
export interface QueryDescriptor {
  /** Components that entities MUST have */
  readonly with: readonly ComponentType[];
  /** Components that entities MUST NOT have */
  readonly without?: readonly ComponentType[];
}

/**
 * Result of a query - iterable of matching entities.
 */
export interface QueryResult {
  /** Iterate over matching entity IDs */
  [Symbol.iterator](): Iterator<EntityId>;

  /** Get all matching entities as an array */
  toArray(): EntityId[];

  /** Number of matching entities */
  readonly count: number;
}

// =============================================================================
// World
// =============================================================================

/**
 * The World is the central container for all ECS data.
 * It holds entities, components, and provides queries.
 */
export interface World {
  // --- Entity Management ---

  /** Create a new entity and return its ID */
  spawn(): EntityId;

  /** Destroy an entity and all its components */
  despawn(entity: EntityId): void;

  /** Check if an entity exists */
  exists(entity: EntityId): boolean;

  // --- Component Management ---

  /** Add a component to an entity */
  addComponent<T extends Component>(
    entity: EntityId,
    type: ComponentType<T>,
    component: T
  ): void;

  /** Remove a component from an entity */
  removeComponent<T extends Component>(
    entity: EntityId,
    type: ComponentType<T>
  ): void;

  /** Get a component from an entity (returns undefined if not present) */
  getComponent<T extends Component>(
    entity: EntityId,
    type: ComponentType<T>
  ): T | undefined;

  /** Check if an entity has a component */
  hasComponent<T extends Component>(
    entity: EntityId,
    type: ComponentType<T>
  ): boolean;

  // --- Queries ---

  /** Query for entities matching a descriptor */
  query(descriptor: QueryDescriptor): QueryResult;

  // --- Resources ---

  /** Set a global resource */
  setResource<T>(type: ComponentType<T>, resource: T): void;

  /** Get a global resource */
  getResource<T>(type: ComponentType<T>): T | undefined;

  /** Check if a resource exists */
  hasResource<T>(type: ComponentType<T>): boolean;
}

// =============================================================================
// Scheduler
// =============================================================================

/**
 * Configuration for the scheduler.
 */
export interface SchedulerConfig {
  /** Fixed timestep in seconds (default: 1/60) */
  fixedTimestep?: number;

  /** Maximum accumulated time before dropping frames (default: 0.25) */
  maxAccumulatedTime?: number;
}

/**
 * The scheduler runs systems in the correct order and phases.
 */
export interface Scheduler {
  /** Add a system to the scheduler */
  addSystem(system: System): void;

  /** Remove a system from the scheduler */
  removeSystem(system: System): void;

  /** Run one frame with the given delta time */
  tick(world: World, dt: number): void;

  /** Initialize all systems */
  init(world: World): void;

  /** Destroy all systems */
  destroy(world: World): void;
}

// =============================================================================
// Plugin
// =============================================================================

/**
 * Plugin metadata from plugin.json
 */
export interface PluginMetadata {
  /** Unique plugin identifier (e.g., "voltronussy.physics.aabb") */
  id: string;

  /** Human-readable name */
  name: string;

  /** Plugin version (semver) */
  version: string;

  /** Required engine API version */
  engineApiVersion: string;

  /** Plugin status */
  status: 'experimental' | 'stable' | 'deprecated';

  /** Categorization tags */
  tags: string[];

  /** Dependencies on other plugins */
  dependsOn: PluginDependency[];

  /** Capabilities this plugin provides */
  capabilities: string[];
}

/**
 * A dependency on another plugin.
 */
export interface PluginDependency {
  /** Plugin ID */
  id: string;

  /** Version requirement (semver range) */
  version: string;
}

/**
 * The registry allows plugins to register their systems, components, etc.
 */
export interface PluginRegistry {
  /** Register a system */
  registerSystem(system: System): void;

  /** Register a component type (for serialization, editor, etc.) */
  registerComponentType<T extends Component>(
    type: ComponentType<T>,
    name: string
  ): void;

  /** Get the world (for adding resources, etc.) */
  getWorld(): World;

  /** Get the scheduler */
  getScheduler(): Scheduler;
}

/**
 * A plugin exports a register function that receives the registry.
 */
export interface Plugin {
  register(registry: PluginRegistry): void;
}

// =============================================================================
// Adapter
// =============================================================================

/**
 * Adapters bridge the engine to a platform (browser, terminal, etc.)
 */
export interface Adapter {
  /** Adapter name for debugging */
  readonly name: string;

  /** Initialize the adapter */
  init(world: World): void;

  /** Start the game loop */
  start(scheduler: Scheduler, world: World): void;

  /** Stop the game loop */
  stop(): void;

  /** Clean up resources */
  destroy(): void;
}

/**
 * Input state abstraction for adapters.
 */
export interface InputState {
  /** Check if a key is currently pressed */
  isKeyDown(key: string): boolean;

  /** Check if a key was pressed this frame */
  isKeyPressed(key: string): boolean;

  /** Check if a key was released this frame */
  isKeyReleased(key: string): boolean;

  /** Mouse/pointer position (if available) */
  getPointerPosition(): { x: number; y: number } | null;

  /** Is the primary pointer button down */
  isPointerDown(): boolean;
}

// =============================================================================
// Engine Version
// =============================================================================

/**
 * Current engine API version.
 * Plugins must declare compatibility with this version.
 */
export const ENGINE_API_VERSION = '0.1';
