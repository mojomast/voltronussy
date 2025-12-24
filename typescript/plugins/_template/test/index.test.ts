import { describe, it, expect, beforeEach } from 'vitest';
import { MyComponent, MySystem } from '../src/index.js';

describe('MyComponent', () => {
  it('should have a default value of 0', () => {
    const component = new MyComponent();
    expect(component.value).toBe(0);
  });

  it('should accept a custom value', () => {
    const component = new MyComponent(42);
    expect(component.value).toBe(42);
  });
});

describe('MySystem', () => {
  it('should have a name', () => {
    expect(MySystem.name).toBe('MySystem');
  });

  it('should have a priority', () => {
    expect(MySystem.priority).toBe(0);
  });

  // Add more tests for your system's behavior
});
