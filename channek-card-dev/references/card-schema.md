# 频道卡（channel.json）字段讲解

校验器：卡 schema 的 zod 单一真相源在 app 内（`@channek/style-card`）。**字段、必填、枚举的真值以
`generated/card-schema.md` 为准**（由那份 schema 生成，按 `channel.json` 的写法列）；本文按层讲每一段的
意义与设计理由；标 **（严）** 的规则违反即校验失败。所有卡内路径均为**频道根内相对路径**（频道卡的卡根
就是频道根），`..` 与绝对路径被拒（严）。

## 顶层：只放任何创作都用得上的东西

顶层恰好 18 个键，**多一个就校验失败**（严）——哪怕是个空段，哪怕只是拼错了一个字母：

| 归类 | 键 |
|---|---|
| 身份 | `schema` · `formatVersion` · `id` · `slug` · `name` · `card` |
| 外观与市场 | `appearance` · `meta` |
| 内容怎么组织、怎么做 | `layout` · `pipeline` · `presentation` |
| 给 AI 的入口 | `agent` |
| 参数 | `config` · `pluginSettings` |
| 依赖 | `requires` · `plugins` · `runtime` |
| 打包 | `bundle` |

**为什么顶层这么紧**：顶层每多一个只有视频频道才有的段（画幅、配音、字幕、封面……），写小说、
做面试题的频道就要面对一个与它无关的字段；内核每认识一个领域键，那个领域的知识就焊进了 app。
所以领域参数一律进 `config`，字段定义交给用到它的插件——「这类创作怎么做」才真正随插件和卡走。
顶层不收未知键，也是为了让写错的段当场报错，而不是悄悄混过去、没人读。

## 身份（我是谁）

| 字段 | 必填 | 说明 |
|---|---|---|
| `schema` | ✅ | 恒为 `"channek.channel"` |
| `formatVersion` | ✅ | 恒为 `2` |
| `name` | ✅ | 显示名 |
| `card.id` | ✅ | **卡自己**的身份：`<publisher>.<name>` 点分小写；`channek.*` 保留官方。血缘、市场、「从原卡更新」认它 |
| `card.slug` / `card.version` / `card.createdAt` / `card.modifiedAt` | — | 卡自身的元信息；`card.slug` 不写就取 `card.id` 最后一段；`card.version` 是你的发版号；时间为带时区的 ISO 8601。`card` 段不收别的键（严） |
| `id` / `slug` | — | **这个频道在这台机器上**的身份（`id` 是 `ws_` 加 12 位），app 首次打开时生成并写回；导出卡包、用卡建新频道时剥掉，不要手写 |

**为什么分成两个**：同一张卡可以开出很多个频道（你自己开第二个号、
别人拿去用），卡的身份要在所有这些频道之间保持一致，频道的身份要各不相同——塞进一个字段，分享和复刻就一定有一边是错的。

一张最小的合法卡就是这四个字段：`schema` · `formatVersion` · `name` · `card.id`。其余全部为可选段。

## appearance + meta（外观与市场 · 全可选）

- `appearance`：频道在书架上的样子——`cover` / `color` / `icon`，缺哪项哪项由 app 自动给。
  用这张卡开出来的新频道不继承它。
- `meta`：`author` / `license` / `description` / `tags` / `storefront` / `icon` / `preview[]` / `cover` /
  `trailer` / `homepage` / `repository` / `authorUrl`。`description` 会渲进 AGENTS.md 的「这个频道做什么」。
  **`tags` 是自由标签**（「视频」「竖屏」「小说」），频道中心按它筛选——横竖屏、媒介这类「产出形态」
  不设专门字段，因为它们因创作而异，放进通用元信息就是又一处视频残留。上架规范见 `storefront.md`。
  签名不在卡本体——签名对象是分发包。

## process 层（内容怎么组织、怎么做）

| 段 | 内容 |
|---|---|
| `pipeline` | `{ steps? }`——步序声明，详见 pipeline-and-artifacts.md。**只有 `steps` 一种写法**（严） |
| `layout` | 目录布局：`preset?` / `contentDir?` / `entryDirName?` / `sections?[{id,path,index?,recipe?}]` / `artifacts?`（kind→落点覆盖）/ `artifactAlsoRead?`（kind→备用读位置数组，写位置只有 artifacts 一个）/ `detect?{anyOf}` / `progressAnalyzer?` / `demoEntry?`。`layout` 不收别的键（严） |

**素材库、音效库、场景组件这些目录不在 `layout` 里**——它们是参数，写成 `config` 里的 `fileRef` 字段
（惯例放在 `library` 段：`library.asset`、`library.scenes`……），由读它的插件或你的脚本按完整键取。
`layout` 只回答内核要用的那几件事：内容条目在哪、新条目叫什么、有哪些区、每类工件落哪。

## presentation 层

```jsonc
"presentation": {
  "sections": [ { "id": "homes" }, { "id": "acme.fan-ops.assets" } ],  // 数组序 = 导航序
  "defaultSection": "homes"    // （严）sections 显式声明时必须引用其中一项；id 重复报错
}
```

- 引用 `ui.suiteSection` 贡献 id（含第三方区）。引用未安装的区 → 占位降级，不静默隐藏。
- 无 `presentation` 段的卡走默认链（装了什么区就有什么，`declaredOnly` 的区只在点名时出现）。

## agent（给 AI 的入口 · 全可选）

| 字段 | 内容 | 渲进 AGENTS.md 的哪里 |
|---|---|---|
| `guide` | 工作流说明（如 `sop/README.md`） | 「先看这里」 |
| `scripts` | 脚本目录（如 `sop/kit/scripts`） | 「先看这里」，提醒 agent 跑之前先读脚本开头的用途 |
| `skills` | skill 目录（如 `sop/skills`） | 「这个频道自带的 skill」；同时挂到频道根 `.claude/skills/` |
| `kickoff` | 开工提示（一份 md） | 「动手前先读」第一行；app 的终端开场白也读它 |
| `prompts` | `{ 名字: 路径 }`——提示词 | 「动手前先读」。键是步骤找提示词用的名字（步声明的 `promptKey`），所以那一步在「流程」节里会多一行「写法看 …」 |
| `docs` | `{ 名字: 路径 }`——要先读的文档（判据、品牌规范、速查） | 「卡带的文档」。键是给人看的名字，原样当标签 |

**给 AI 看的东西只有这一个入口**：工作流、方法论、提示词、判据文档都登记在这里，AGENTS.md 按它生成。
`channek check` 会逐个核对这些路径在频道里存不存在。

**宪章不在卡里**：频道的定位、红线、口吻写在频道根 `AGENTS.md` 的手写区（`## 宪章与补充约定（手写·不会被覆盖）`
下的 `### 宪章`），app 生成的托管块「先看这里」第一条恒指向它。

## config（频道参数的唯一位置）

`config.sections[]` 里有两种段，一眼分得开：

| | 作者段 | 插件段 |
|---|---|---|
| 形状 | `{ id, name, group?, hint?, fields }` | `{ id, plugin, values }` |
| 字段定义在哪 | 卡里（字段带值） | **只在插件清单的 `channelConfig` 里**，卡里只存 `短键 → 值` |
| 例子 | 频道定位、品牌、声场、质检阈值、素材目录 | 画幅、字幕、配音、画风锁、封面、发布账号与头像横幅 |
| 校验 | 字段类型、取值合法性（严） | 插件已装：按插件声明校验类型、选项、范围；声明之外的键报警告；没写的键按插件默认值补（只在内存里补，不写回卡）。插件没装：只读显示，照常进 AGENTS.md |

- **键名**：字段里写段内短键（`maxLines`），对外的**完整键 = 段 id + `.` + 短键**（`captions.maxLines`）。
  AGENTS.md、`channek card <完整键>`、插件读值、问卷统一用完整键。**完整键全卡唯一**、段 id 全卡唯一（严）。
- **字段类型八种**：`text` / `number` / `boolean` / `select` / `color` / `fileRef` / `directory` / `list`。
  `directory` 是本机目录，值永不入卡（写了 value 直接被拒·严）；`color` 只收 hex；`fileRef` 是频道内相对路径；
  `list` 是字符串数组。长文本可用 `valueFrom` 外置到频道里的文件（只有作者段能用，与 `value` 互斥·严）。
- **group** 只有 `style` / `rules` / `advanced` 三个值（严），缺省 `style`。
- **brief: false** = 这项只进设置页，不渲进 AGENTS.md。
- **插件段的 `id` 必须是插件声明过的段 id**，`channek check` 找不到这一段会报错；用到的插件同时写进
  `requires.plugins`，收卡人才知道要装它。

**为什么插件段在卡里只存值**：字段定义要是在卡里也抄一份，插件一升级，两份定义必然漂开。
字段名、类型、选项只在插件那里有一份，卡只回答「这个频道取什么值」。

**内核不按名字读任何参数**——没有「起对名字就生效」的特殊键。插件段由声明它的插件读；作者段由你自己的
skill 和脚本按完整键读。加一个参数前先问一句：**谁读它？**

**结构化的大块数据放文件**：设计 token（惯例 `brand/tokens.json`，用作者段字段 `brand.tokens` 指过去）、
音色档、平台矩阵、封面套件，都是频道里的一份 JSON，卡里只记路径（`fileRef`）。内核只校验路径在频道内；
内容由读它的插件校验。

完整的字段写法与八种类型的例子见 [`blueprints/flywheel-diary/templates/config-section.jsonc`](blueprints/flywheel-diary/templates/config-section.jsonc)。

### 问卷：字段上的 `ask`

字段带 `ask: { example? }` = 用这张卡开频道时要问收卡人这一项。频道定位惯例是一个 id 为 `profile` 的作者段
（赛道、受众、人设、口号……），其中「换个人就该换」的字段挂 `ask`：

- **导出时**：带 `ask` 的作者段字段撤下作者原值，原值改作那道题的示例（题里已有 `example` 就不覆盖）；
- **开频道时**：只问这几道题，不答就留空——而不是悄悄顶着作者的人设开工。使用者不能借问卷改卡的其它字段。
- 回答按文本写回，所以问卷字段用 `text`。撤值与回填只作用于作者段；插件段的 `ask` 写在插件清单里，由插件自己处理。

## config 与 pluginSettings 的分工

| | `config` 里的插件段 | `pluginSettings` |
|---|---|---|
| 装什么 | 频道的事实与规范：画幅、音色、字幕规范、发布账号 | 插件内部的调参：采样步数、CFG、呼吸时长 |
| 谁读 | agent、频道脚本、多个插件 | 只有那一个插件 |
| 进 AGENTS.md | 进 | 不进 |
| 在哪改 | 设置 › 本频道 › 参数 | 设置 › 插件 › 那个插件 |

判据：**agent 或别的插件需要知道的，进 `config`；只有这个插件自己关心的，进 `pluginSettings`。**
`pluginSettings` 形如 `{ <插件 id>: { <参数键>: 值 } }`，只有插件声明了随卡走（`snapshot: true`）的键会生效，
端点、密钥、模型目录这类机器级的键一律被剔除。

## needs 层

| 段 | 内容 |
|---|---|
| `requires` | `{ app?, providers?, plugins?, secrets? }`——详见 requires-and-secrets.md |
| `plugins` | 频道插件目录（相对频道根，如 `plugins/acme.talkfast-suite`）：住在频道里、随卡分享，收卡人打开频道时先过信任卡才加载。只有这个频道用的插件放这里，多个频道都用的做成全局插件、走 `requires.plugins` |
| `bundle` | 分发清单：`omit?[{path,reason?}]`（打包跳过 + 导入披露）/ `demo?{path,license,reel?}`（随卡示例内容，license 三值 `sample-only`(默认)/`cc-by`/`inherit`） |

## runtime 层

| 段 | 内容 |
|---|---|
| `runtime.endpoints` | **只声明需要哪些端点**：`[{ id, capability?, … }]`。id 全卡唯一（严）；capability 必须是合法能力 id（严）；**端点值（URL / 路径等）写进来直接被 schema 拒**（严·红线）——真值属于本机插件设置 |
| `runtime.providers` | 作者「实际用的」provider / 模型 / 参数记录——**仅展示用**（卡详情与导入向导），不参与运行时选路；每 capability 至多一条绑定（严），`endpoint` 引用必须 ∈ `runtime.endpoints`（严） |

## 段内必填（踩坑最多的一处）

**「这个段可以不写」≠「段内字段可以不填」。** 段是可选的，但一旦写了，段里标必填的字段一个都不能少
——少一个整张卡就读不通，app 会把这个频道按普通文件夹打开（见 SKILL.md 第 3 步）。

**清单与枚举取值不在这里抄**：看 `generated/card-schema.md` 的「写了某一段，就必须写全的字段」
一节，那张表由 app 源码里的 schema 直接生成。插件段的字段与取值看那个插件清单的 `channelConfig`。

写完用 `channek check <频道目录>` 验，它报的字段路径和生成表一一对应，插件段的值也按本机装着的插件清单校验。

> 实测教训：一个段写成了一组自造字段，四个真必填字段一个没填。卡因此不合法，
> 表现出来却是「设置页整页显示别的频道的卡」，查了半小时源码才定位到。所以写完先过 `channek check`，
> 别等打开 app 才发现。

## 分享（拷贝语义）

导出 `.channel` 带走的是**做法**：频道卡（去掉顶层 `id` / `slug`）+ 频道里的做法文件 + 频道插件 +
按 `requires` 携带的全局插件。**不带**：`layout.contentDir` 与没标 `recipe` 的 `sections`、点开头的本机状态、
生成物、`bundle.omit` 声明的东西。带 `ask` 的字段导出时撤下原值、改作那道题的示例。
导出器还会扫一遍做法文件，提示写死了频道名或人设的地方——别人用这张卡时 agent 也会照着说，建议改成通用说法。
