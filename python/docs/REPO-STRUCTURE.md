
# Repo structure cheatsheet (Python)
```
/engine
  /voltronussy_engine
    /abstractions
    /core
    /plugin_host
/adapters
  /null_adapter
  /pygame_adapter        # optional
/plugins
  /<plugin_name>
    plugin.json
    plugin.py            # or package folder
    tests/
/games
  /example_headless
  /example_pygame        # optional
/docs
/.github
pyproject.toml
```

## Ownership model
- Engine maintainers: `/engine` and CI rules
- Everyone: can add plugins and games freely
- Promotions: plugin -> core via checklist in `docs/PLUGINS.md`
