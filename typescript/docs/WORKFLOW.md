
# Workflow: Git + PR guardrails (TypeScript) 🧰
Goal: collaborate in one repo without constant merge pain.

## Branching (simple)
- main is always green
- feature branches: `feat/<area>-<shortname>`
- merge via PR only

## Isolation by folder
Most PRs should stay inside ONE area:
- `/plugins/<your-plugin>`
- `/games/<your-game>`
- `/adapters/<your-adapter>`

Touching `/packages/*` is allowed but needs tests and coordination via Issue.

## PR requirements
- CI green (build + tests)
- PR template completed
- If plugin: metadata updated and tags chosen
- If engine API changed: bump engineApiVersion and document breaking changes

## CODEOWNERS
Use CODEOWNERS so core changes get the right eyes.

## Merge strategy
- squash merge recommended
