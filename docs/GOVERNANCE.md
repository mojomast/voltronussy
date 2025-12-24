# Governance

How decisions are made and how code flows through the project.

---

## Maintainers

Current maintainers (update this list as needed):

| GitHub Handle | Area | Role |
|---------------|------|------|
| @PLACEHOLDER | Engine Core | Lead Maintainer |
| @PLACEHOLDER | TypeScript Track | Track Lead |
| @PLACEHOLDER | Python Track | Track Lead |
| @PLACEHOLDER | Community | Community Manager |

Maintainers are responsible for:
- Reviewing PRs that touch `packages/*`
- Approving plugin promotions
- Maintaining CI and repo health
- Resolving disputes

---

## CODEOWNERS

We use GitHub CODEOWNERS to auto-assign reviewers:

```
# Engine core requires maintainer review
/typescript/packages/ @engine-maintainers
/python/engine/ @engine-maintainers

# Adapters require maintainer review
/typescript/adapters/ @engine-maintainers
/python/adapters/ @engine-maintainers

# Games and plugins can be reviewed by anyone
# (but maintainers can step in if needed)
/typescript/games/ @community-reviewers
/typescript/plugins/ @community-reviewers
/python/games/ @community-reviewers
/python/plugins/ @community-reviewers

# Docs and governance require maintainer review
/docs/ @engine-maintainers
/.github/ @engine-maintainers
```

---

## Patch Queue Process

All non-trivial engine changes go through the patch queue.

### Labels

| Label | Meaning | Who applies |
|-------|---------|-------------|
| `patch:proposal` | Someone wants to add/change something | Author |
| `patch:accepted` | Maintainers approved the idea | Maintainer |
| `patch:in-progress` | Actively being worked on | Author |
| `patch:needs-review` | Ready for maintainer review | Author |
| `patch:ready-for-promotion` | Plugin proven, ready for core | Maintainer |
| `patch:promoted` | Merged into core or blessed | Maintainer |
| `patch:rejected` | Not going to happen | Maintainer |
| `engine:breaking-change` | Requires version bump | Anyone |
| `game:submission` | New game being added | Author |
| `good-first-issue` | Good for newcomers | Maintainer |

### Workflow

```
                    ┌─────────────────┐
                    │ patch:proposal  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
              ┌─────┤ Maintainer      ├─────┐
              │     │ Review          │     │
              │     └─────────────────┘     │
              │                             │
     ┌────────▼────────┐          ┌────────▼────────┐
     │ patch:rejected  │          │ patch:accepted  │
     └─────────────────┘          └────────┬────────┘
                                           │
                                  ┌────────▼────────┐
                                  │ patch:in-progress│
                                  └────────┬────────┘
                                           │
                                  ┌────────▼────────┐
                                  │ PR Submitted    │
                                  │ patch:needs-review│
                                  └────────┬────────┘
                                           │
                                  ┌────────▼────────┐
                                  │ Merged as Plugin │
                                  └────────┬────────┘
                                           │
                              ┌────────────┴────────────┐
                              │                         │
                    ┌─────────▼─────────┐   ┌──────────▼──────────┐
                    │ Stays as Plugin   │   │ patch:ready-for-    │
                    │ (status: stable)  │   │ promotion           │
                    └───────────────────┘   └──────────┬──────────┘
                                                       │
                                            ┌──────────▼──────────┐
                                            │ Promotion Review    │
                                            └──────────┬──────────┘
                                                       │
                                            ┌──────────▼──────────┐
                                            │ patch:promoted      │
                                            │ (moved to core)     │
                                            └─────────────────────┘
```

---

## Promotion Rules

A plugin can be promoted to core when:

### Requirements Checklist

- [ ] **Used in production** — At least one game in `/games` depends on it
- [ ] **Tested** — Has tests running in CI
- [ ] **Documented** — Has a README with usage examples
- [ ] **Stable API** — No breaking changes in last 2 releases
- [ ] **No breakage** — All sample games still work
- [ ] **Clean code** — Follows code style, no TODOs or hacks
- [ ] **Maintainer sponsor** — At least one maintainer vouches for it

### Promotion Types

1. **Core Module** — Moves into `packages/engine-*`
   - Becomes part of the engine API
   - Subject to stricter versioning rules
   - Must maintain backwards compatibility

2. **Blessed Plugin** — Stays in `plugins/` with `status: "stable"`
   - Recommended for use
   - Maintained by the team
   - Safe to depend on

### Promotion Process

1. Author or maintainer opens issue with label `patch:ready-for-promotion`
2. Maintainers review against the checklist
3. If approved, maintainer creates PR to:
   - Move code (if becoming core module)
   - Update status to `stable` (if becoming blessed plugin)
   - Update documentation
4. PR merged, label changed to `patch:promoted`

---

## Breaking Changes Policy

### What counts as breaking?

- Removing a public function/type
- Changing function signatures
- Changing behavior that games rely on
- Removing or renaming config options

### Process for breaking changes

1. Open issue with label `engine:breaking-change`
2. Discuss with maintainers and affected game authors
3. If approved:
   - Bump `engineApiVersion`
   - Write migration guide
   - Update all sample games
   - Add deprecation warnings before removal (when possible)

### Deprecation Timeline

1. **Mark deprecated** — Add `@deprecated` and console warning
2. **Wait one minor version** — Give games time to migrate
3. **Remove** — In the next minor version

---

## Decision Records

Significant decisions are recorded in `/docs/DECISIONS/` as ADRs (Architecture Decision Records).

Format:
```markdown
# ADR-NNN: Title

**Status:** Accepted | Superseded | Deprecated
**Date:** YYYY-MM-DD

## Context
What is the issue we're deciding on?

## Decision
What did we decide?

## Consequences
What are the implications?
```

---

## Dispute Resolution

If there's disagreement:

1. Discuss in the issue/PR
2. If unresolved, tag `@maintainers`
3. Maintainers discuss and vote if needed
4. Lead maintainer has final say

Keep it civil. We're here to make games, not drama.

---

## Becoming a Maintainer

Maintainers are added by existing maintainers when someone:

- Has contributed multiple quality PRs
- Helps review others' PRs
- Participates constructively in discussions
- Shows good judgment about what belongs in core

To nominate someone (including yourself), open a Discussion.

---

*Last updated: December 23, 2025*
