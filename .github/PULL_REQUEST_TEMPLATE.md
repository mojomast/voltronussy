## Description

<!-- Brief description of what this PR does -->

## Type of Change

<!-- Check the ones that apply -->

- [ ] 🎮 New game (`games/`)
- [ ] 🔌 New plugin (`plugins/`)
- [ ] 🖥️ New adapter (`adapters/`)
- [ ] 🛠️ Engine change (`packages/`)
- [ ] 📖 Documentation only
- [ ] 🐛 Bug fix
- [ ] 🧹 Refactor / cleanup

## Checklist

### All PRs

- [ ] CI passes (build + tests)
- [ ] I have only touched the folders relevant to my change
- [ ] I have tested my changes locally

### For Games

- [ ] Game has a `game.json` with valid metadata
- [ ] Game has a `README.md` explaining how to play
- [ ] Game runs without errors
- [ ] Game doesn't require secrets or external services
- [ ] I tested with: `pnpm game <my-game>`

### For Plugins

- [ ] Plugin has a `plugin.json` with valid metadata
- [ ] Plugin has a `README.md` with usage docs
- [ ] Plugin has tests
- [ ] Plugin only imports from `@voltronussy/engine-abstractions`
- [ ] I tested with at least one game

### For Engine Changes

- [ ] I opened an issue first and got approval
- [ ] I updated `engineApiVersion` if this is a breaking change
- [ ] I added migration notes if needed
- [ ] All sample games still work
- [ ] I added/updated tests

## Games Tested

<!-- List which games you tested your changes with -->

- [ ] example-headless
- [ ] example-web
- [ ] Other: _______________

## Breaking Changes

<!-- If this is a breaking change, describe what breaks and how to migrate -->

**Is this a breaking change?** No / Yes (see below)

<!-- If yes:
- Old behavior:
- New behavior:
- Migration steps:
-->

## Screenshots / Recordings

<!-- For visual changes, add screenshots or recordings -->

## Additional Notes

<!-- Any other context about the PR -->
