
# Workflow: Git + PR guardrails (Python) 🧰
Goal: collaborate in one repo without merge chaos.

## Branching
- main stays green
- feature branches: feat/<area>-<shortname>
- merge via PR only

## Isolation by folder
Most PRs should stay within:
- /plugins/<your-plugin>
- /games/<your-game>
- /adapters/<your-adapter>

Touching /engine requires tests and coordination (Issue first).

## PR requirements
- CI green (lint + test)
- PR template completed
- plugin.json updated if plugin PR
- bump engineApiVersion on breaking changes

## Tooling recommendations
- ruff (lint/format)
- mypy (optional strictness)
- pytest

Keep it lightweight.
