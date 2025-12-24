import type {
  PluginMetadata,
  Plugin,
  PluginRegistry,
  World,
  Scheduler,
  System,
  Component,
  ComponentType,
} from '@voltronussy/engine-abstractions';
import { ENGINE_API_VERSION } from '@voltronussy/engine-abstractions';
import { validatePluginMetadata, PluginValidationError } from './validation.js';
import { resolveDependencyOrder, DependencyError } from './dependency-resolver.js';

/**
 * Error thrown when plugin loading fails.
 */
export class PluginLoadError extends Error {
  constructor(
    public readonly pluginId: string,
    message: string,
    public readonly cause?: Error
  ) {
    super(`Failed to load plugin "${pluginId}": ${message}`);
    this.name = 'PluginLoadError';
  }
}

/**
 * A loaded plugin with its metadata and module.
 */
export interface LoadedPlugin {
  metadata: PluginMetadata;
  module: Plugin;
}

/**
 * Plugin registry implementation.
 */
class PluginRegistryImpl implements PluginRegistry {
  private world: World;
  private scheduler: Scheduler;
  private componentTypes = new Map<ComponentType, string>();

  constructor(world: World, scheduler: Scheduler) {
    this.world = world;
    this.scheduler = scheduler;
  }

  registerSystem(system: System): void {
    this.scheduler.addSystem(system);
  }

  registerComponentType<T extends Component>(
    type: ComponentType<T>,
    name: string
  ): void {
    this.componentTypes.set(type, name);
  }

  getWorld(): World {
    return this.world;
  }

  getScheduler(): Scheduler {
    return this.scheduler;
  }

  getRegisteredComponentTypes(): Map<ComponentType, string> {
    return new Map(this.componentTypes);
  }
}

/**
 * Options for the plugin host.
 */
export interface PluginHostOptions {
  /** Strict mode: reject deprecated plugins */
  strict?: boolean;
}

/**
 * Plugin host that discovers, validates, and loads plugins.
 */
export class PluginHost {
  private plugins = new Map<string, LoadedPlugin>();
  private registry: PluginRegistryImpl;
  private options: PluginHostOptions;

  constructor(world: World, scheduler: Scheduler, options: PluginHostOptions = {}) {
    this.registry = new PluginRegistryImpl(world, scheduler);
    this.options = options;
  }

  /**
   * Validates plugin metadata and checks engine API compatibility.
   */
  validatePlugin(metadata: PluginMetadata): void {
    validatePluginMetadata(metadata);

    // Check engine API version compatibility
    if (metadata.engineApiVersion !== ENGINE_API_VERSION) {
      throw new PluginValidationError(
        metadata.id,
        `Incompatible engineApiVersion. Plugin requires "${metadata.engineApiVersion}", engine is "${ENGINE_API_VERSION}"`
      );
    }

    // Warn about deprecated plugins
    if (metadata.status === 'deprecated') {
      console.warn(
        `Plugin "${metadata.id}" is deprecated. Consider finding an alternative.`
      );
      if (this.options.strict) {
        throw new PluginValidationError(
          metadata.id,
          'Deprecated plugins are not allowed in strict mode'
        );
      }
    }
  }

  /**
   * Loads a single plugin from its metadata and module.
   */
  loadPlugin(metadata: PluginMetadata, module: Plugin): void {
    this.validatePlugin(metadata);

    // Check dependencies are already loaded
    for (const dep of metadata.dependsOn) {
      if (!this.plugins.has(dep.id)) {
        throw new PluginLoadError(
          metadata.id,
          `Missing dependency "${dep.id}". Load dependencies first.`
        );
      }
    }

    // Register the plugin
    try {
      module.register(this.registry);
    } catch (e) {
      throw new PluginLoadError(
        metadata.id,
        'Error during plugin registration',
        e as Error
      );
    }

    this.plugins.set(metadata.id, { metadata, module });
  }

  /**
   * Loads multiple plugins in dependency order.
   */
  loadPlugins(
    pluginsToLoad: Array<{ metadata: PluginMetadata; module: Plugin }>
  ): void {
    // Validate all plugins first
    for (const { metadata } of pluginsToLoad) {
      this.validatePlugin(metadata);
    }

    // Resolve load order
    const order = resolveDependencyOrder(pluginsToLoad.map((p) => p.metadata));

    // Load in order
    const pluginMap = new Map(pluginsToLoad.map((p) => [p.metadata.id, p]));
    for (const id of order) {
      const plugin = pluginMap.get(id)!;
      this.loadPlugin(plugin.metadata, plugin.module);
    }
  }

  /**
   * Gets a loaded plugin by ID.
   */
  getPlugin(id: string): LoadedPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Gets all loaded plugins.
   */
  getLoadedPlugins(): LoadedPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Checks if a plugin is loaded.
   */
  isLoaded(id: string): boolean {
    return this.plugins.has(id);
  }
}
