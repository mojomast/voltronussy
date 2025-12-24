
# VOLTRONUSSY ENGINE (Python) 🐍

> ⚠️ **EXPERIMENTAL TRACK** — The TypeScript track is the primary implementation. This Python track exists for contributors who prefer Python, but may lag behind in features. See [/typescript](/typescript) for the reference implementation.

A collaboration-friendly **ECS logic engine** in Python where:
- Core stays small and stable
- Everyone ships games and plugins in parallel
- Good plugins can be promoted into core via PRs

## Status

| Feature | Status |
|---------|--------|
| ECS Core | 🔴 Not started |
| Plugin Host | 🔴 Not started |
| Null Adapter | 🔴 Not started |
| Pygame Adapter | 🔴 Not started |
| Example Games | 🔴 Not started |

Want to help? Check the TypeScript implementation and port features!

## Quick start (once implemented)
```bash
cd python
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

pip install -e ".[dev]"
pytest
python -m games.example_headless
```

## Golden rules
1. Core stays small. New features begin life in `/plugins`.
2. No surprise breakage. If your change breaks a game, fix or feature-flag.
3. PRs are the docking port. Main stays green.
4. Plugins use public APIs only.

## Read next
- `docs/DEVPLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/PLUGINS.md`
- `docs/WORKFLOW.md`
- `/docs/CONTRIBUTING.md` (top-level)

Last updated: December 23, 2025
