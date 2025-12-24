
# Code style (Python)
## Principles
- Clarity over cleverness.
- Core stays headless and testable.
- Systems should be deterministic-ish in tests.
- Avoid hidden globals.

## Python guidelines
- Python 3.12 target
- Prefer dataclasses for components
- Type hints for public APIs
- Keep public contracts in abstractions

## Testing
- Tests must not require a graphics window.
- Prefer fixed dt in unit tests.
