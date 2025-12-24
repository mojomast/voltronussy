import { describe, it, expect } from 'vitest';
import { validatePluginMetadata, PluginValidationError } from '../src/validation.js';
import type { PluginMetadata } from '@voltronussy/engine-abstractions';

describe('Plugin Metadata Validation', () => {
  const validMetadata: PluginMetadata = {
    id: 'voltronussy.test.plugin',
    name: 'Test Plugin',
    version: '0.1.0',
    engineApiVersion: '0.1',
    status: 'experimental',
    tags: ['test'],
    dependsOn: [],
    capabilities: ['test.capability'],
  };

  it('should accept valid metadata', () => {
    expect(() => validatePluginMetadata(validMetadata)).not.toThrow();
  });

  it('should reject missing id', () => {
    const invalid = { ...validMetadata, id: '' };
    expect(() => validatePluginMetadata(invalid)).toThrow(PluginValidationError);
    expect(() => validatePluginMetadata(invalid)).toThrow(/id/i);
  });

  it('should reject missing name', () => {
    const invalid = { ...validMetadata, name: '' };
    expect(() => validatePluginMetadata(invalid)).toThrow(PluginValidationError);
  });

  it('should reject invalid version format', () => {
    const invalid = { ...validMetadata, version: 'not-semver' };
    expect(() => validatePluginMetadata(invalid)).toThrow(PluginValidationError);
    expect(() => validatePluginMetadata(invalid)).toThrow(/version/i);
  });

  it('should accept valid semver versions', () => {
    const validVersions = ['0.1.0', '1.0.0', '2.3.4', '1.0.0-alpha', '1.0.0-beta.1'];
    for (const version of validVersions) {
      const metadata = { ...validMetadata, version };
      expect(() => validatePluginMetadata(metadata)).not.toThrow();
    }
  });

  it('should reject invalid status', () => {
    const invalid = { ...validMetadata, status: 'invalid' as any };
    expect(() => validatePluginMetadata(invalid)).toThrow(PluginValidationError);
    expect(() => validatePluginMetadata(invalid)).toThrow(/status/i);
  });

  it('should accept valid statuses', () => {
    const validStatuses = ['experimental', 'stable', 'deprecated'] as const;
    for (const status of validStatuses) {
      const metadata = { ...validMetadata, status };
      expect(() => validatePluginMetadata(metadata)).not.toThrow();
    }
  });

  it('should reject missing engineApiVersion', () => {
    const invalid = { ...validMetadata, engineApiVersion: '' };
    expect(() => validatePluginMetadata(invalid)).toThrow(PluginValidationError);
  });

  it('should validate dependency format', () => {
    const withValidDep = {
      ...validMetadata,
      dependsOn: [{ id: 'other.plugin', version: '>=0.1.0' }],
    };
    expect(() => validatePluginMetadata(withValidDep)).not.toThrow();
  });

  it('should reject invalid dependency format', () => {
    const withInvalidDep = {
      ...validMetadata,
      dependsOn: [{ id: '', version: '>=0.1.0' }],
    };
    expect(() => validatePluginMetadata(withInvalidDep)).toThrow(PluginValidationError);
  });

  it('should reject null or undefined metadata', () => {
    expect(() => validatePluginMetadata(null as any)).toThrow(PluginValidationError);
    expect(() => validatePluginMetadata(undefined as any)).toThrow(PluginValidationError);
  });

  it('should check id format (namespace.name)', () => {
    const badIds = ['no-namespace', '123.startswithnumber', ''];
    for (const id of badIds) {
      const invalid = { ...validMetadata, id };
      expect(() => validatePluginMetadata(invalid)).toThrow(PluginValidationError);
    }
  });

  it('should accept properly namespaced ids', () => {
    const goodIds = ['voltronussy.physics', 'my.plugin.name', 'a.b'];
    for (const id of goodIds) {
      const valid = { ...validMetadata, id };
      expect(() => validatePluginMetadata(valid)).not.toThrow();
    }
  });
});
