# 02 · 频道卡实战：912 行的 channel.json 是怎么排布的

> 字段的**语法**查 [`../../card-schema.md`](../../card-schema.md)（真值以
> [`../../generated/card-schema.md`](../../generated/card-schema.md) 为准）。这一章讲**排布**——
> 一份成熟的频道卡各段占多大比重、命名怎么定、值放哪一层。

## 全卡比例尺（先看这个）

飞轮日记的 `channel.json` 共 **912 行**，`card.version: "1.0.0"`。各段规模：

| 段 | 行数 | 占比 | 一句话 |
|---|---|---|---|
| 外壳 + 频道身份 | 5 | 1% | schema / formatVersion / id / slug / name |
| `card` | 7 | 1% | 卡自己的身份：id / slug / version / face / createdAt |
| `profile` · `format` | 15 | 2% | 定位 / 人设 / 策略 + 横竖屏 / 字幕颗粒 |
| `platforms` · `cover` | 23 | 3% | 四平台开关 + 封面套件指针 |
| `brand` | 58 | 6% | design token + IP 吉祥物 + 代码配色 |
| `pipeline` | 41 | 4.5% | 九步（**只是 key→step 映射**） |
| `layout` | 103 | 11% | 目录 + 22 条工件落点 + 8 个资源库 + 8 条文档 |
| `prompts` | 7 | 1% | 五份提示词登记 |
| **`config`** | **460** | **50%** | **8 组 54 项创作参数** |
| `presentation` | 14 | 2% | 三个功能区 |
| `requires` | 105 | 12% | 9 条能力 + 4 个全局插件 |
| `plugins` | 3 | — | 1 个频道插件 |
| `runtime` | 3 | — | **刻意留空** |
| `pluginSettings` | 13 | 1% | 按插件 id 旁挂 |
| `meta` | 10 | 1% | 上架物料 |
| `bundle` | 24 | 3% | 5 条剔除声明 |
| `agent` | 5 | 1% | 给 agent 的三个入口 |
| `questions` | 13 | 1% | 用卡开频道时问的三道题 |

**两个数字要记住**：`config` 占一半，`pipeline` 不到 5%。

新手直觉是反的——以为写卡主要是设计流程。**流程只是九行映射；真正的工作量在「把这个频道的
每一条判据变成一个可读可改的配置项」。**

## 身份：两层，各管一件事

```json
{
  "schema": "channek.channel",
  "formatVersion": 1,             // 生态级 schema 版本，全生态统一
  "id": "ws_s1wapvwedqmb",        // ← 这个频道在这台机器上的身份：app 首次打开时生成写回
  "slug": "ch-wedqmb",            // ← 同上。分发的卡里不写，导出时自动剥掉
  "name": "飞轮日记",              // 必填
  "card": {
    "id": "<作者>.<频道>",          // 必填·卡自己的身份：反域名式，小写点分
    "slug": "feilun-diary",       // ASCII 短名
    "version": "1.0.0",           // 这张卡自己的版本，配 CHANGELOG
    "face": "v2-鲜艳潮IP",          // ← 人话字符串，不是枚举
    "createdAt": "2026-07-24T05:35:04.964Z"
  }
}
```

- **两层身份分开**：顶层 `id` / `slug` 是「这个频道」——收卡人用你的卡开出来的是另一个频道，
  所以它不出门；`card.id` 是「这张卡」——血缘、市场、「从原卡更新」都认它，所以它跟着卡走。
  **手写的卡写 `card.id`，顶层 `id` / `slug` 留给 app**（导出卡包、拿卡建新频道时都会剥掉）。
  最小合法频道卡四个字段：`schema` / `formatVersion` / `name` / `card.id`。
- **`formatVersion` 与 `card.version` 分开两个字段**——前者是生态契约，后者是你的发版号。
- **`card.face` 是一句话标签，带版本前缀**。同作者其它卡分别是 `"v1-卡通经济学"` /
  `"纸白编辑感·墨绿点睛"` / `"暖灯深夜·纸感人声"`。它回答「这张卡长什么脸」，一眼可辨。
- **卡根就是频道根**。`channel.json` 是内核唯一认的固定文件名，只认频道根这一份；
  除此之外每个目录名都由卡声明，内核不认任何写死的子目录。

## `profile` 与 `format`：人设归人设，格式归做法

```json
"profile": {
  "niche": "AI 底层逻辑 / 前沿趋势 / 深度拆解（认知向）",
  "persona": "带你看透技术泡沫的 AI 深度拆解者",
  "slogan": "…", "mindWord": "认知飞轮 / 底层逻辑", "strategy": "浅引流 … → 深收割 …",
  "audience": "…", "pillars": "…", "bio": "…"
},
"format": { "orientation": "landscape", "persona": "none", "captions": "sentence" }
```

这两样分成两段，是因为**它们的变化率不同**：

- **`profile` 是「这个频道是谁」**——换一个人用这套做法，这些值全都该换。分享时它们不当身份带走，
  可以被 `questions` 点名、导出时撤下原值改作示例（见下文「问卷」）。
- **`format` 是做法的一部分**——横竖屏 / 数字人 / 字幕颗粒决定了流程怎么跑，换个人照样适用。
  它只对视频频道有意义，所以是可选段，写了就得三项写全。

`slogan` / `mindWord` / `strategy` 三个字段**不是装饰**：它们会渲进 AGENTS.md 的「这个频道做什么」，
写稿和选题的 AI 往它上打。`pillars` 则只当备注显示——渲染器照实标成「备注·不是硬约束」。

## `pipeline`：它是重映射层，不是流程定义

**全段原文（九步全给，这就是全部）：**

```json
"pipeline": {
  "template": "channek.explainer-9",
  "steps": [
    { "key": "topic",      "step": "channek.topic" },
    { "key": "script",     "step": "channek.script" },
    { "key": "storyboard", "step": "channek.storyboard" },
    { "key": "asset",      "step": "channek.asset" },
    { "key": "voice",      "step": "channek.voice" },
    { "key": "caption",    "step": "channek.caption" },
    { "key": "edit",       "step": "channek.edit" },
    { "key": "cover",      "step": "channek.cover" },
    { "key": "publish",    "step": "channek.publish" }
  ]
}
```

**这份成熟卡的每一步只用了两个字段**（schema 还允许 `config` 与 `optional`，它没用上）：

- **`step`** = 内核 / 插件提供的步 id。**行为定义在插件里，不在卡里。**
- **`key`** = 这张卡给这一步起的本地名。它是灯轨上报时用的那个 key
  （`channek invoke channek.report-step … step=<key>`）。

同作者四张卡的对照，一眼看出 pipeline 的自由度：

| 卡 | `template` | 步数 | key → step |
|---|---|---|---|
| 视频 · 飞轮日记 | `channek.explainer-9` | 9 | topic→topic … publish→publish |
| 视频 · 比奇堡经济学 | `channek.explainer-9` | 9 | 同上 |
| 播客 · 独立开发夜话 | 无 | 6 | topic→topic, **outline→script**, **record→voice**, **transcript→caption**, **cut→edit**, **release→publish** |
| 图文 · 工具笔记 | 无 | 3 | topic→topic, **draft→script**, **submit→publish** |

**三个自由度**：步数可变（3 / 6 / 9）· 可跳步（图文卡从 script 直接到 publish）·
**可改名**（播客卡把 `channek.script` 叫「outline」、把 `channek.voice` 叫「record」）。

`template` 只在成套复用九步时才写。

> **「可选步 / 降级」不在 pipeline 里声明**——它在 `requires` 里（见下文「降级三层」）。

## `layout`：整张卡最「范式」的一段

### 三套相对基准，别搞混

| 声明位置 | 路径相对谁 |
|---|---|
| `layout.cardAssets.*` · `layout.contentDir` · `layout.sections[].path` · `layout.detect.anyOf` · `prompts.*` · `config` 里的 `fileRef` · `agent.*` · `plugins[]` · `bundle.omit[].path` · `meta.cover` / `meta.preview` | **频道根**（= 卡根） |
| `layout.artifacts.*` | **条目目录**（`<contentDir>/<entryDirName>/`） |
| `brandAssets.banners[]` / `avatar[]` | **`brandAssets.root`** |

三套。卡根就是频道根，所以不存在「相对卡目录」还是「相对频道根」的分别——
卡里写的路径一律从频道根起算。剩下这三套写卡时仍要逐条对照，别凭感觉。

### `cardAssets.libraries`：英文语义名 → 实际目录

```json
"libraries": {
  "sound":      "brand/audio",
  "asset":      "brand/library",
  "scenes":     "sop/kit/scenes",
  "reusable":   "sop/kit/snippets",
  "ipActions":  "动作库",      // ← 子目录名（在 brandAssets.root/<IP名>/ 之下）
  "soundIntro": "进场",        // ← 子目录名（相对 sound）
  "soundBgm":   "背景乐",      // ← 子目录名（相对 sound）
  "skills":     "sop/skills"
},
"pipelineFixedSounds": [ "whoosh.wav", "pop.wav", "进场.wav" ]
```

**键是英文语义名，值是实际目录。** 脚本一律拿 `libraries.sound` 说话，永不写 `brand/audio`。
这样目录想挪就挪，代码不动——迁到频道卡时整套目录从 `BGM音效/` `素材库/` 搬到 `brand/` 下，
改的只是这几行值，按 `libraries.*` 取目录的代码不用动。

⚠️ 那三个**子目录名**（`ipActions` / `soundIntro` / `soundBgm`）不是频道根路径，别照抄成一级目录。

> skill 目录现在有两处可以声明：新写法是 `agent.skills`（见下文），写了就覆盖
> `libraries.skills`。飞轮日记两处都写了同一个值，是迁移时为兼容旧读法留的。

### `cardAssets.docs`：键名是「旧段位的点号路径」

```json
"docs": {
  "brand.tokensRef":           "brand/tokens.dtcg.json",
  "locks.visualStyle.docRef":  "brand/locks/画风锁.md",
  "locks.motionSound.docRef":  "brand/locks/动效音线锁.md",
  "captions.docRef":           "brand/字幕样式/README.md",
  "docs.ipBrief":              "brand/品牌文档/IP定位书.md",
  "docs.brandSpec":            "brand/品牌文档/品牌规范.md",
  "docs.engineBlocks":         "sop/kit/snippets/引擎积木速查.md",
  "docs.readme":               "sop/README.md"
}
```

**这是全卡最精巧的一处，值得单独理解。**

键名不是随手起的，是**卡内段位的点号路径**——`locks.visualStyle.docRef` 挂在一个
**已经不存在的 `locks` 段**下。为什么？因为机器值搬进了 `config` 段，但人读判据留在 md 里：

```
config.sound（15 个机器值）  ←hint 指向→  docs["locks.motionSound.docRef"] → brand/locks/动效音线锁.md
```

`config.sound` 那一组的 hint 直写：「动效音线锁的机器值（**原 locks.motionSound**·人读判据在锁文档）」。

**段位迁移了，引用名不变。** 这是可迁移性的一个范例做法。注意方向只有一个：
内核要读的机器值（画风锁、配音、字幕、冻结、发布账号……）**只认 `config` 段里的声明**，
卡里即便还留着 `locks` 之类的段，也不会替 `config` 兜底——`locks.*.docRef` 只剩「挂载点的名字」这一个身份。

> 前 7 个键是[内核认识的固定挂载点](03-agents-md.md#layoutcardassetsdocs-的七个挂载点)，
> 会渲进 AGENTS.md 的「频道的脸与法」节。第 8 个 `docs.engineBlocks` 是自造键——照样能挂，
> 只是渲染时直接显示键名。宪章不在这里挂：它就写在 `AGENTS.md` 的手写区，不是一份单独的文件。

### `artifacts`：22 条语义 id → 条目内相对路径

```json
"artifacts": {
  "channek.entry":             "选题卡.md",
  "channek.script":            "脚本.md",
  "channek.storyboard":        "工程/scenes.json",
  "channek.assets":            "素材",
  "channek.assetsConcept":     "素材/概念动画",
  "channek.assetsReal":        "素材/真材料",
  "channek.assetsGenerated":   "素材/生图",
  "channek.assetsSprite":      "素材/精灵",
  "channek.voiceTrack":        "配音/voiceover-track.wav",
  "channek.componentRegistry": "工程/components/components.registry.json",
  "channek.captionCues":       "字幕/cues.json",
  "channek.project":           "工程/{slug}.channek",       // ← 模板
  "channek.master":            "母版/master.mp4",
  "channek.covers":            "封面/封面-*.png",            // ← glob
  "channek.delivery":          "分发/发布",
  "channek.polishedCut":       "剪辑",
  "channek.slices":            "分发/切片"
  // …共 22 条
},
"detect": { "anyOf": [ "work/runs" ] }
```

**四条命名约定：**

1. **一个 id 可指向四种形态**：文件（`脚本.md`）· 目录（`素材`）· 模板（`工程/{slug}.channek`）·
   通配（`封面/封面-*.png`）。消费方不需要预先知道是哪种。
2. **`channek.<语义名>` 驼峰，名字描述「这是什么」不描述「它在哪」**——
   `voiceTrack` 而不是 `wavFile`，`captionCues` 而不是 `cuesJson`。
3. **前缀族表达从属**：`channek.assets` 打头，下挂 `assetsConcept` / `assetsReal` /
   `assetsGenerated` / `assetsSprite` 四个分区，一眼看出是同一类。
4. **与 step id 同名 = 这一步的主产物**（步 `channek.script` ↔ 工件 `channek.script`）。
   注意刻意的单复数避重：步是 `channek.asset`（单数），工件是 `channek.assets`（复数）。

条目内的落点在迁移时**一条都没变**——它们相对条目目录，条目搬到哪都一样。这正是第三套基准存在的意义。

`detect.anyOf` 是布局探针：目录里出现这几条路径之一，就认定是这套布局。
**认不认得是频道，看的是根目录有没有 `channel.json`**，探针不管这件事。

### `sections`：四个功能区，id 用内核约定名

```json
"contentDir": "work/runs",
"entryDirName": "{date}-{slug}",
"sections": [
  { "id": "intel",  "path": "work/intel" },
  { "id": "topics", "path": "work/inbox", "index": "选题库.md" },
  { "id": "review", "path": "work/review" },
  { "id": "qc",     "path": "sop/lessons", "recipe": true }
]
```

**`id` 用内核认识的四个约定名**（`intel` / `topics` / `review` / `qc`），
**`path` 用你自己的目录名**。飞轮日记把三个作品区收在 `work/` 下，质检区放在 `sop/` 里。

> 约定 id 写对了，AGENTS.md 的目录结构节才会渲成「情报库（选题原料）」这样的中文说明；
> 写别的 id 会原样显示英文。

**`recipe: true` 决定这个区分享时跟不跟卡走。** 缺省 = 做出来的东西（情报、选题、复盘），
分享是拷贝做法、不拷作品，所以不进卡包、也不算卡文件；标了 `recipe` = 这个区是菜谱
（如质检教训），随卡带走。`contentDir` 永远算作品。

判据和 01 那条切分线是同一句话：**别人拿走这套做法时，这个区该不该跟着？**
踩坑账该——它就是「这类片子会在哪翻车」的答案；选题库不该——那是你的选题，不是他的。

**路径模板变量只有两个**：`{date}`（YYMMDD）与 `{slug}`。

## `config`：460 行，这一段才是主体

### 组的排布：五组「创作参数」+ 三组「规则」

| # | `id` | `name` | `group` | 项数 |
|---|---|---|---|---|
| 1 | `channek.visual` | 画风锁 | — | 4 |
| 2 | `channek.voice` | 配音 | — | 6 |
| 3 | `channek.captions` | 字幕 | — | 4 |
| 4 | `sound` | 声场 | — | **15** |
| 5 | `cover` | 封面 | — | 1 |
| 6 | `channek.freeze` | 冻结锁 | **`rules`** | 3 |
| 7 | `quality` | 质量门 | **`rules`** | **19** |
| 8 | `channek.publish` | 发布 | **`rules`** | 2 |

**排序逻辑**：前五组是「改了片子长得不一样」的创作参数；后三组打 `group: "rules"`，
是「改了是放不放行」的规则。`group` 只有三个合法值（`style` / `rules` / `advanced`），
**内核定名，卡只选归哪组**——不许自己发明组名。

### 点号即层级：section.id 是 field.key 的前缀

54 个 key **无一例外**以所在组的 `id` 打头：

```
组 id  "sound"          → key  "sound.bgmBpmMin"
组 id  "channek.voice"  → key  "channek.voice.pace"
```

三个收益：key 全局唯一无需额外校验 · 从任意 key 能反推它归哪组 ·
渲染 AGENTS.md 时按前缀直接分组，不用第二份映射表。

### 命名空间纪律：三种前缀，一眼分清归属

| 前缀 | 含义 | 用在哪 |
|---|---|---|
| `channek.*` | **内核 / 官方插件认得的东西** | 语义配置键 · 全部 22 条工件 id · 全部 9 条能力 · 全部 9 个步 id |
| 裸词根 | **纯本卡自定义** | `sound` / `cover` / `quality` 组；`intel` / `topics` 等 section id；pipeline 的 key |
| `<作者>.*` | **第三方插件与 provider** | `links.homes` / `links.voxcpm-local` / `links.remotion` / 频道插件 `links.feilun-suite` |

### 字段形态实测分布

| type | 出现次数 | 备注 |
|---|---|---|
| `number` | 28 | 承载全部阈值 |
| `text` | 12 | 5 处带 `multiline: true` |
| `boolean` | 8 | 开关与冻结锁 |
| `select` | 3 | `options: [{value, label}]`——机器存英文枚举、UI 显中文 |
| `fileRef` | 3 | **独立类型不是 text**，app 能给文件选择器 |

字段名用 **`name`**（不是 `label`）、**`value`**（不是 `default`）。

### hint 写「判据」，不写「定义」

这是 `config` 段最值得抄的一条。对比：

```
❌ 定义式： "hint": "单镜最长允许多少秒"
✅ 判据式： "hint": "一镜超上限是取舍，一串镜超上限是节奏塌了——分镜闸只拦后者"
✅ 判据式： "hint": "组件里写了字号却没写字族的比例；漏写就回落系统字，中文当场变宋体"
✅ 用法式： "hint": "每项翻成 no <x> 进生成 prompt"
```

`quality` 组 19 条里 16 条是判据式。**hint 承担的是「这条尺子为什么存在、它防的是哪种偷懒」**
——这让配置文件本身成为方法论文档，而不是一张待查的参数表。

### 阈值 + 容差成对：闸只拦系统性塌陷

```json
{ "key": "quality.sceneMaxSec",       "value": 25 },
{ "key": "quality.sceneOverLimitMax", "value": 1,
  "hint": "一镜超上限是取舍，一串镜超上限是节奏塌了——分镜闸只拦后者" },

{ "key": "quality.animCoverageMin",      "value": 0.75 },
{ "key": "quality.animCoverageUnderMax", "value": 1,
  "hint": "一个组件天生是短揭示（转场镜）是取舍，一串组件都早早画完才是节奏塌了——闸只拦后者" }
```

**单点越界是取舍，一串越界才是塌陷。** 每个阈值配一个容差项，闸判的是容差。

阈值自带「为什么不是 0」的解释也是这套的一部分：

```json
{ "key": "quality.perpetualSitesMax", "value": 2,
  "hint": "停不下来的周期动画…有收敛终点的一次性余波不算。定 0 会误伤加载转圈这类本来就该转的机制性循环" }
```

### 交叉验证：两域都命中才定罪

```json
{ "key": "quality.deadFrameSec", "value": 2,
  "hint": "像素域测量，只作佐证不单独定罪：判官是源码域的关键帧空窗（maxStillGapSec），两域都命中才算数。像素域单独绿不构成通过——它此前被一层刻意的背景噪声长期顶着" },
{ "key": "quality.maxStillGapSec", "value": 2,
  "hint": "覆盖率只看最后一拍落在哪，看不见中间僵住…这条量的是最坏的那处空档" },
{ "key": "quality.keyframesPerSecMin", "value": 0.6,
  "hint": "空窗看最坏的一处，密度看整镜有没有被填满，两个都要" }
```

**一道能被一层装饰静音的闸不是闸**——它比没有闸更坏，因为它发过章。

### 闸有生效日期：质量标准可以持续加严而不产生历史债

```json
{ "key": "quality.gateSinceDate", "value": 260825,
  "hint": "内容项目录名前六位就是它的日期（如 260828）。早于这天的旧内容只提示不拦——旧片不重烘，把标准用在新片上" }
```

它**直接依赖 `layout.entryDirName` 的 `{date}` 前缀**（YYMMDD）——两段跨段咬合，判定零成本。

### config 里可以放「历史档案」

```json
{ "key": "channek.voice.note", "name": "音色沿革", "type": "text", "multiline": true,
  "value": "2026-07-12 激情版重录重训（v1 情绪平淡）。lora-v2 step_0000450 耳选胜出（600 步过拟合·新文本泛化不稳）。声纹 vs 激情版：无提示 0.907 / +提示 0.950（v1 生产版 0.889）。v1 profile 保留可切回。" }
```

**决策依据跟着值走，不另开文档。** 半年后想「当初为什么选 450 步不选 600 步」，
答案就在那个值旁边。

### `fileRef` 的两处 hint 都写「整体替换式」

```json
{ "key": "channek.publish.matrix", "type": "fileRef", "value": "brand/平台矩阵/platforms.json",
  "hint": "四平台的交付规格、硬上限与封面关联（机器配置·整体替换式）。标 null 的格是「没有尺子」，读到就如实报检不了，不许折叠成通过" }
```

两条约定：外置 JSON **不做字段级 merge，要改整份换**；**`null` 的语义是「没有尺子」，
不是「通过」**。「不知道」不许被压缩成「通过」是贯穿全卡的原则。

## `brand`：三个巧思

```json
"brand": {
  "tokens": {
    "colors": { "ink": "…", "paper": "…", "yellow": "…", "blue": "…", "red": "…", "mint": "…" },
    "accent": "mint",                       // ← 指针，不是 hex 值
    "fonts": { "display": [...], "body": [...], "mono": [...] },
    "stroke": 3, "radius": 14, "grid": 8
  },
  "mascot": {
    "name": "emo",                          // ← 决定 IP 素材的目录名
    "kind": "Q 版手绘黑猫",
    "i2vSubject": "…", "i2vStyle": "…",     // ← 可照抄的生成配方
    "visualPrompt": "…",
    "clipMap": { "nod": "smile" },          // ← 动作别名降级表
    "assetRef": "brand/emo/定妆图/<定妆图>.png"
  },
  "codeTheme": { "comment": "…", "parameter": "…", "string": "…", "function": "…" }
}
```

1. **`accent` 是指针不是值**（`"mint"` 指向 `colors.mint`）——换强调色只改一个词。
2. **`clipMap` 是资产级的缺件降级表**：`{"nod": "smile"}` = 「要点头？没有，拿微笑那组顶」。
3. **`visualPrompt` / `i2vSubject` / `i2vStyle` 是可照抄的生成配方**——
   打包时 IP 实体资产被 `bundle.omit` 剔掉了，但**配方留着**，收卡人照它造自己的 IP。

`brand` 整段可选：只有视频这类要「脸」的频道才写。写作频道一个字都不用写。

`brandAssets.banners` 的数组是**优先级链**：

```json
"banners": {
  "douyin": [ "背景/背景-抖音-1125x633.png", "背景/背景-母版-2560x1440.png" ]
}
```

抖音先用专供尺寸，没有就回落母版。

## `requires`：全局插件按 id 要

**没有 `capabilities` / `secrets` / `endpoints` 独立子段**——密钥与端点是**刻意不进卡**的。

```json
"requires": {
  "app": ">=0.0.1",
  "providers": [
    { "capability": "channek.tts",
      "prefer": [ "links.voxcpm-local" ],
      "plugins": [ "links.voice-lab" ],
      "reason": "配音由语音合成插件在本机直跑。音色模型不随卡分发，你要接自己的音色。" },
    { "capability": "channek.music",
      "prefer": [ "links.acestep-local" ],
      "plugins": [ "links.sound-gen" ],
      "reason": "这条片值得专属底床时现造一条。换 ElevenLabs 也能跑，要付费档。缺它则只能用频道固定底床。" },
    { "capability": "channek.audio-track",
      "prefer": [],                          // ← 空数组 = 不挑家，谁提供都行
      "plugins": [ "links.ffmpeg" ],
      "reason": "05 配音步的末尾把逐幕旁白按镜序拼成一条完整人声轨。缺它则配音出得来、拼不成轨。" }
  ],
  "plugins": [
    { "id": "links.homes",
      "reason": "presentation 里的第一个功能区（也是默认落点）由它提供，缺它开频道就落在灰占位上。" },
    { "id": "links.production",
      "reason": "九步出片流程与这九步产出的工件种类定义都由它提供。缺它则内容详情页的步骤与灯轨无法定位工件。" }
    // …共 4 个
  ]
}
```

**`reason` 的句式是统一的**，值得当模板背：

> 先说这一步在干什么（带步号「05 配音步」），再说 **「换 X 也能跑，代价是 Y」** 或
> **「缺它则 Z」**。

**`prefer: []` 与 `prefer: [某家]` 语义不同**：空数组 = 不挑家；非空 = 按这家调优过，换家有差异。

`capability` 与 `plugins` 是**多对多**：一个 ffmpeg 插件提供四条能力，一个 sound-gen 插件提供两条。

## `plugins`：住在频道里的插件

```json
"plugins": [ "plugins/links.feilun-suite" ]
```

`requires.plugins` 要的是**全局插件**：单独安装，任何频道都能用，按 id 引用。
`plugins` 声明的是**频道插件**：源码就住在这个频道的文件夹里（飞轮日记用 `plugins/<插件id>/`），
**只在这个频道加载**，别的频道看不见、启用不了，分享时跟着频道打进 `.channekcard`。

飞轮日记的套件就是这么挪进来的：素材区、运营区和灯轨的富真相进度分析器，只对这一个频道有意义，
放全局库会把「设计区」和「运行数据区」搞成一锅。挪成频道插件后，它从 `requires.plugins`
（原先标着 `optional`）里消失，换成 `plugins` 里的一行相对路径。

频道文件夹可能是别人给的，所以频道插件守几条规矩——**打开文件夹 ≠ 同意执行代码**：

- **只认声明、不扫描**。路径相对、不含 `..`，按真实路径解析后必须仍在频道根内（软链指到外面直接拒）。
- **默认不加载**。第一次打开带频道插件的频道弹信任卡，逐个列插件、信任级、权限，三选
  「信任并加载 / 本次不加载 / 永不」。
- **信任绑在「频道真实路径 + 代码指纹」上，不绑卡里自报的 id**——拷一份频道就能冒充 id，路径和指纹冒充不了。
- **代码变了重新问**。作者可以对自己的频道开「开发模式」：只对这一个路径生效，代码变了自动重载、
  顶栏提示，不再弹窗。从别处来的频道默认关。
- **id 和任何已加载插件撞了就拒载**，并说清撞了谁——不许频道插件顶替一个你信任过的全局插件。

**第二个频道也要用它时，才把它提升成全局插件**，两边改按 id 引用——「第二次用到才抽出来」。
构建产物 `dist/` 要跟着频道入库（别人拿到就能直接加载，不必先装开发依赖），`node_modules/` 不入。

### 降级声明分三层，没有一层在 pipeline 里

| 层 | 载体 | 写法 |
|---|---|---|
| 能力缺失 | `requires.providers[].reason` | 「**缺它则**只能用频道固定底床」 |
| 插件缺失 | `requires.plugins[].reason`（可标 `optional`） | 「**缺它**开频道就落在灰占位上」 |
| 资产缺失 | `brand.mascot.clipMap` | `{"nod": "smile"}` = 没有点头就用微笑顶 |

**但「声明降级」不等于「允许自作主张降级」**——skill 层的规矩是：
能力没有提供者时**停在那一步、如实记账，不拿别的手段顶替**。

### 本机的事不进卡

```json
"runtime": { "providers": [] }
```

留空数组当占位。配套三处措辞：

- `channek.publish.accounts` 的 hint：「本机 Chrome 接线（profileDir/debugPort）归频道侧车 `.channek/local/publish.json`」
- `channek.render-master` 的 reason：「Remotion runtime 由你自行安装（**BYO**），不随卡也不随 app 分发」
- CHANGELOG 1.0.0：「配音 / 出图走本机 **BYO 端点，凭据不随卡**」

## `agent`：在频道根开 Claude / Codex 时的三个入口

```json
"agent": {
  "guide":   "sop/README.md",       // 工作流说明：这个频道的活怎么干
  "skills":  "sop/skills",          // skill 目录：挂到 .claude/skills/
  "scripts": "sop/kit/scripts"      // 脚本目录：agent 和人在频道根用相对路径调
}
```

三个入口都会写进 AGENTS.md 托管块——`guide` 和 `scripts` 进「先看这里」一节，`skills` 进
「这个频道自带的 skill」一节（见 [03](03-agents-md.md)）。**脚本由 agent 和人跑，内核不运行它们**；
哪个脚本需要被 app 本身调度（出现在工作台、显示进度），它就该升成插件。

## `bundle.omit`：把「拿掉」写成「教你重造」

```json
"bundle": {
  "omit": [
    { "path": "brand/头像",
      "reason": "频道头像是作者的视觉身份。放你自己的：位置由 layout.cardAssets.brandAssets.avatar 声明，app 会引导你补。" },
    { "path": "brand/emo",
      "reason": "IP 形象保留全部权利，且动作帧序列对你也没用——你的 IP 不是这只猫。换成你自己的：brand.mascot 段里的 visualPrompt / i2vSubject / i2vStyle 就是可照抄的生成配方。" },
    { "path": "brand/片头片尾/片头-标准.mp4",
      "reason": "成片带着作者的 IP 与 slogan。同目录的 scenes-片头.json 是工程文件，照它渲染成你自己的。" }
  ]
}
```

**每条 reason 都是三段式：为什么拿掉 + 你该怎么补 + 补的说明书在卡的哪个字段。**

三条各指向不同的补齐路径：指回 `brandAssets.avatar` 声明的位置 / 指回 `brand.mascot` 的生成配方 /
指回同目录的工程文件。

## 分享是拷贝：导出带什么、问卷问什么

用别人的频道 = **拷一份**：导入 `.channekcard` 时整套拷进新文件夹、生成新的顶层 `id`。
所以导出只带做法，**不需要你在 `bundle.omit` 里手列作品目录**：

| 不进包的 | 判据从哪来 |
|---|---|
| 布局声明的内容容器：`contentDir` + 没标 `recipe` 的 `sections` | 从卡里读，不写死 `work/`——目录名是你起的 |
| 点开头的本机状态：`.channek/` `.claude/` 等 | 内核固定规则 |
| `bundle.omit` 点名的 | 你写的 |
| 顶层 `id` / `slug` | 导出时剥掉——收卡人开出来的是另一个频道 |

`bundle.omit` 因此只管**做法目录里你不想给的东西**（头像、IP、带脸的成片），不用再操心作品。

### `questions`：用卡开频道时问使用者的题

```json
"questions": {
  "profile.persona": { "label": "人设" },
  "profile.slogan":  { "label": "口号", "optional": true },
  "profile.bio":     { "label": "简介", "optional": true }
}
```

**键是频道卡字段路径**，题目是 `label`，可带 `example` 和 `optional`。导出时，问卷点名的字段
**撤下作者原值、改作那道题的示例**（题里已有 `example` 就不覆盖）；收卡人用这张卡开频道时，
只问这几道题，不答就留空——**而不是悄悄顶着作者的人设开频道**。

问卷只撤卡里的值，撤不掉做法文件里写死的。所以导出还会做一次**身份泄漏检查**：
提示词、skill、README 里出现了频道名或人设原文，逐个列出「哪个文件里出现了哪个词」。
**只提示、不拦**——README 里讲来历时提一句「飞轮日记」未必是错，改不改由作者判断。

## 授权分层：「方法拿走，脸留下」

同一套三分法在**四处一字不改地复述**：`meta.license` · `STOREFRONT.md` 的授权节 ·
`sop/README.md` 的边界节 · 每条 `bundle.omit[].reason`。

```
结构（流程 / 目录 / 提示词 / design token）  → CC-BY-4.0，随便改
随包品牌资产                                 → 仅供参考，不得直接用
IP 形象                                      → 保留全部权利
```

**`bundle.omit` 是这条授权的机械执行器**——把「不得直接用」变成「打包时物理不给你」；
**`questions` 是人设那一半的执行器**——把「你的人设不是我的」变成「导出时值被撤下」。

## 三份 md 的分工

| | `sop/README.md` | `sop/STOREFRONT.md` | `sop/CHANGELOG.md` |
|---|---|---|---|
| **读者** | 维护者 + 干活的 AI | 潜在收卡人（**还没装**） | 已装旧版的收卡人 |
| **视角** | 「这堆文件谁是谁」 | 「我要不要拿这张卡」 | 「我该不该更新」 |
| **粒度** | 字段路径级 | 能力 / 价值级（**不出现字段名**） | 版本级（对齐 `card.version`） |
| **与卡的关系** | 索引它 | 翻译它 | 追踪它的 `card.version` |
| **各自的「不」** | 「没有第四套」+ 边界三条 | 「不适合纯泛粉向的短平快内容」 | 「凭据不随卡」 |

**三份都留了一句「什么不属于我」。这是这套文档范式最值得抄的一点。**

`sop/README.md` 同时是 `agent.guide` 指向的工作流说明，也是 `docs.readme` 挂载的文件夹地图。
「文件夹地图」那张表，列设计是精髓——**第三列直接填 channel.json 的字段路径**：

```
| 文件夹 / 文件  | 装什么                         | 谁指引用它                                  | 机制 |
| `AGENTS.md` 下半「宪章」 | 频道最高法律…    | 托管块「先看这里」指过去                     | ①→③ |
| `sop/skills/`  | 随卡分发的流程说明书            | `layout.cardAssets.libraries.skills`        | ①→③ |
| `brand/audio/` | 进场 / 转场 / 交互 / 背景乐     | `libraries.sound` · `libraries.soundIntro`  | ①  |
```

即 **README 是「channel.json 字段」与「磁盘目录」之间的双向索引**。

`CHANGELOG.md` 第二行那句钉死了视角：

> 收卡人更新时看到的就是这份——每个版本写清「这一版改了什么、为什么」。

不是给作者自己看的开发日志。

## 自检

- [ ] `config` 的体量明显大于 `pipeline`（如果反过来，说明判据还留在你脑子里）
- [ ] 54 个 key 全部以所在组的 `id` 打头
- [ ] `quality` 组里每个阈值都有一个容差项配对
- [ ] 每条 hint 回答的是「这条尺子防的是哪种偷懒」，不是「这个数是什么」
- [ ] 每条 `requires.providers[].reason` 都写了「缺它则 / 换 X 也能跑，代价是 Y」
- [ ] 每条 `bundle.omit[].reason` 都写了「你该怎么补 + 说明书在哪个字段」
- [ ] 菜谱类的区标了 `recipe: true`；作品类的区没标、也没被手动塞进 `bundle.omit`
- [ ] `questions` 覆盖了 `profile` 里所有「换个人就该换」的字段
- [ ] 写给别人用的卡有 `card.id`；不必手删顶层 `id` / `slug`（导出时会剥）
- [ ] `plugins` 里每条路径都在频道根内、不含 `..`
- [ ] `runtime.endpoints` 里没有任何 URL / 端口 / 本机路径
- [ ] 抽查五条 `fileRef` / `docRef` / `preview` 路径，`ls` 一下都真的存在
