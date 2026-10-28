<!-- 同步自 Channek 仓库 docs/plugin/reference/card-schema.md（由源码生成）。勿手改：跑 scripts/sync-contracts.mjs -->
<!-- 此文件由 pnpm gen:card-ref 生成，请勿手改。 -->
# 频道卡字段表（channel.json）

由 `@channek/style-card` 的 `styleCardSchema` 直接生成，**和 app 读卡时用的是同一份判据**。
写完卡用 `channek check <频道目录>` 验一遍：它报的字段路径就是这张表里的路径。

身份两件事分开：顶层 `id` / `slug` 是**这个频道在这台机器上**的身份，app 首次打开时生成并写回，
导出卡包、拿卡建新频道时会被剥掉，所以手写的卡里不用写；`card.id` 是**卡自己**的身份
（`<发布者>.<名字>`），血缘、市场、「从原卡更新」都认它，必填。`card.slug` 不写就取 `card.id` 最后一段。

## 缺一个就读不通的字段（共 5 个）

「必填」只在父级存在时才生效；这里列的是**整条链都必填**的——一张最小的卡恰好只要这些。

| 字段路径 | | 类型 / 取值 |
|---|---|---|
| `schema` | 必填 | `"channek.channel"` |
| `formatVersion` | 必填 | `2` |
| `name` | 必填 | string |
| `card` | 必填 | object |
| `card.id` | 必填 | string |

## 写了某一段，就必须写全的字段（共 24 个）

这是手写卡最常踩的坑：段本身可选，写了一半就读不通。例如写了 `pipeline.steps`，
每一步的 `key` 与 `step` 就都得有；写了 `presentation.sections`，每一项的 `id` 就都得有。

| 字段路径 | | 类型 / 取值 |
|---|---|---|
| `layout.sections[]` | 必填 | object |
| `layout.sections[].id` | 必填 | string |
| `layout.sections[].path` | 必填 | string |
| `layout.detect.anyOf` | 必填 | string[] |
| `pipeline.steps[]` | 必填 | object |
| `pipeline.steps[].key` | 必填 | string |
| `pipeline.steps[].step` | 必填 | string |
| `presentation.sections[]` | 必填 | object |
| `presentation.sections[].id` | 必填 | string |
| `config.sections` | 必填 | object 或 object[] |
| `requires.providers[]` | 必填 | object |
| `requires.providers[].capability` | 必填 | string |
| `requires.providers[].prefer` | 必填 | string[] |
| `requires.plugins[]` | 必填 | object |
| `requires.plugins[].id` | 必填 | string |
| `runtime.providers[]` | 必填 | object |
| `runtime.providers[].capability` | 必填 | string |
| `runtime.endpoints[]` | 必填 | object |
| `runtime.endpoints[].id` | 必填 | string |
| `runtime.endpoints[].setup.options[]` | 必填 | object |
| `runtime.endpoints[].setup.options[].label` | 必填 | string |
| `bundle.omit[]` | 必填 | object |
| `bundle.omit[].path` | 必填 | string |
| `bundle.demo.path` | 必填 | string |

## 全部字段（共 118 个）

`[]` = 数组里的每一项，`<键>` = 由你起名的键。某个段写了，它下面标「必填」的就都得写。

| 字段路径 | | 类型 / 取值 |
|---|---|---|
| `schema` | 必填 | `"channek.channel"` |
| `formatVersion` | 必填 | `2` |
| `id` | 可选 | string |
| `slug` | 可选 | string |
| `name` | 必填 | string |
| `card` | 必填 | object |
| `card.id` | 必填 | string |
| `card.slug` | 可选 | string |
| `card.version` | 可选 | string |
| `card.createdAt` | 可选 | string |
| `card.modifiedAt` | 可选 | string |
| `appearance` | 可选 | object |
| `appearance.cover` | 可选 | string 或 string 或 null |
| `appearance.color` | 可选 | `red` / `orange` / `amber` / `green` / `teal` / `sky` / `blue` / `indigo` / `violet` / `pink` / `slate` / `graphite` 或 string |
| `appearance.icon` | 可选 | `wave` / `mic` / `film` / `book` / `pen` / `code` / `spark` / `map` / `plane` / `cup` / `leaf` / `chat` / `chart` / `news` / `music` / `camera` / `dice` / `bulb` / `globe` / `heart` / `brush` / `flask` / `cap` / `home` 或 string 或 string |
| `meta` | 可选 | object |
| `meta.author` | 可选 | string |
| `meta.license` | 可选 | string |
| `meta.description` | 可选 | string |
| `meta.tags` | 可选 | string[] |
| `meta.storefront` | 可选 | string |
| `meta.icon` | 可选 | string |
| `meta.preview` | 可选 | string 或 string[] |
| `meta.cover` | 可选 | string 或 string |
| `meta.trailer` | 可选 | string 或 string |
| `meta.homepage` | 可选 | string |
| `meta.repository` | 可选 | string |
| `meta.authorUrl` | 可选 | string |
| `layout` | 可选 | object |
| `layout.preset` | 可选 | string |
| `layout.contentDir` | 可选 | string |
| `layout.entryDirName` | 可选 | string |
| `layout.sections` | 可选 | object[] |
| `layout.sections[]` | 必填 | object |
| `layout.sections[].id` | 必填 | string |
| `layout.sections[].path` | 必填 | string |
| `layout.sections[].index` | 可选 | string |
| `layout.sections[].recipe` | 可选 | boolean |
| `layout.artifacts` | 可选 | { [键]: string } |
| `layout.artifactAlsoRead` | 可选 | { [键]: string[] } |
| `layout.detect` | 可选 | object |
| `layout.detect.anyOf` | 必填 | string[] |
| `layout.progressAnalyzer` | 可选 | string |
| `layout.demoEntry` | 可选 | string |
| `pipeline` | 可选 | object |
| `pipeline.steps` | 可选 | object[] |
| `pipeline.steps[]` | 必填 | object |
| `pipeline.steps[].key` | 必填 | string |
| `pipeline.steps[].step` | 必填 | string |
| `pipeline.steps[].config` | 可选 | { [键]: 任意 } |
| `pipeline.steps[].optional` | 可选 | boolean |
| `presentation` | 可选 | object |
| `presentation.sections` | 可选 | object[] |
| `presentation.sections[]` | 必填 | object |
| `presentation.sections[].id` | 必填 | string |
| `presentation.sections[].provider` | 可选 | string |
| `presentation.defaultSection` | 可选 | string |
| `presentation.contentSurface` | 可选 | string |
| `agent` | 可选 | object |
| `agent.guide` | 可选 | string |
| `agent.skills` | 可选 | string |
| `agent.scripts` | 可选 | string |
| `agent.kickoff` | 可选 | string |
| `agent.prompts` | 可选 | { [键]: string } |
| `agent.docs` | 可选 | { [键]: string } |
| `config` | 可选 | object |
| `config.sections` | 必填 | object 或 object[] |
| `pluginSettings` | 可选 | { [键]: { [键]: 任意 } } |
| `requires` | 可选 | object |
| `requires.app` | 可选 | string |
| `requires.providers` | 可选 | object[] |
| `requires.providers[]` | 必填 | object |
| `requires.providers[].capability` | 必填 | string |
| `requires.providers[].prefer` | 必填 | string[] |
| `requires.providers[].fallback` | 可选 | boolean |
| `requires.providers[].reason` | 可选 | string |
| `requires.providers[].plugins` | 可选 | string[] |
| `requires.plugins` | 可选 | object[] |
| `requires.plugins[]` | 必填 | object |
| `requires.plugins[].id` | 必填 | string |
| `requires.plugins[].optional` | 可选 | boolean |
| `requires.secrets` | 可选 | string[] |
| `plugins` | 可选 | string[] |
| `runtime` | 可选 | object |
| `runtime.providers` | 可选 | object[] |
| `runtime.providers[]` | 必填 | object |
| `runtime.providers[].capability` | 必填 | string |
| `runtime.providers[].prefer` | 可选 | string[] |
| `runtime.providers[].model` | 可选 | string |
| `runtime.providers[].params` | 可选 | { [键]: 任意 } |
| `runtime.providers[].endpoint` | 可选 | string |
| `runtime.providers[].reason` | 可选 | string |
| `runtime.endpoints` | 可选 | object[] |
| `runtime.endpoints[]` | 必填 | object |
| `runtime.endpoints[].id` | 必填 | string |
| `runtime.endpoints[].setup` | 可选 | object |
| `runtime.endpoints[].setup.summary` | 可选 | string |
| `runtime.endpoints[].setup.difficulty` | 可选 | `hosted` / `proxy` / `model` |
| `runtime.endpoints[].setup.options` | 可选 | object[] |
| `runtime.endpoints[].setup.options[]` | 必填 | object |
| `runtime.endpoints[].setup.options[].label` | 必填 | string |
| `runtime.endpoints[].setup.options[].note` | 可选 | string |
| `runtime.endpoints[].setup.options[].url` | 可选 | string |
| `runtime.endpoints[].label` | 可选 | string |
| `runtime.endpoints[].provider` | 可选 | string |
| `runtime.endpoints[].capability` | 可选 | string |
| `runtime.endpoints[].optional` | 可选 | boolean |
| `runtime.endpoints[].example` | 可选 | string |
| `runtime.endpoints[].description` | 可选 | string |
| `bundle` | 可选 | object |
| `bundle.omit` | 可选 | object[] |
| `bundle.omit[]` | 必填 | object |
| `bundle.omit[].path` | 必填 | string |
| `bundle.omit[].reason` | 可选 | string |
| `bundle.demo` | 可选 | object |
| `bundle.demo.path` | 必填 | string |
| `bundle.demo.license` | 可选 | `sample-only` / `cc-by` / `inherit` |
| `bundle.demo.reel` | 可选 | string |
