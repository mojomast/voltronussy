
# Repo structure cheatsheet (TypeScript)
Recommended monorepo layout (workspaces):

```
/packages
  /engine-abstractions
  /engine-core
  /plugin-host
/adapters
  /adapter-null
  /adapter-webcanvas      # optional but recommended for "playable"
/plugins
  /<plugin-name>
    plugin.json
    src/
    test/
/games
  /example-headless
  /example-web
/docs
/.github
```

## Ownership model
- Engine maintainers: `/packages/*` and CI rules
- Everyone: can add plugins and games freely
- Promotions: plugin -> core via checklist in `docs/PLUGINS.md`
