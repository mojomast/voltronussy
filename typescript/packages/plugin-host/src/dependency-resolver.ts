import type { PluginMetadata } from '@voltronussy/engine-abstractions';

/**
 * Error thrown when dependency resolution fails.
 */
export class DependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DependencyError';
  }
}

/**
 * Builds a dependency graph from plugin metadata.
 * Returns a Map where keys are plugin IDs and values are arrays of dependency IDs.
 */
export function buildDependencyGraph(
  plugins: PluginMetadata[]
): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const plugin of plugins) {
    const deps = plugin.dependsOn.map((d) => d.id);
    graph.set(plugin.id, deps);
  }

  return graph;
}

/**
 * Resolves plugins in dependency order (topological sort).
 * Throws if there are cycles or missing dependencies.
 */
export function resolveDependencyOrder(plugins: PluginMetadata[]): string[] {
  if (plugins.length === 0) {
    return [];
  }

  const graph = buildDependencyGraph(plugins);
  const available = new Set(plugins.map((p) => p.id));

  // Check for missing dependencies
  for (const plugin of plugins) {
    for (const dep of plugin.dependsOn) {
      if (!available.has(dep.id)) {
        throw new DependencyError(
          `Plugin "${plugin.id}" depends on "${dep.id}" which is not available`
        );
      }
    }
  }

  // Kahn's algorithm for topological sort
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize
  for (const plugin of plugins) {
    inDegree.set(plugin.id, 0);
    adjacency.set(plugin.id, []);
  }

  // Build adjacency list and calculate in-degrees
  for (const plugin of plugins) {
    for (const dep of plugin.dependsOn) {
      // dep.id -> plugin.id (dependency must come before dependent)
      adjacency.get(dep.id)!.push(plugin.id);
      inDegree.set(plugin.id, (inDegree.get(plugin.id) ?? 0) + 1);
    }
  }

  // Find all nodes with no incoming edges
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) {
      queue.push(id);
    }
  }

  const result: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    for (const dependent of adjacency.get(current) ?? []) {
      const newDegree = (inDegree.get(dependent) ?? 0) - 1;
      inDegree.set(dependent, newDegree);
      if (newDegree === 0) {
        queue.push(dependent);
      }
    }
  }

  // If we didn't process all nodes, there's a cycle
  if (result.length !== plugins.length) {
    const remaining = plugins
      .filter((p) => !result.includes(p.id))
      .map((p) => p.id);
    throw new DependencyError(
      `Dependency cycle detected involving: ${remaining.join(', ')}`
    );
  }

  return result;
}
