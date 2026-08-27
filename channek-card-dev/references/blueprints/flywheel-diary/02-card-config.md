# 02 · card.json 实战：891 行卡是怎么排布的

> 字段的**语法**查 [`../../card-schema.md`](../../card-schema.md)。这一章讲**排布**——
> 一张成熟的卡各段占多大比重、命名怎么定、值放哪一层。

## 全卡比例尺（先看这个）

飞轮日记的 `card.json` 共 **891 行**，`cardVersion: "1.0.0"`。各段规模：

| 段 | 行数 | 占比 | 一句话 |
|---|---|---|---|
| 身份证八件套 | 8 | 1% | schema / formatVersion / id / name / slug / createdAt / face / cardVersion |
| `identity` | 15 | 2% | 定位 / 人设 / 策略 |
| `brand` | 58 | 7% | design token + IP 吉祥物 + 代码配色 |
| `cover` · `platforms` | 23 | 3% | 封面套件指针 + 四平台开关 |
| `pipeline` | 41 | 5% | 九步（**只是 key→step 映射**） |
| `layout` | 103 | 12% | 目录 + 22 条工件落点 + 8 个资源库 + 9 条文档 |
| `prompts` | 7 | 1% | 五份提示词登记 |
| **`config`** | **460** | **52%** | **8 组 54 项创作参数** |
| `presentation` | 14 | 2% | 三个功能区 |
| `meta` | 10 | 1% | 上架物料 |
| `requires` | 110 | 12% | 9 条能力 + 5 个插件 |
| `runtime` | 3 | — | **刻意留空** |
| `bundle` | 24 | 3% | 5 条剔除声明 |
| `pluginSettings` | 13 | 2% | 按插件 id 旁挂 |

**两个数字要记住**：`config` 占一半，`pipeline` 只占 5%。

新手直觉是反的——以为写卡主要是设计流程。**流程只是九行映射；真正的工作量在「把这个频道的
每一条判据变成一个可读可改的配置项」。**

## 身份证：两个版本号，一个人话标签

```json
{
  "schema": "channek.stylecard",
  "formatVersion": 2,          // 生态级 schema 版本，全生态统一
  "id": "<作者>.<频道>",        // 反域名式，小写点分
  "name": "飞轮日记",
  "slug": "feilun-diary",      // ASCII 短名，路径模板 {slug} 的取值来源
  "createdAt": "2026-07-24T05:35:04.964Z",
  "face": "v2-鲜艳潮IP",        // ← 人话字符串，不是枚举
  "cardVersion": "1.0.0"       // 这张卡自己的版本，配 CHANGELOG
}
```

- **`formatVersion` 与 `cardVersion` 分开两个字段**——前者是生态契约，后者是你的发版号。
- **`face` 是一句话标签，带版本前缀**。同作者其它卡分别是 `"v1-卡通经济学"` /
  `"纸白编辑感·墨绿点睛"` / `"暖灯深夜·纸感人声"`。它回答「这张卡长什么脸」，一眼可辨。
- 连**卡目录名都是声明的**：`.channek/workspace.json` 里 `"card": "风格卡"`。
  `风格卡` 这个名字本身可换。

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

**这张成熟卡的每一步只用了两个字段**（schema 还允许 `config` 与 `optional`，它没用上）：

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
| `layout.cardAssets.*` · `prompts.*` · `config` 里的 `fileRef` | **卡根**（`风格卡/`） |
| `layout.contentDir` · `layout.sections[].path` · `layout.detect.anyOf` | **频道根** |
| `layout.artifacts.*` | **条目目录**（`<contentDir>/<entryDirName>/`） |
| `brandAssets.banners[]` / `avatar[]` | **`brandAssets.root`** |

四套。写卡时逐条对照，别凭感觉。

### `cardAssets.libraries`：英文语义名 → 中文实际目录名

```json
"libraries": {
  "sound":      "BGM音效",
  "asset":      "素材库",
  "scenes":     "scenes",
  "reusable":   "复用片段",
  "ipActions":  "动作库",      // ← 子目录名（在 brandAssets.root/<IP名>/ 之下）
  "soundIntro": "进场",        // ← 子目录名（相对 sound）
  "soundBgm":   "背景乐",      // ← 子目录名（相对 sound）
  "skills":     "skills"
},
"pipelineFixedSounds": [ "whoosh.wav", "pop.wav", "进场.wav" ]
```

**键是英文语义名，值是中文实际目录名。** 脚本一律拿 `libraries.sound` 说话，永不写「BGM音效」。
这样目录名想改就改，代码不动。

⚠️ 那三个**子目录名**（`ipActions` / `soundIntro` / `soundBgm`）不是卡根路径，别照抄成一级目录。

### `cardAssets.docs`：键名是「旧段位的点号路径」

```json
"docs": {
  "brand.tokensRef":           "品牌套件/tokens.dtcg.json",
  "locks.visualStyle.docRef":  "风格锁/画风锁.md",
  "locks.motionSound.docRef":  "风格锁/动效音线锁.md",
  "captions.docRef":           "品牌套件/字幕样式/README.md",
  "docs.charter":              "创作宪章.md",
  "docs.ipBrief":              "品牌套件/品牌文档/IP定位书.md",
  "docs.brandSpec":            "品牌套件/品牌文档/品牌规范.md",
  "docs.engineBlocks":         "复用片段/引擎积木速查.md",
  "docs.readme":               "README.md"
}
```

**这是全卡最精巧的一处，值得单独理解。**

键名不是随手起的，是**卡内段位的点号路径**——`locks.visualStyle.docRef` 挂在一个
**已经不存在的 `locks` 段**下。为什么？因为机器值搬进了 `config` 段，但人读判据留在 md 里：

```
config.sound（15 个机器值）  ←hint 指向→  docs["locks.motionSound.docRef"] → 风格锁/动效音线锁.md
```

`config.sound` 那一组的 hint 直写：「动效音线锁的机器值（**原 locks.motionSound**·人读判据在锁文档）」。

**段位迁移了，引用名不变，老代码不断。** 这是可迁移性的一个范例做法。

> 前 8 个键是[内核认识的固定挂载点](03-agents-md.md#layoutcardassetsdocs-的八个挂载点)，
> 会渲进 AGENTS.md 的「频道的脸与法」节。第 9 个 `docs.engineBlocks` 是自造键——照样能挂，
> 只是渲染时直接显示键名。

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
"detect": { "anyOf": [ "内容/3-内容工作台" ] }
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

`detect.anyOf` 是**频道识别探针**：目录里出现这几条路径之一，就认定是本卡的频道。

### `sections`：四个功能区，id 用内核约定名

```json
"contentDir": "内容/3-内容工作台",
"entryDirName": "{date}-{slug}",
"sections": [
  { "id": "intel",  "path": "内容/1-情报库" },
  { "id": "topics", "path": "内容/2-选题库", "index": "选题库.md" },
  { "id": "review", "path": "内容/4-运营复盘" },
  { "id": "qc",     "path": "内容/质检记忆" }
]
```

**`id` 用内核认识的四个约定名**（`intel` / `topics` / `review` / `qc`），
**`path` 用你自己的带序号中文目录名**。序号前缀让人在文件管理器里看到的就是工作顺序。

> 约定 id 写对了，AGENTS.md 的目录结构节才会渲成「情报库（选题原料）」这样的中文说明；
> 写别的 id 会原样显示英文。

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
| `<作者>.*` | **第三方插件与 provider** | `links.homes` / `links.voxcpm-local` / `links.remotion` |

### 字段形态实测分布

| type | 出现次数 | 备注 |
|---|---|---|
| `number` | 28 | 承载全部阈值 |
| `text` | 12 | 4 处带 `multiline: true` |
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
{ "key": "quality.deadFrameSec", "value": 2.0,
  "hint": "像素域测量，只作佐证不单独定罪：判官是源码域的关键帧空窗（maxStillGapSec），两域都命中才算数。像素域单独绿不构成通过——它此前被一层刻意的背景噪声长期顶着" },
{ "key": "quality.maxStillGapSec", "value": 2.0,
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
{ "key": "channek.publish.matrix", "type": "fileRef", "value": "品牌套件/平台矩阵/platforms.json",
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
    "assetRef": "品牌套件/emo/定妆图/<定妆图>.png"
  },
  "codeTheme": { "comment": "…", "parameter": "…", "string": "…", "function": "…" }
}
```

1. **`accent` 是指针不是值**（`"mint"` 指向 `colors.mint`）——换强调色只改一个词。
2. **`clipMap` 是资产级的缺件降级表**：`{"nod": "smile"}` = 「要点头？没有，拿微笑那组顶」。
3. **`visualPrompt` / `i2vSubject` / `i2vStyle` 是可照抄的生成配方**——
   打包时 IP 实体资产被 `bundle.omit` 剔掉了，但**配方留着**，收卡人照它造自己的 IP。

`brandAssets.banners` 的数组是**优先级链**：

```json
"banners": {
  "douyin": [ "背景/背景-抖音-1125x633.png", "背景/背景-母版-2560x1440.png" ]
}
```

抖音先用专供尺寸，没有就回落母版。

## `requires`：只有三个子段

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
    { "id": "links.production",
      "reason": "九步出片流程与这九步产出的工件种类定义都由它提供。缺它则内容详情页的步骤与灯轨无法定位工件。" },
    { "id": "links.feilun-suite", "optional": true,
      "reason": "素材 / 运营两个功能区与灯轨富真相进度分析器都由它提供。不装也能用：两区显示占位卡、灯轨降级回通用 presence。" }
  ]
}
```

**`reason` 的句式是统一的**，值得当模板背：

> 先说这一步在干什么（带步号「05 配音步」），再说 **「换 X 也能跑，代价是 Y」** 或
> **「缺它则 Z」**。

**`prefer: []` 与 `prefer: [某家]` 语义不同**：空数组 = 不挑家；非空 = 按这家调优过，换家有差异。

`capability` 与 `plugins` 是**多对多**：一个 ffmpeg 插件提供四条能力，一个 sound-gen 插件提供两条。

### 降级声明分三层，没有一层在 pipeline 里

| 层 | 载体 | 写法 |
|---|---|---|
| 能力缺失 | `requires.providers[].reason` | 「**缺它则**只能用频道固定底床」 |
| 插件缺失 | `requires.plugins[].optional` + `reason` | 「**不装也能用**：两区显示占位卡、灯轨降级回通用 presence」 |
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

## `bundle.omit`：把「拿掉」写成「教你重造」

```json
"bundle": {
  "omit": [
    { "path": "品牌套件/头像",
      "reason": "频道头像是作者的视觉身份。放你自己的：位置由 layout.cardAssets.brandAssets.avatar 声明，app 会引导你补。" },
    { "path": "品牌套件/emo",
      "reason": "IP 形象保留全部权利，且动作帧序列对你也没用——你的 IP 不是这只猫。换成你自己的：brand.mascot 段里的 visualPrompt / i2vSubject / i2vStyle 就是可照抄的生成配方。" },
    { "path": "品牌套件/片头片尾/片头-标准.mp4",
      "reason": "成片带着作者的 IP 与 slogan。同目录的 scenes-片头.json 是工程文件，照它渲染成你自己的。" }
  ]
}
```

**每条 reason 都是三段式：为什么拿掉 + 你该怎么补 + 补的说明书在卡的哪个字段。**

三条各指向不同的补齐路径：指回 `brandAssets.avatar` 声明的位置 / 指回 `brand.mascot` 的生成配方 /
指回同目录的工程文件。

## 授权分层：「方法拿走，脸留下」

同一套三分法在**四处一字不改地复述**：`meta.license` · `STOREFRONT.md` 的授权节 ·
`README.md` 的边界节 · 每条 `bundle.omit[].reason`。

```
结构（流程 / 目录 / 提示词 / design token）  → CC-BY-4.0，随便改
随包品牌资产                                 → 仅供参考，不得直接用
IP 形象                                      → 保留全部权利
```

**`bundle.omit` 是这条授权的机械执行器**——把「不得直接用」变成「打包时物理不给你」。

## 三份 md 的分工

| | `README.md` | `STOREFRONT.md` | `CHANGELOG.md` |
|---|---|---|---|
| **读者** | 维护者 + 干活的 AI | 潜在收卡人（**还没装**） | 已装旧版的收卡人 |
| **视角** | 「这堆文件谁是谁」 | 「我要不要拿这张卡」 | 「我该不该更新」 |
| **粒度** | 字段路径级 | 能力 / 价值级（**不出现字段名**） | 版本级（对齐 `cardVersion`） |
| **与卡的关系** | 索引它 | 翻译它 | 追踪它的 `cardVersion` |
| **各自的「不」** | 「没有第四套」+ 边界三条 | 「不适合纯泛粉向的短平快内容」 | 「凭据不随卡」 |

**三份都留了一句「什么不属于我」。这是这套文档范式最值得抄的一点。**

`README.md` 的「文件夹地图」那张表，列设计是精髓——**第三列直接填 card.json 的字段路径**：

```
| 文件夹 / 文件      | 装什么              | 谁指引用它                                  | 机制 |
| `创作宪章.md`      | 频道最高法律…       | `layout.cardAssets.docs['docs.charter']`    | ①→③ |
| `skills/`          | 随卡分发的流程说明书 | `layout.cardAssets.libraries.skills`        | ①→③ |
| `BGM音效/`         | 进场 / 转场 / 背景乐 | `libraries.sound` · `libraries.soundIntro`  | ①  |
```

即 **README 是「card.json 字段」与「磁盘目录」之间的双向索引**。

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
- [ ] `runtime.endpoints` 里没有任何 URL / 端口 / 本机路径
- [ ] 抽查五条 `fileRef` / `docRef` / `preview` 路径，`ls` 一下都真的存在
