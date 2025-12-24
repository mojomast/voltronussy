import type {
  EntityId,
  Component,
  ComponentType,
  World,
  QueryDescriptor,
  QueryResult,
} from '@voltronussy/engine-abstractions';
import { createEntityId } from '@voltronussy/engine-abstractions';

/**
 * Simple Map-based ECS World implementation.
 * Prioritizes correctness and simplicity over raw performance.
 */
export class WorldImpl implements World {
  private nextEntityId = 0;
  private freeList: number[] = [];
  private entities = new Set<number>();
  private componentStores = new Map<ComponentType, Map<number, Component>>();
  private resources = new Map<ComponentType, unknown>();

  // =========================================================================
  // Entity Management
  // =========================================================================

  spawn(): EntityId {
    let id: number;

    if (this.freeList.length > 0) {
      id = this.freeList.pop()!;
    } else {
      id = this.nextEntityId++;
    }

    this.entities.add(id);
    return createEntityId(id);
  }

  despawn(entity: EntityId): void {
    const id = entity as unknown as number;

    if (!this.entities.has(id)) {
      return; // Already despawned or never existed
    }

    // Remove all components for this entity
    for (const store of this.componentStores.values()) {
      store.delete(id);
    }

    this.entities.delete(id);
    this.freeList.push(id);
  }

  exists(entity: EntityId): boolean {
    return this.entities.has(entity as unknown as number);
  }

  // =========================================================================
  // Component Management
  // =========================================================================

  addComponent<T extends Component>(
    entity: EntityId,
    type: ComponentType<T>,
    component: T
  ): void {
    const id = entity as unknown as number;

    if (!this.entities.has(id)) {
      throw new Error(`Entity ${id} does not exist`);
    }

    let store = this.componentStores.get(type);
    if (!store) {
      store = new Map();
      this.componentStores.set(type, store);
    }

    store.set(id, component);
  }

  removeComponent<T extends Component>(
    entity: EntityId,
    type: ComponentType<T>
  ): void {
    const store = this.componentStores.get(type);
    if (store) {
      store.delete(entity as unknown as number);
    }
  }

  getComponent<T extends Component>(
    entity: EntityId,
    type: ComponentType<T>
  ): T | undefined {
    const store = this.componentStores.get(type);
    if (!store) {
      return undefined;
    }
    return store.get(entity as unknown as number) as T | undefined;
  }

  hasComponent<T extends Component>(
    entity: EntityId,
    type: ComponentType<T>
  ): boolean {
    const store = this.componentStores.get(type);
    if (!store) {
      return false;
    }
    return store.has(entity as unknown as number);
  }

  // =========================================================================
  // Queries
  // =========================================================================

  query(descriptor: QueryDescriptor): QueryResult {
    const withTypes = descriptor.with;
    const withoutTypes = descriptor.without ?? [];

    // Find the smallest component store to iterate over
    let smallestStore: Map<number, Component> | null = null;
    let smallestSize = Infinity;

    for (const type of withTypes) {
      const store = this.componentStores.get(type);
      if (!store) {
        // No entities have this component, so query matches nothing
        return new QueryResultImpl([]);
      }
      if (store.size < smallestSize) {
        smallestSize = store.size;
        smallestStore = store;
      }
    }

    if (!smallestStore) {
      return new QueryResultImpl([]);
    }

    // Filter entities that have all required components and none of the excluded ones
    const matching: EntityId[] = [];

    for (const entityId of smallestStore.keys()) {
      // Check all required components
      let hasAll = true;
      for (const type of withTypes) {
        const store = this.componentStores.get(type);
        if (!store?.has(entityId)) {
          hasAll = false;
          break;
        }
      }

      if (!hasAll) continue;

      // Check none of the excluded components
      let hasExcluded = false;
      for (const type of withoutTypes) {
        const store = this.componentStores.get(type);
        if (store?.has(entityId)) {
          hasExcluded = true;
          break;
        }
      }

      if (!hasExcluded) {
        matching.push(createEntityId(entityId));
      }
    }

    return new QueryResultImpl(matching);
  }

  // =========================================================================
  // Resources
  // =========================================================================

  setResource<T>(type: ComponentType<T>, resource: T): void {
    this.resources.set(type, resource);
  }

  getResource<T>(type: ComponentType<T>): T | undefined {
    return this.resources.get(type) as T | undefined;
  }

  hasResource<T>(type: ComponentType<T>): boolean {
    return this.resources.has(type);
  }
}

/**
 * Simple query result implementation.
 */
class QueryResultImpl implements QueryResult {
  private entities: EntityId[];

  constructor(entities: EntityId[]) {
    this.entities = entities;
  }

  [Symbol.iterator](): Iterator<EntityId> {
    return this.entities[Symbol.iterator]();
  }

  toArray(): EntityId[] {
    return [...this.entities];
  }

  get count(): number {
    return this.entities.length;
  }
}
