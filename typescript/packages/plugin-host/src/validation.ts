import type { PluginMetadata } from '@voltronussy/engine-abstractions';

/**
 * Error thrown when plugin metadata validation fails.
 */
export class PluginValidationError extends Error {
  constructor(
    public readonly pluginId: string | undefined,
    message: string
  ) {
    super(`Plugin validation failed${pluginId ? ` for "${pluginId}"` : ''}: ${message}`);
    this.name = 'PluginValidationError';
  }
}

/**
 * Valid plugin status values.
 */
const VALID_STATUSES = ['experimental', 'stable', 'deprecated'] as const;

/**
 * Simple semver pattern (major.minor.patch with optional prerelease).
 */
const SEMVER_PATTERN = /^\d+\.\d+\.\d+(-[\w.]+)?$/;

/**
 * Plugin ID pattern: namespace.name (at least two parts, lowercase with dots).
 */
const PLUGIN_ID_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

/**
 * Validates plugin metadata and throws if invalid.
 */
export function validatePluginMetadata(metadata: PluginMetadata): void {
  if (!metadata || typeof metadata !== 'object') {
    throw new PluginValidationError(undefined, 'Metadata must be an object');
  }

  const { id, name, version, engineApiVersion, status, tags, dependsOn, capabilities } =
    metadata;

  // Validate id
  if (!id || typeof id !== 'string') {
    throw new PluginValidationError(id, 'Missing or invalid "id" field');
  }
  if (!PLUGIN_ID_PATTERN.test(id)) {
    throw new PluginValidationError(
      id,
      `Invalid "id" format. Expected "namespace.name" (e.g., "voltronussy.physics"). Got "${id}"`
    );
  }

  // Validate name
  if (!name || typeof name !== 'string') {
    throw new PluginValidationError(id, 'Missing or invalid "name" field');
  }

  // Validate version
  if (!version || typeof version !== 'string') {
    throw new PluginValidationError(id, 'Missing or invalid "version" field');
  }
  if (!SEMVER_PATTERN.test(version)) {
    throw new PluginValidationError(
      id,
      `Invalid "version" format. Expected semver (e.g., "1.0.0"). Got "${version}"`
    );
  }

  // Validate engineApiVersion
  if (!engineApiVersion || typeof engineApiVersion !== 'string') {
    throw new PluginValidationError(id, 'Missing or invalid "engineApiVersion" field');
  }

  // Validate status
  if (!status || !VALID_STATUSES.includes(status as any)) {
    throw new PluginValidationError(
      id,
      `Invalid "status" field. Expected one of: ${VALID_STATUSES.join(', ')}. Got "${status}"`
    );
  }

  // Validate tags
  if (!Array.isArray(tags)) {
    throw new PluginValidationError(id, '"tags" must be an array');
  }

  // Validate dependsOn
  if (!Array.isArray(dependsOn)) {
    throw new PluginValidationError(id, '"dependsOn" must be an array');
  }
  for (const dep of dependsOn) {
    if (!dep || typeof dep !== 'object') {
      throw new PluginValidationError(id, 'Each dependency must be an object');
    }
    if (!dep.id || typeof dep.id !== 'string') {
      throw new PluginValidationError(id, 'Each dependency must have a valid "id"');
    }
    if (!dep.version || typeof dep.version !== 'string') {
      throw new PluginValidationError(id, 'Each dependency must have a valid "version"');
    }
  }

  // Validate capabilities
  if (!Array.isArray(capabilities)) {
    throw new PluginValidationError(id, '"capabilities" must be an array');
  }
}

/**
 * Parses and validates JSON as plugin metadata.
 */
export function parsePluginMetadata(json: string, source?: string): PluginMetadata {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    throw new PluginValidationError(
      undefined,
      `Failed to parse plugin.json${source ? ` from ${source}` : ''}: ${e}`
    );
  }

  const metadata = parsed as PluginMetadata;
  validatePluginMetadata(metadata);
  return metadata;
}
