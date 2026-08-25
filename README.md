<div align="center">

<h1><img src="https://cdn.archeruuu.com/images/channek/logo-triad.png" height="40" align="top" />&nbsp; Channek Skills</h1>

**Make your coding agent fluent in Channek.**

**English** · [简体中文](README.zh-CN.md)

![Agent Skills](https://img.shields.io/badge/agent%20skills-SKILL.md-333333?style=flat-square)
![Skills](https://img.shields.io/badge/skills-3-555555?style=flat-square)
![Contract](https://img.shields.io/badge/contract-synced%20with%20the%20app-005A9C?style=flat-square)
![License](https://img.shields.io/badge/license-Apache--2.0-1A1A1A?style=flat-square)

</div>

---

> ### The docs are for humans. This volume is for the AI.
> To build a [Channek](https://github.com/garveyhu/Channek) style card or plugin, a person reads
> concepts and rationale. A coding agent needs something else entirely: an executable workflow,
> field-level contract tables, templates worth copying verbatim. That is what this repository is —
> install it, and your agent knows the rules before it writes a line.

## What's here

Three skills, one job each:

| skill | What it does | When it wakes |
|---|---|---|
| [`channek-card-dev`](channek-card-dev/SKILL.md) | Author or modify a **style card**: `card.json` layer by layer, portability red lines, packing a `.channekcard` | "write a style card" · "make a channel template" · "package my channel for distribution" |
| [`channek-plugin-dev`](channek-plugin-dev/SKILL.md) | Build a **plugin**: pick a trust tier → manifest → implement (T1 sandbox / T2 privileged) → debug → pack & publish | "write a Channek plugin" · "add a theme / section / capability" |
| [`channek-extension-points`](channek-extension-points/SKILL.md) | The **"I want to build X → where does it plug in"** routing table, plus every contribution key, bridge op and decl at a glance | "what extension points are there" · "where does this feature go" · "what can the suite bridge call" |

Every skill shares one skeleton. `SKILL.md` is the workflow the agent executes — steps, trade-offs,
a self-check list. `references/` holds what it loads on demand: contract tables (field tables, the
bridge-op allowlist, validation rules) and templates worth copying (three manifests, one complete
example card, a zero-dependency T1 entry). The agent carries one thin page and opens the right
table at the right moment — **which is exactly what separates a skill from pasting a documentation
site into context**.

## Install

### Claude Code

```bash
git clone https://github.com/garveyhu/channek-skills.git
cd channek-skills

# Into one project — recommended: active only where you develop cards / plugins
mkdir -p path/to/project/.claude/skills
for s in channek-card-dev channek-plugin-dev channek-extension-points; do
  ln -s "$(pwd)/$s" path/to/project/.claude/skills/
done

# Or globally, for every project
ln -s "$(pwd)/channek-plugin-dev" ~/.claude/skills/
```

No symlinks? Copy the directories. Upgrading is a `git pull`.

### Any other agent

Anything that speaks the [Agent Skills](https://agentskills.io) convention — `SKILL.md` with YAML
frontmatter — can load these: drop a skill directory into that agent's discovery path. Each skill
is self-contained with its `references/`, offline included.

## One source of truth with the app

The contract content here — manifest validation rules, contribution keys, the suite-bridge op
allowlist, the card schema — is aligned with the app's public contracts (`@channek/plugin-kit`,
`@channek/sandbox-sdk`, the card format spec) and tracks app releases. When a table here disagrees
with the app you installed, **the app's validator wins — it is the only party that can reject
you.** Issues welcome.

## Where this sits

Channek's open surface is **formats and protocols**: the card format, the plugin manifest and the
extension-point contracts all have public specs. The developer docs explain them to people; this
repository compiles them into the shape an agent can act on. Same source, different depth —
**read the docs to understand, install this to build.**

## License

Apache-2.0
