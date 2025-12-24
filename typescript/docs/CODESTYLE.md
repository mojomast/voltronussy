
# Code style (TypeScript)
## Principles
- Clarity over cleverness.
- Keep core platform-agnostic (no DOM, no fs).
- Systems should be testable.
- Avoid hidden globals.

## TypeScript guidelines
- strict mode on
- prefer readonly data where practical
- keep public API types in engine-abstractions
- internal utilities stay private to engine-core

## Naming
- plugin ids: `voltronussy.<area>.<name>`
- components: `<Area><Thing>Component`
- systems: `<Thing>System`

## Testing
- Tests must not require a browser window (headless runner for most tests).
