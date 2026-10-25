# 频道卡（channel.json）字段讲解

校验器：卡 schema 的 zod 单一真相源在 app 内（`@channek/style-card`）。**字段、必填、枚举的真值以
`generated/card-schema.md` 为准**（由那份 schema 生成，按 `channel.json` 的写法列）；本文按层讲每一段的
意义与设计理由；标 **（严）** 的规则违反即校验失败。所有卡内路径均为**频道根内相对路径**（频道卡的卡根
就是频道根），`..` 与绝对路径被拒（严）。

## 外壳（我是谁）

| 字段 | 必填 | 说明 |
|---|---|---|
| `schema` | ✅ | 恒为 `"channek.channel"` |
| `formatVersion` | ✅ | 恒为 `1` |
| `name` | ✅ | 显示名 |
| `card.id` | ✅ | **卡自己**的身份：`<publisher>.<name>` 点分小写；`channek.*` 保留官方。血缘、市场、「从原卡更新」认它 |
| `card.slug` / `card.version` / `card.face` / `card.createdAt` / `card.modifiedAt` | — | 卡自身的元信息；`card.slug` 不写就取 `card.id` 最后一段；`card.version` 是你的发版号；时间为带时区的 ISO 8601。`card` 段不收别的键（严） |
| `id` / `slug` | — | **这个频道在这台机器上**的身份（`id` 是 `ws_` 加 12 位），app 首次打开时生成并写回；导出卡包、用卡建新频道时剥掉，不要手写 |

**为什么分成两个**：同一张卡可以开出很多个频道（你自己开第二个号、
别人拿去用），卡的身份要在所有这些频道之间保持一致，频道的身份要各不相同——塞进一个字段，分享和复刻就一定有一边是错的。

一张最小的合法卡就是这四个字段：`schema` · `formatVersion` · `name` · `card.id`。其余全部为可选段。
未知字段被保留（passthrough），但别依赖这一点存私货——内核不认识的段写了也没人读。

## profile + format（这是个什么频道 · 可选）

- `profile`：定位 / 人设 / 受众 / 口号 / 简介……——描述「这是个什么频道」。这些多半是**作者本人**的，
  分享前用 `questions` 把它们点名（见下文「分享与问卷」），收卡人会被问到、换成他自己的。
- `format`：成片形态的三个枚举（`orientation` / `persona` / `captions`），写了就三个全写（严）。

## style 层（全部可选段；段出现则段内严校验）

| 段 | 内容 | 段内严校验 |
|---|---|---|
| `brand` | 品牌 token（colors / accent / 字体等） | `tokens.accent` 必须是 `tokens.colors` 里的键（严） |
| `locks` | 画风锁 / 风格约束（人读判据文档的 `docRef` 等） | |
| `voice` | 音色档案 | `default` 必须 ∈ `profiles`（严）；遗留的 `profiles.*.modelPath` 已 deprecated——加载警告、导出剥离 |
| `captions` | 字幕样式 | |
| `cover` | 封面规范 | |
| `audio` | 混音 / 音频规范 | |
| `libraries` | 素材库索引 | |
| `generation` | 生成默认参数 | |
| `freeze` | 冻结闸（哪些东西不许改） | |
| `docs` | 频道知识文档索引（`ipBrief` / `brandSpec` / `readme`…） | |
| `platforms` | 平台档案表（`Record<平台, …>`） | |

**内核要读的创作参数只认 `config` 段**：画风锁（`channek.visual.*`）、配音（`channek.voice.*`）、字幕
（`channek.captions.*`）、冻结闸（`channek.freeze.*`）、发布账号（`channek.publish.accounts`）这些语义键，
卡在 `config` 里用同名 key 声明，内核才认识；没声明就是没有。上表这些 style 段写了照样合法，但**不会替
`config` 兜底**——想让画风锁生效，就在 `config` 里声明它。

**宪章不在卡里**：频道的定位、红线、口吻写在频道根 `AGENTS.md` 的手写区（`## 宪章与补充约定（手写·不会被覆盖）`
下的 `### 宪章`），app 生成的托管块「先看这里」第一条恒指向它。卡里没有宪章字段，也没有单独的宪章文件。

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

## 段内必填(踩坑最多的一处)

**「这个段可以不写」≠「段内字段可以不填」。** 段是可选的,但一旦写了,段里标必填的字段一个都不能少
——少一个整张卡就读不通,app 会把这个频道按普通文件夹打开(见 SKILL.md 第 3 步)。

**清单与枚举取值不在这里抄**:看 `generated/card-schema.md` 的「写了某一段，就必须写全的字段」
一节,那张表由 app 源码里的 schema 直接生成。这里曾经放过一份手抄的快照,它漏掉了
`format` 下的三个必填枚举(`orientation` / `persona` / `captions`)——有人照着写卡就踩了。

写完用 `channek check <频道目录>` 验,它报的字段路径和生成表一一对应。

> 实测教训:`captions` 段写成 `{style, maxCharsPerLine, docRef}` —— 前两个是自造字段
> (schema 是 passthrough,收下但没人读),而四个真必填字段一个没填。卡因此不合法,
> 表现出来却是「设置页整页显示别的频道的卡」,查了半小时源码才定位到。

## 频道独有的几段

| 段 | 内容 | 说明 |
|---|---|---|
| `plugins` | 频道插件目录（相对频道根，如 `plugins/acme.talkfast-suite`） | 住在频道里、随卡分享的插件；收卡人打开频道时先过信任卡才加载。只有这个频道用的插件放这里，多个频道都用的做成全局插件、走 `requires.plugins` |
| `agent.guide` | 工作流说明（如 `sop/README.md`） | 写进频道根 `AGENTS.md` 托管块的「先看这里」 |
| `agent.skills` | skill 目录（如 `sop/skills`） | 挂到频道根 `.claude/skills/`；写了就覆盖 `layout.cardAssets.libraries.skills` |
| `agent.scripts` | 脚本目录（如 `sop/kit/scripts`） | 同样写进「先看这里」，提醒 agent 跑之前先读脚本开头的用途 |
| `questions` | 用这张卡开频道时问的题，键是本文件的字段路径（如 `profile.persona`），值 `{ label, example?, optional? }` | 只认这里点名的键（使用者不能借问卷改卡的任意字段）；不答就留空 |
| `layout.sections[].recipe` | `true` = 这个区是菜谱（如质检教训） | 分享时随卡走、算卡文件；不标的区是做出来的东西，不带 |

## 分享与问卷（拷贝语义）

导出 `.channekcard` 带走的是**做法**：频道卡（去掉顶层 `id` / `slug`）+ 频道里的做法文件 + 频道插件 +
按 `requires` 携带的全局插件。**不带**：`layout.contentDir` 与没标 `recipe` 的 `sections`、点开头的本机状态、
生成物、`bundle.omit` 声明的东西。`questions` 点名的字段导出时撤下原值、改作那道题的示例。
导出器还会扫一遍做法文件，提示写死了频道名或人设的地方——别人用这张卡时 agent 也会照着说，建议改成通用说法。
