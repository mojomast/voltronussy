---
name: 🚀 Promotion Checklist
about: Request promotion of a plugin to stable or core
title: 'promote: [Plugin Name]'
labels: patch:ready-for-promotion
assignees: ''
---

## Plugin to Promote

**Plugin ID:** `voltronussy.xxx.xxx`
**Current Status:** experimental
**Target Status:** stable / core

## Promotion Checklist

### Requirements

- [ ] **Used in production** — At least one game in `/games` depends on it
- [ ] **Tested** — Has tests running in CI
- [ ] **Documented** — Has a README with usage examples
- [ ] **Stable API** — No breaking changes planned
- [ ] **No breakage** — All sample games still work
- [ ] **Clean code** — Follows code style, no TODOs or hacks

### Games Using This Plugin

<!-- List games that depend on this plugin -->

1. 
2. 

### Test Coverage

<!-- Brief description of test coverage -->

### API Stability

<!-- Has the API changed recently? Any planned changes? -->

## Promotion Type

- [ ] **Blessed Plugin** — Keep in `plugins/` with status `stable`
- [ ] **Core Module** — Move to `packages/engine-*`

## Maintainer Sponsor

<!-- Tag a maintainer who can vouch for this plugin -->

@_______________

## Additional Notes

<!-- Any other context for the promotion review -->
