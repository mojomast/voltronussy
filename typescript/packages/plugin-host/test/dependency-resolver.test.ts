import { describe, it, expect } from 'vitest';
import {
  buildDependencyGraph,
  resolveDependencyOrder,
  DependencyError,
} from '../src/dependency-resolver.js';
import type { PluginMetadata } from '@voltronussy/engine-abstractions';

function createPlugin(
  id: string,
  dependsOn: { id: string; version: string }[] = []
): PluginMetadata {
  return {
    id,
    name: id,
    version: '0.1.0',
    engineApiVersion: '0.1',
    status: 'experimental',
    tags: [],
    dependsOn,
    capabilities: [],
  };
}

describe('Dependency Graph', () => {
  it('should build a graph from plugins', () => {
    const plugins = [
      createPlugin('a'),
      createPlugin('b', [{ id: 'a', version: '>=0.1.0' }]),
      createPlugin('c', [{ id: 'a', version: '>=0.1.0' }, { id: 'b', version: '>=0.1.0' }]),
    ];

    const graph = buildDependencyGraph(plugins);

    expect(graph.get('a')).toEqual([]);
    expect(graph.get('b')).toEqual(['a']);
    expect(graph.get('c')).toContain('a');
    expect(graph.get('c')).toContain('b');
  });

  it('should handle plugins with no dependencies', () => {
    const plugins = [createPlugin('a'), createPlugin('b'), createPlugin('c')];

    const graph = buildDependencyGraph(plugins);

    expect(graph.get('a')).toEqual([]);
    expect(graph.get('b')).toEqual([]);
    expect(graph.get('c')).toEqual([]);
  });
});

describe('Dependency Resolution', () => {
  it('should return correct topological order', () => {
    const plugins = [
      createPlugin('a'),
      createPlugin('b', [{ id: 'a', version: '>=0.1.0' }]),
      createPlugin('c', [{ id: 'b', version: '>=0.1.0' }]),
    ];

    const order = resolveDependencyOrder(plugins);

    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('c'));
  });

  it('should handle diamond dependencies', () => {
    //     a
    //    / \
    //   b   c
    //    \ /
    //     d
    const plugins = [
      createPlugin('a'),
      createPlugin('b', [{ id: 'a', version: '>=0.1.0' }]),
      createPlugin('c', [{ id: 'a', version: '>=0.1.0' }]),
      createPlugin('d', [{ id: 'b', version: '>=0.1.0' }, { id: 'c', version: '>=0.1.0' }]),
    ];

    const order = resolveDependencyOrder(plugins);

    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'));
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('d'));
    expect(order.indexOf('c')).toBeLessThan(order.indexOf('d'));
  });

  it('should detect simple cycles', () => {
    const plugins = [
      createPlugin('a', [{ id: 'b', version: '>=0.1.0' }]),
      createPlugin('b', [{ id: 'a', version: '>=0.1.0' }]),
    ];

    expect(() => resolveDependencyOrder(plugins)).toThrow(DependencyError);
    expect(() => resolveDependencyOrder(plugins)).toThrow(/cycle/i);
  });

  it('should detect complex cycles', () => {
    const plugins = [
      createPlugin('a', [{ id: 'c', version: '>=0.1.0' }]),
      createPlugin('b', [{ id: 'a', version: '>=0.1.0' }]),
      createPlugin('c', [{ id: 'b', version: '>=0.1.0' }]),
    ];

    expect(() => resolveDependencyOrder(plugins)).toThrow(DependencyError);
  });

  it('should detect self-referential cycles', () => {
    const plugins = [createPlugin('a', [{ id: 'a', version: '>=0.1.0' }])];

    expect(() => resolveDependencyOrder(plugins)).toThrow(DependencyError);
  });

  it('should report missing dependencies', () => {
    const plugins = [createPlugin('a', [{ id: 'missing', version: '>=0.1.0' }])];

    expect(() => resolveDependencyOrder(plugins)).toThrow(DependencyError);
    expect(() => resolveDependencyOrder(plugins)).toThrow(/missing/i);
  });

  it('should handle empty plugin list', () => {
    const order = resolveDependencyOrder([]);
    expect(order).toEqual([]);
  });

  it('should handle single plugin', () => {
    const plugins = [createPlugin('a')];
    const order = resolveDependencyOrder(plugins);
    expect(order).toEqual(['a']);
  });
});
