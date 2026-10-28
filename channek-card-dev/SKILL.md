---
name: channek-card-dev
description: 开发、修改、校验并分享一个 Channek 频道（频道卡 channel.json / .channel）。当用户要「做一个 Channek 频道」「写频道卡 / channel.json」「把我的流程变成频道」「声明出片流程 pipeline」「把频道分享给别人 / 一键复刻」「修卡的 requires / layout / presentation / config / 问卷」「打开文件夹后它不是频道 / 卡读不出来」时使用。Use when developing a Channek channel card (channel.json), creating a channel, debugging a card that won't load, or packaging a .channel bundle.
---

# Channek 频道开发

**频道卡是什么，一句白话**：一份描述「这类创作怎么做」的说明书——分几步、什么风格、文件放哪、
要用到哪些能力。它像一份菜谱：写清步骤和要用的工具，但菜谱本身不含锅也不含火（卡是纯数据，
永远不含代码；能力由插件提供，卡只声明「我要用哪些」）。

**频道 = 一个文件夹 + 根目录一份频道卡 `channel.json`**。文件夹里怎么摆完全由你定，推荐摆成两半：
`sop/` 是**怎么做**（菜谱：流程说明、给 agent 的 skill、提示词、脚本、质检教训），
`work/` 是**做出来的东西**（菜：每一期、选题、复盘）。分享的形态是 `.channel` 包——
**分享是拷贝做法，不拷作品**：收卡人拿到的是 `sop/` 那一半和这张卡，开出来的是他自己的频道。

## 怎么带用户（先读这段）

来找你做频道的多半是**创作者，不是工程师**。守住四条：

1. **说人话**。术语第一次出现给一句白话解释（如「pipeline，就是你从想法到发布的那几步」）。
   用户听不懂不是用户的问题，是你的问题。
2. **一次只问一两个问题**，别一口气抛一张问卷。用户答不上来就给 2~3 个带推荐的选项让他挑
   （「多数口播频道是：选题 → 写稿 → 配音 → 剪辑 → 发布，你也差不多？哪里不一样？」）。
3. **用户说的是想法，不是字段名**。把「我想让我的视频都是那种手绘风」翻译成对应的卡字段
   （`config` 里出图插件的画风锁段：`visual.imagePrompt` / `visual.negativePrompt` / `visual.seed`），不要反问他术语。
4. **动手前复述方案**（「你要的是一个 X 频道，流程五步…我准备这样写，对吗？」），确认后再写文件；
   **写完要交代**：每个文件是干嘛的、怎么在 app 里打开看效果、下一步能做什么。

## 工作流

### 0. 先判断用户要干哪件事

- **从零做一个频道** → 走完整访谈（下一步）。
- **已经有一套跑顺了的流程（一个文件夹、几份说明、几个脚本）** → 别从零设计：把它的步骤整理进卡，
  文件夹原样就是频道，只在根目录补一份 `channel.json`。
- **改现有的频道** → 先读他的 `channel.json`，复述你理解的现状，再问要改哪里。
- **把频道分享出去** → 跳到第 8 步，重点过「分享前自检」。
- **「我想要一个像样的频道，不只是一张能跑的卡」** → 先看样板：
  [`references/blueprints/`](references/blueprints/)。

> **样板是这份 skill 里唯一回答「写成什么样才好用」的东西。** 字段表管合法性，样板管质量——
> 目录怎么切、判据写在哪、方法论怎么随卡走、翻车经验怎么变成下次拦得住的闸，这些没有 schema 管。
> [`blueprints/flywheel-diary/`](references/blueprints/flywheel-diary/) 是一个跑通过几十条内容的
> 九步视频频道的完整拆解（七章 + 可抄模板 + 复刻清单）；索引页还有图文 / 播客 / 第二个视频频道的
> 横向对照，含**成熟度诚实标注**（哪些跑通过、哪些只是骨架）。

### 1. 访谈：问清创作系统的形状

四组问题，按顺序聊（不是一次全问），每组给出建议默认值：

| 问什么 | 白话问法 | 答不上来时的默认 |
|---|---|---|
| **流程** | 「从一个想法到发出去，你平时分几步？哪些步想让 AI 自动干，哪些你要亲手做？」 | 五步：选题 → 写稿 → 配音 → 剪辑 → 发布 |
| **风格** | 「有没有固定的品牌色 / 声音 / 字幕样子 / 画风？」 | 全部留空——`config` 里的参数段都是可选的，以后随时补 |
| **目录** | 「你的稿子、成片这些文件，习惯放什么目录结构？」 | `sop/` + `work/`：每一期放 `work/runs/<日期-slug>/` |
| **依赖** | 「哪几步要靠外部能力（出图 / 配音 / 转写 / 发布）？有没有指定想用哪家？」 | 只声明能力不点名插件，由收卡人机器上的候选顶上 |

**新手路线**：必填只有 4 个字段（`schema` · `formatVersion` · `name` · `card.id`），再加一个三五步的
`pipeline` 就是一个能用的频道——先跑起来，风格与布局以后再加。不要一上来就把所有段都填满。

### 2. 写 channel.json

骨架从 `references/channel-template.jsonc` 抄（它过得了 app 的校验）；**字段、必填、枚举查
`references/generated/card-schema.md`**——那张表由 app 源码里的 schema 生成，按 `channel.json` 的写法列，
和 app 读卡同一份判据。`references/card-schema.md` 讲的是每一段为什么这么设计。要点：

- **文件名固定、位置固定**：只能叫 `channel.json`，只能放频道根——app 只认这一份，别的文件名、子目录里的卡都不认。
  除此之外目录随你。
- **必填只有 4 个**：`schema: "channek.channel"` · `formatVersion: 2` · `name` · `card.id`。其余全部可选；
  **某段一旦写了，段内必填就要写全、段内引用会被严格校验**（如写了 `presentation.defaultSection`，
  它必须是 `presentation.sections` 里真实存在的一个）。
- **顶层只认 18 个键**（`schema` `formatVersion` `id` `slug` `name` `card` `appearance` `meta` `layout`
  `pipeline` `presentation` `agent` `config` `pluginSettings` `requires` `plugins` `runtime` `bundle`），
  多写一个就校验失败——画幅、配音、字幕、品牌这类领域参数一律不在顶层，在 `config` 里。
- **两个身份别混**：`card.id` 是**卡自己**的名字，用 `<发布者>.<名字>` 点分小写（如 `acme.talkfast`；
  `channek.*` 是官方保留）——血缘、市场、「从原卡更新」都认它，必填；版本号写 `card.version`。
  顶层 `id` / `slug` 是**这个频道在某台机器上**的身份，app 首次打开时生成并写回，你不用写，导出时也会剥掉。
- 流程写进 `pipeline.steps`（步序 + 每步配置，只有这一种写法）、目录写进 `layout`（含工件落点覆盖）、
  界面写进 `presentation`（启用哪些功能区）、依赖写进 `requires`、市场筛选标签写进 `meta.tags`
  （如 `["视频", "横屏"]`）——细则见 `references/pipeline-and-artifacts.md` 与 `references/requires-and-secrets.md`。
- **一切参数写进 `config`**，它有两种段：
  - **作者段** `{ id, name, group?, hint?, fields }`：字段定义和值都在卡里。频道是谁写进 id 为 `profile`
    的作者段（赛道、受众、人设……）；设计 token 放进一个 JSON 文件（惯例 `brand/tokens.json`），用作者段字段
    `brand.tokens`（`fileRef`）指过去；素材目录这类位置也是参数（惯例 `library.asset`、`library.scenes`）；
    质检阈值、声场这类你自己的 skill 和脚本要读的值同理。
  - **插件段** `{ id, plugin, values }`：卡里只存值，字段定义在那个插件清单的 `channelConfig` 里——画幅、
    字幕、配音、画风锁、发布账号这类由插件读的参数走这种。段 id 和字段名照插件清单写，插件写进 `requires.plugins`。

  完整键 = 段 id + `.` + 字段短键（`profile.persona`、`captions.maxLines`），AGENTS.md、`channek card`、
  插件都按完整键取值。**内核不按名字读任何参数**：没人读的参数只是一行展示。
- 给 agent 的入口全写进 `agent`：`guide`（工作流说明，如 `sop/README.md`）、`skills`（如 `sop/skills`）、
  `scripts`（如 `sop/kit/scripts`）、`kickoff`（开工提示）、`prompts`（名字 → 提示词）、`docs`（名字 → 要先读的文档）。
  app 会把它们写进频道根 `AGENTS.md`，skill 挂到 `.claude/skills/`——在频道根开 Claude / Codex 就能照着走（见第 6 步）。
- **宪章不进卡**：频道的定位、红线、口吻写在频道根 `AGENTS.md` 托管块下方的手写区——
  标题 `## 宪章与补充约定（手写·不会被覆盖）`，下面分 `### 宪章` 与 `### 补充约定`。
  托管块（`channek:begin` 到 `channek:end`）由 app 按卡生成，「先看这里」第一条就指向宪章；手写区同步时一字不动。
  **打开频道只刷新已有的 `AGENTS.md`，不会新建**——手搭的频道先放一份只写手写区的 `AGENTS.md`，
  在 app 里打开后托管块会插到它上方。

> **想知道一张成熟的卡各段该占多大比重**（剧透：`config` 占一半、`pipeline` 只占很小一块）、
> config 怎么分组、hint 怎么写、阈值为什么要配容差项——看
> [`references/blueprints/flywheel-diary/02-card-config.md`](references/blueprints/flywheel-diary/02-card-config.md)。

### 3. 先过 schema（机器判 · 最硬的一道闸）

**写完 channel.json 的第一件事，是用 app 自己的判据验一遍，不是用你自己写的检查脚本。**
自写脚本查得了路径引用和可移植红线，查不了字段级的结构合法性——两者不是一回事。

```bash
channek check <频道目录>     # 随 Channek app 安装
```

它报的是 `channel.json` 里的字段路径（如 `presentation.defaultSection：…`），对照
`references/generated/card-schema.md` 就能改；`config` 里的插件段按本机装着的插件清单校验（如
`config.captions：captions.stroke must be one of: …`）。零错误才算过。它还会提醒：频道目录名与 `card.id` 不一致、
`agent` / `plugins` 指向的路径不存在、插件段对应的插件没装（值没校验）。

**为什么这道闸必须排在最前**：卡不合 schema 时，app 打开这个文件夹后**不会当成频道**——
它会先按普通文件夹打开，顶上一条横幅写着「这里的频道卡没能认出来」和出错的字段。
横幅离你写卡的那一刻已经隔了好几步，而且只有打开 app 才看得见；`channek check` 在写完那一刻就告诉你。

| 他看到的 | 真实原因 |
|---|---|
| 打开文件夹后是普通文件夹，横幅写「频道卡没能认出来」加一串字段 | 卡不合 schema，按横幅上的字段改，改完点「重新读取」 |
| 横幅写「卡库里已有一张同 id 的卡」 | 频道是从别的频道复制来的，没改 `card.id`——两张卡撞了主键 |
| 频道管理器里它显示成「普通文件夹」 | 同上两条之一：卡没被认下来 |

**最容易踩的一类**：**可选段一旦写了，段内必填字段一个都不能少**。
「这个段可以不写」≠「段内字段可以不填」。完整清单见 `references/generated/card-schema.md` 的
「写了某一段，就必须写全的字段」一节。另一类同样常见：**顶层多写了一个键**（拼错的段名、照着别处抄来的旧段），
`channek check` 会报 `Unrecognized key(s)`——删掉它，那个参数该进 `config`。

### 4. 过可移植红线（每次保存前自检）

卡要在**别人的机器**上活，所以「只在你这台机器上成立的东西」一律不进卡：

- [ ] **密钥值**不进卡——卡只声明「要哪把钥匙」，钥匙本身由每个用户自己在 app 里填。
- [ ] **本机绝对路径**（`/Users/...`、`C:\...`、`~` 开头）不进卡——别人机器上没有这个路径。
      这类因机而异的配置属于插件设置，不属于卡。
- [ ] `runtime.endpoints` 段**只声明需要哪些端点**，URL / 端口 / 模型路径等真值写了会被
      schema 直接拒（这是校验红线，不是风格建议）。
- [ ] 卡内相对路径不含 `..`、不是绝对路径（防路径逃逸，校验会拒）。
- [ ] 要代码就做成插件：只有这个频道用的，放进频道自己的 `plugins/<插件id>/` 并在卡的 `plugins` 里声明
      （**频道插件**，收卡人打开频道时先过信任卡）；多个频道都要用的，做成全局插件，卡用 `requires.plugins` 引用。
      写插件见 `channek-plugin-dev`。

### 5. 过流程体检（写完 pipeline 后自查）

- [ ] 每步 `key` 唯一（key 是这一步在这个频道里的名字，进度记账、文件归属都认它）。
- [ ] 引用的步骤 id、工件类型、功能区 id 都真实存在（来自内置、`requires.plugins` 或频道插件）。
- [ ] 每步要吃的工件，上游有步骤产出它（步骤之间只靠文件衔接——断链在导入时就会被体检报出来，
      不会等用户跑到第 5 步才炸）。
- [ ] 每步 `config` 符合那一步声明的配置结构。
- [ ] `presentation.defaultSection`（若写）必须在 `presentation.sections` 里。

### 6. 给频道带上 skill（方法论跟着卡走）

**一张只有 channel.json 的卡，是把方法论留在了作者脑子里。** 收卡人拿到配置、拿不到「这个频道
怎么做内容」——他会照着自己的习惯做，做出来不是这个频道的东西。

所以频道要带一套 skill，放在 `sop/skills/`，卡里写 `agent.skills: "sop/skills"`，app 会把它们挂到
频道根 `.claude/skills/`：

```
sop/skills/
├── _shared/读卡与调能力.md   接口契约：怎么读卡、怎么调能力 + 本频道的取值速查表
├── <每一步>-craft/           一步一份：吃什么、交出什么、读哪些卡值、调哪条能力、自检、卡住怎么办
└── produce-flow/             总编排：交接链、顺序约束、卡住退回哪
```

**每份 SKILL.md 的骨架**：frontmatter（何时用 / 不用）→ 吃什么 / 交出什么（**说语义 id**）
→ 怎么做（引用卡的 `agent.prompts`，别复制判据）→ 要读的卡值（说明为什么不能写死）
→ 要调的能力（**只写 id**，参数让人 `channek cap` 问）→ 交出前自检 → 卡住了怎么办。

> **`prompts` 与 `skills` 的分工**：prompts 是**喂给模型的作业指令**（卡的 `agent.prompts` 登记它，
> 推荐放 `sop/prompts/`），skills 是**给 agent 的操作手册**。skill 引用 prompts，不复制——
> 复制就是第二个真相源，改一处忘一处。

再写一份 `sop/README.md` 讲清整条流程（卡里写 `agent.guide`），频道自带的脚本放 `sop/kit/scripts/`
（卡里写 `agent.scripts`，每个脚本开头一句话写它做什么）——在频道根开 Claude / Codex 的人，
第一眼就从 `AGENTS.md` 的「先看这里」找到这两处。

**填空模板 + 三层结构的完整讲法**见
[`references/blueprints/flywheel-diary/04-methodology.md`](references/blueprints/flywheel-diary/04-methodology.md)
与 [`templates/step-skill-skeleton.md`](references/blueprints/flywheel-diary/templates/step-skill-skeleton.md)。

**在交接口上挂可执行的闸。** 每一步「交出什么」的地方放一个 `check_*.py`，读卡取阈值、
退出码绿了才算交出。它们拦的是**「结构完好、退出码 0、但内容是错的」**那一类——
那类问题只有渲完才看得见，代价是整片重来。翻车攒下来的教训写进 `sop/lessons/`，并在 `layout.sections`
里把它登记成 `recipe: true` 的区——它是菜谱的一部分，分享时跟着卡走。

### 7. 跑通第一条内容（卡的真正验收）

**过了 schema 只说明卡合法，不说明卡能用。** 拿它真做一条内容，是唯一的验收方式，
也是把方法论攒进 `sop/skills/` 的唯一途径。

这一步会踩的坑另开一份：[`references/first-content-run.md`](references/first-content-run.md)——
三条铁律（活让能力干 / 取值读卡 / 工件说语义 id）、九步交接链、素材分层、验收原则，
以及按代价排序的**水土不服清单**。**动手前先读它**，那些坑每一条都是真金白银换的。

### 8. 交付与分享

**先教用户把频道用起来**（比分享更优先）：

1. 在 app 里**直接「打开文件夹」**选这个频道目录——app 认出根目录的 `channel.json`，频道就出现了；
   首次打开会补上这台机器上的频道身份（顶层 `id` / `slug`）。带了频道插件的会先弹信任卡；
2. 打开频道看灯轨：步骤序和他描述的一致吗？缺插件的步会显示占位卡（「由插件 X 提供 · 未安装」），
   这是正常的诚实降级，不是坏了。

**要分享才做打包**——分享是拷贝做法，不拷作品与身份：

- **会带走的**：`channel.json`（去掉频道身份）、`sop/` 等做法文件、频道插件（`plugins/`）、
  标了 `recipe` 的区；按 `requires` 收携带的全局插件。
- **不会带走的**：`layout.contentDir` 与没标 `recipe` 的 `sections`（做出来的东西）、点开头的本机状态
  （`.channek/`、`.claude/`）、`node_modules` 等生成物，以及你在 `bundle.omit` 里声明的大资产
  （带 `reason`，导入时会原样告诉收卡人「这块要你自己补」）。
- **身份问收卡人**：人设、口号这类属于你本人的字段，在 `config` 的 `profile` 段里给它挂上 `ask`（如
  `{ "key": "persona", "name": "人设", "type": "text", "value": "…", "ask": { "example": "…" } }`）。
  导出时它们的值会撤下、改作示例；收卡人开频道时被问到，可以不填，而不是顶着你的人设开工。
- 上架物料写 `meta` 段，市场长文写 `STOREFRONT.md`（规范见 `references/storefront.md`）。
- 频道在书架上的样子写 `appearance` 段（`cover` / `color` / `icon`，都可选，不写就由 app 自动给）：
  封面只收 https 链接或频道文件夹里的相对路径；颜色写键名；图标写内置图标的键名，或一张图
  （账号头像之类：https 链接，或频道文件夹里带图片扩展名的相对路径，如 `brand/icon.png`）。可选值见字段表。
  用这张卡开出来的新频道**不继承** `appearance`，会重新自动分配，免得和你的频道长得一模一样。
- 导出用 app 的导出功能，**绝不手工 zip**——导出器会剥掉本机路径、排除内容与本机状态、
  撤下问卷字段，并提示做法文件里**写死的频道名或人设**（别人用的时候 AI 也会照着说，建议改成通用说法）。
- 验收标准：在另一台机器导入这个卡包，体检报告正确列出缺插件 / 缺能力 / 缺密钥三张清单；
  用它开出新频道时问卷出现，补齐依赖后可以正常创作。

## 常见判断

| 问题 | 答案 |
|---|---|
| 这个配置放卡里还是插件设置里？ | 因机因人而异的（路径、端点、密钥）→ 插件设置；描述创作方式本身的（步序、风格、提示词）→ 卡 |
| 参数放 `config` 还是 `pluginSettings`？ | agent、脚本或别的插件要知道的（画幅、音色、字幕规范）→ `config`；只有那一个插件自己关心的调参（采样步数、CFG）→ `pluginSettings` |
| 参数写成作者段还是插件段？ | 有插件在清单里声明了这一段 → 插件段，只写值；只有你自己的 skill / 脚本读 → 作者段，自己写字段定义 |
| 想锁死某家能力提供方不许降级？ | `requires.providers[].fallback: false`；缺省是「建议优先，没装就用别家顶上」 |
| 步骤没装会怎样？ | 灯轨照常显示 + 占位卡提示装哪个插件；标了 `optional: true` 的步会被跳过——**只降级不崩溃**，但要在 `requires.plugins` 里声明，导入向导才知道引导用户装什么 |
| 提示词放哪？ | `sop/prompts/`（纯文本），`agent.prompts` 登记（键用步骤的 `promptKey`），开工提示写 `agent.kickoff` |
| 插件放频道里还是装成全局？ | 只有这个频道用 → 频道插件（`plugins/<id>/` + 卡的 `plugins`）；多个频道都用 → 全局插件 + `requires.plugins` |
| 某个区（如质检教训）分享时要不要带？ | 是做法的一部分 → 在 `layout.sections` 里标 `recipe: true`；是做出来的东西 → 不标，默认不带 |

## References

- `references/generated/card-schema.md`——**频道卡字段表（由 app 源码生成，按 channel.json 写法）**：整链必填 · 写了某段就必须写全的字段 · 全部字段
- `references/card-schema.md`——每一段为什么这么设计（讲道理，字段真值以生成表为准）
- `references/pipeline-and-artifacts.md`——pipeline / layout / 工件契约与解耦原理
- `references/requires-and-secrets.md`——requires 依赖声明、能力偏好链、密钥推导
- `references/channel-template.jsonc`——可抄的完整示例频道卡（口播快剪 6 步频道·含作者段、插件段与问卷）
- `references/storefront.md`——meta 段与 STOREFRONT.md 上架规范
- `references/first-content-run.md`——**卡写完之后**：第一次拿它跑一条内容会踩什么（三条铁律 / 交接链 / 素材分层 / 验收原则 / 水土不服清单）

### 样板频道（写成什么样才好用）

- `references/blueprints/README.md`——**索引**：真实频道的横向对照（视频 / 图文 / 播客）、
  `layout.sections` 的内核约定 id、九步超集的抽步与借步、方法论承载的几条路线
- `references/blueprints/flywheel-diary/`——**九步视频频道完整拆解**（全景 + 复刻清单）：
  - `01-skeleton.md`——目录骨架：做法 / 品牌 / 内容三块怎么切、哪些入库、条目内部怎么摆
  - `02-card-config.md`——成熟频道卡的比例尺 · pipeline 是重映射层 · layout 的相对基准 · config 的分组 / hint / 阈值容差对 · requires 的降级三层
  - `03-agents-md.md`——**AGENTS.md 托管块不手写**：托管块各节由卡的哪一段喂出来 · 信任围栏 · `agent` 段的提示词与文档 · 手写区（宪章 / 补充约定）
  - `04-methodology.md`——prompts / docs / skills 三件套 · skills 三层 · 单步骨架 · 装闸契约 · 范式指纹
  - `05-scripts-and-gates.md`——脚本读卡的几条路 · 退出码 · 报告契约 · HUMAN_CHECKS · 日期门 · 可移植条款
  - `06-content-ops.md`——情报分层 · 绝不双写 · 进度双轨 · 质检记忆 + 通则 · 复盘双闭环
  - `07-style-and-publish.md`——指引机制 · 宪章 vs config · 静 / 动两张脸 · 判据手法 · token 防线 · 平台矩阵 + provenance
  - `templates/`——可抄模板（config 段：两种段 + 八种字段类型 + 问卷、单步 skill 填空骨架、gitignore）
