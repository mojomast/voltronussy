# ADR-002: Simple Map-Based ECS Storage

**Status:** Accepted  
**Date:** 2024-12-23

## Context

ECS implementations can range from simple (Map/dict per component type) to complex (archetypal storage, sparse sets, etc.). We need to choose an initial storage strategy.

## Decision

**Use simple Map-based storage for v0.1.**

```typescript
// Component storage is just a Map per component type
type ComponentStore<T> = Map<EntityId, T>;

// World holds all component stores
class World {
  private stores: Map<ComponentType, ComponentStore<unknown>>;
}
```

Reasons:
1. **Simplicity** — Easy to understand, debug, and maintain
2. **Correctness first** — We can optimize later once behavior is correct
3. **Flexibility** — Adding/removing components is O(1)
4. **Good enough** — For small indie games, this is plenty fast

## Consequences

- Query performance is O(n) where n is entities with the smallest component set
- Memory layout is not cache-friendly
- We accept this tradeoff for v0.1; can revisit in v0.2 if needed
- Future optimization (archetypal storage) would be an internal change, not API change
