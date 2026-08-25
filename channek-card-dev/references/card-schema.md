# card.json 字段表

校验器：卡 schema 的 zod 单一真相源在 app 内（`@channek/style-card`）。本表按层摘录；
标 **（严）** 的规则违反即校验失败。所有卡内路径均为**卡根内相对路径**，`..` 与绝对路径被拒（严）。

## 顶层

| 字段 | 必填 | 说明 |
|---|---|---|
| `schema` | ✅ | 恒为 `"channek.stylecard"` |
| `formatVersion` | ✅ | 恒为 `2` |
| `id` | ✅ | `<publisher>.<name>` 点分小写；`channek.*` 保留官方 |
| `name` | ✅ | 显示名 |
| `slug` | ✅ | 频道 slug（目录 / 工件模板里 `{slug}` 的值来源） |
| `face` / `cardVersion` / `createdAt` / `modifiedAt` | — | 元信息；时间为带时区的 ISO 8601 |

其余全部为可选段。未知字段被保留（passthrough），但别依赖这一点存私货。

## identity 层（可选）

`identity`：定位 / 人设 / 受众 / 格式（orientation 等）——描述「这是个什么频道」。

## style 层（全部可选段；段出现则段内严校验）

| 段 | 内容 | 段内严校验 |
|---|---|---|
| `brand` | 品牌 token（colors / accent / 字体等） | `tokens.accent` 必须是 `tokens.colors` 里的键（严） |
| `locks` | 画风锁 / 风格约束 | |
| `voice` | 音色档案 | `default` 必须 ∈ `profiles`（严）；遗留的 `profiles.*.modelPath` 已 deprecated——加载警告、导出剥离 |
| `captions` | 字幕样式 | |
| `cover` | 封面规范 | |
| `audio` | 混音 / 音频规范 | |
| `libraries` | 素材库索引 | |
| `generation` | 生成默认参数 | |
| `freeze` | 冻结闸（哪些东西不许改） | |
| `docs` | 频道知识文档索引（章程 / QC 清单…） | |
| `platforms` | 平台档案表（`Record<平台, …>`） | |
| `publish` | 发布规范 | |

## process 层

| 段 | 内容 |
|---|---|
| `pipeline` | `{ template?, steps? }`——步序声明，详见 pipeline-and-artifacts.md |
| `layout` | 目录布局：`preset?` / `contentDir?` / `entryDirName?` / `sections?[{id,path,index?}]` / `artifacts?`（kind→落点覆盖）/ `artifactAlsoRead?`（kind→备用读位置数组，写位置只有 artifacts 一个）/ `detect?{anyOf}` / `progressAnalyzer?` / `demoEntry?` / `cardAssets?` |
| `layout.cardAssets` | 卡根内资产约定：`libraries`（sound/asset/scenes/reusable/ipActions/soundIntro/soundBgm/skills 各为卡内相对路径）/ `pipelineFixedSounds?` / `docs?` / `brandAssets?{root,avatar?,banners?}` |
| `editor` | 剪辑台预设：`trackTemplate?[{kind,name}]` / `macros?` / `panels?` / `exportPreset?` |
| `prompts` | `Record<键, 卡内相对路径>`——prompt 资产索引，步 config 引用 |
| `config` | 卡自声明的可编辑配置（声明驱动配置 UI） |

## presentation 层

```jsonc
"presentation": {
  "sections": [ { "id": "homes" }, { "id": "acme.fan-ops.assets" } ],  // 数组序 = 导航序
  "defaultSection": "homes"    // （严）sections 显式声明时必须引用其中一项；id 重复报错
}
```

- 引用 `ui.suiteSection` 贡献 id（含第三方区）。引用未安装的区 → 占位降级，不静默隐藏。
- 无 `presentation` 段的卡走默认链（装了什么区就有什么，`declaredOnly` 的区只在点名时出现）。

## needs 层

| 段 | 内容 |
|---|---|
| `requires` | `{ app?, providers?, plugins?, secrets? }`——详见 requires-and-secrets.md |
| `bundle` | 分发清单：`omit?[{path,reason?}]`（打包跳过 + 导入披露）/ `demo?{path,license,reel?}`（随卡示例内容，license 三值 `sample-only`(默认)/`cc-by`/`inherit`） |

## runtime 层

| 段 | 内容 |
|---|---|
| `runtime.endpoints` | **只声明需要哪些端点**：`[{ id, capability?, … }]`。id 全卡唯一（严）；capability 必须是合法能力 id（严）；**端点值（URL / 路径等）写进来直接被 schema 拒**（严·红线）——真值属于本机插件设置 |
| `runtime.providers` | 作者「实际用的」provider / 模型 / 参数记录——**仅展示用**（卡详情与导入向导），不参与运行时选路；每 capability 至多一条绑定（严），`endpoint` 引用必须 ∈ `runtime.endpoints`（严） |
| `pluginSettings` | 随卡分发的插件设置快照（只有字段声明了 `snapshot: true` 的键会生效；机器级键一律被剔除） |

## meta 层（市场元信息，全可选）

`author` / `license` / `description` / `icon`（卡内相对路径）/ `preview[]`（≤6，外链或卡内路径）/
`cover` / `trailer`（仅外链）/ `homepage` / `repository` / `storefront`（STOREFRONT.md 自定义位置）。
签名不在卡本体——签名对象是分发包（bundle 层）。
