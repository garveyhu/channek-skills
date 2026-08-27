# 01 · 骨架：两区布局与条目结构

> 用户点名要的「目录组织形式」。这一章给的是**可以直接照着 mkdir 的骨架**，以及每一层为什么在那儿。

## 频道根：两个业务目录，一条切分线

```
<频道根>/
├── AGENTS.md          频道说明书（托管块由卡渲染 + 手写补充块）→ 见 03
├── CLAUDE.md          四行转发器，只写 @AGENTS.md，不复制内容
├── .gitignore         能重渲的不入库 → 见 templates/gitignore.txt
├── .channek/          app 的运行时侧车（下节详解）
├── .claude/skills/    软链挂载点（生成物，不入库）
│
├── 风格卡/            ← 可分发的卡：**方法与家底**（怎么做这类内容）
└── 内容/              ← 私有创作物：**做了什么**（不随卡走）
```

**这条切分线是整个范式最硬的一条**，写在 AGENTS.md 的手写块里：

> 路径速记：**可分发卡**在 `风格卡/`；**私有创作**在 `内容/`（情报 / 选题 / 工作台 / 复盘 / 质检记忆）。
> 机器值统一从 `风格卡/card.json` 取。

判据：**换一个人装上这张卡，他会有的 → 进卡；只有你有的 → 进内容。**

配套一条禁令（写在内容工作台的 README 里）：

> **这里不留第二份清单。** 两份清单必然漂移，而读到旧的那份的人会照着已经不成立的描述干活。
> 要补充或纠正家底，改卡里那份。

> 卡目录名 `风格卡` 本身也是声明的（`.channek/workspace.json` 的 `"card"` 字段），可以叫别的。

## `.channek/`：哪些入库，哪些不入库

```
.channek/
├── workspace.json         ← 入库。频道身份：{ card, name, id, slug }
├── plugins.json           ← 入库。启用了哪些插件（id + version + enabled）
├── settings.json          ← 入库。文件扫描排除规则
├── plugin-settings.json   ← ⚠️ 看情况。按插件 id 分桶的设置
└── local/                 ← ❌ 不入库。全是这台机器的事实
    ├── capabilities.json      本机解析出的能力快照
    ├── publish.json           发布用 Chrome 的 profileDir / debugPort
    ├── skill-mounts.json      skill 软链账本
    ├── skills-consent.json    卡带 skill 的用户授权记录（含卡指纹）
    └── plugin-storage/        插件自己的数据
```

`plugin-settings.json` 是**机器值的家**——本机绝对路径就住在这里，不进卡：

```json
{
  "links.voice-lab": { "promptWav": "/Users/<你>/…/default-v2.wav", "ttsTimesteps": 30 },
  "links.remotion":  { "styleCardRoot": "/Users/<你>/…/风格卡" },
  "links.ffmpeg":    { "bedFloorDb": -28 }
}
```

**「卡里为什么不能写路径」的答案就在这个文件**：这些值每台机器都不一样，卡是要出门的。

> `skills-consent.json` 记着卡的 `fingerprint` + 已授权的 skill 名单——**卡带的 skill 要用户点头才挂载**。
> 卡内容改了指纹就变，会重新征求同意。写卡时知道有这道门就行。

## `风格卡/`：卡的十四件东西

```
风格卡/
├── card.json              机器真相源（飞轮日记 891 行）
├── README.md              文件夹地图 + 三套指引机制  ← docs.readme
├── STOREFRONT.md          商店页（给还没装的人看）
├── CHANGELOG.md           变更日志（给已装旧版的人看）
├── 创作宪章.md            最高法律（32 行）           ← docs.charter
│
├── prompts/               作业指令 × 5              ← prompts 段
│   开工.md 选题.md 脚本.md 分镜.md 审稿.md
│
├── skills/                方法论 × 16               ← libraries.skills → 见 04
│   _shared/ produce-flow/ <每一步>-craft/
│
├── scripts/               卡级脚手架（飞轮日记只有 1 个 new-entry.sh）→ 见 05
│
├── 风格锁/                判据层
│   画风锁.md              静态脸                    ← locks.visualStyle.docRef
│   动效音线锁.md          动态脸                    ← locks.motionSound.docRef
│
├── 品牌套件/              脸与法的事实源            ← brandAssets.root → 见 07
│   tokens.dtcg.json       ← brand.tokensRef
│   品牌文档/ 封面/ 平台矩阵/ 字幕样式/ 音色/ 头像/ 背景/ 片头片尾/ <IP名>/
│
├── scenes/                频道级可复用画面组件      ← libraries.scenes
├── 复用片段/              文字物料 + 骨架           ← libraries.reusable
├── 素材库/                通用素材                  ← libraries.asset
├── BGM音效/               声音库                    ← libraries.sound
│   进场/ ← soundIntro    背景乐/ ← soundBgm    转场/ 交互/
└── assets/                卡自己的门面图            ← meta.cover
```

**每一行右边那个箭头很重要**：目录名是你起的，但**卡里必须有一条声明指向它**，否则
它对 app 和收卡人的 AI 都不存在。命名规矩来自品牌套件的 README：

> 人读的文档用中文（`品牌文档/`），skill 按路径读的 token 保留英文（`tokens.dtcg.json`）。

## `内容/`：四库 + 一个横切库

```
内容/
├── 1-情报库/       ← sections[id=intel]   上游弹药
├── 2-选题库/       ← sections[id=topics]  决策层（index: 选题库.md）
├── 3-内容工作台/   ← contentDir           主战场，一条内容一个子目录
├── 4-运营复盘/     ← sections[id=review]  数据闭环
└── 质检记忆/       ← sections[id=qc]      横切（所以不编号）
```

**编号即流水线顺序**，`质检记忆` 不编号因为它横切所有环节。

**`intel` / `topics` / `review` / `qc` 是内核认识的四个约定 id**，写对了 AGENTS.md 才会渲成中文说明。
目录名（`path`）随你起——同作者另外三个频道就把同一组 id 换成了各自的行话：

| 语义 id | 视频·飞轮日记 | 视频·比奇堡 | 播客·夜话 | 图文·工具笔记 |
|---|---|---|---|---|
| `intel` | `内容/1-情报库` | `内容/4-参考拆解` | **`听友来信`** | **`摘抄`** |
| `topics` | `内容/2-选题库` | `内容/1-选题库` | `选题池` | `选题箱` |
| *(contentDir)* | `内容/3-内容工作台` | `内容/2-内容工作台` | `节目` | `文章` |
| `review` | `内容/4-运营复盘` | *(无)* | `数据复盘` | `发布记录` |
| `qc` | `内容/质检记忆` | `内容/3-质检记忆` | *(无)* | *(无)* |

**这不是命名习惯的巧合，是内核级的心智骨架。** 播客把 `intel` 用成「听友来信」
（它的情报来源是听众投稿），第二个视频频道把 `intel` 用成「参考拆解」（拆对标片的动效规格）
——**同一个槽位，因媒介和阶段而异的用途**。

轻量频道去掉 `内容/` 那一层和数字前缀（容器少，不需要排序）。

## 一条内容的骨架：8 个目录 + 2 个文件

飞轮日记 **27 条内容，27/27 完全一致**：

```
<YYMMDD>-<slug>/
├── 选题卡.md          ← channek.entry      唯一元数据真相源
├── 脚本.md            ← channek.script     口播稿（含钩子卡 + 概念清单）
├── 工程/              ← storyboard + project + componentRegistry
│   ├── scenes.json                         分镜
│   ├── <slug>.channek                      工程文件（铁律：不许手改）
│   ├── README.md                           导演剪辑表（音画对拍唯一依据）
│   └── components/                         本条独有的 bespoke 组件
│       └── components.registry.json
├── 素材/              ← assets 族（三分区）
│   ├── 真材料/<来源>/  + _meta/             真拍真截（证据）
│   ├── 生图/           + _meta/             AI 生成
│   ├── 精灵/           + _meta/             透明底可拼装件
│   └── 概念动画/
├── 配音/              ← voiceTrack + voiceoverPlan + soundUsage + sfx
│   ├── voiceover-track.wav                 旁白轨
│   ├── voiceover.json                      旁白清单（字幕的文本真相源）
│   ├── used-sounds.json                    用音台账（闸读它）
│   ├── acts/01.wav … NN.wav                逐幕
│   └── 音乐音效/                           本片专属 SFX
├── 字幕/cues.json     ← channek.captionCues
├── 剪辑/              ← channek.polishedCut  中间产物（可清，不是交付物）
├── 母版/master.mp4    ← channek.master       唯一交付物
├── 封面/              ← covers + coverSpec + coverPrompt
│   ├── cover.json  封面提示词.md  封面-*.png
└── 分发/              ← channek.delivery
    ├── 发布/bilibili.md youtube.md douyin.md xiaohongshu.md
    └── 切片/          ← channek.slices
+ 出片问题记录.md       质检记忆的捕获层（21/27 条有）
```

### 三条骨架纪律

**① 空目录也要留。** 条目 README 原话：「**是真脚手架，别删任何目录**」。
一条内容不做切片、不用概念动画，那两个目录照样在——它们是**这一步「没做」而不是「不存在」**的信号。

**② 条目名的 `{date}` 是开题日，不是发布日。** 同一天可以开好几条。
slug 用英文 kebab-case、语义即题眼。

> 这个日期不只是排序用的：质量闸的 `quality.gateSinceDate` **就是拿目录名前六位判新旧片的**。
> 目录名格式一变，日期门当场失灵。

**③ 落点全部由卡的 `layout.artifacts` 声明，不是常量。** AGENTS.md 铁律：

> 这些路径由卡声明，换一张卡就会变 —— **别把它们当常量记进脚本**。
> 找不到某类产物时**先问卡，不要猜**。

## 频道级 vs 本条独有：物理隔离

这条决定了库会不会越长越肿：

| 东西 | 落哪 | 判据 |
|---|---|---|
| 跨内容复用的画面组件 | `风格卡/scenes/` | **验证过 ≥3 片会复用**才上提 |
| 本条独有的 bespoke 组件 | `<条目>/工程/components/` | 只在这条片里成立 |
| 跨片复用的素材 | `风格卡/素材库/` | 换一条片还用得上 |
| 本条的截图 / 生图 / 精灵 | `<条目>/素材/` | 只在这条片里成立 |
| 频道固定音库 | `风格卡/BGM音效/` | 每片都可能用 |
| 本片专属音效 | `<条目>/配音/音乐音效/` | 为这一拍现造的 |

AGENTS.md 手写块：

> **不往公共引擎塞一次性组件**——频道级、跨内容复用的才进 `风格卡/scenes/`，本条独有的留 `工程/`。

配一条**反直觉的反复用纪律**（防同质化）：

> **概念组件每条全新**：旧片组件**只看不抄**（学质量标准 / 频道风格 / 动效工艺），
> 概念图解 bespoke 一律新建到本条 `工程/components/`，绝不 copy 旧片实现。
> **地基层（token / IP / 音效 / 缓动 / 共享原子件 / 片尾）放心复用。**

数据印证：相邻两条内容各 16 / 22 个组件，两套 id **零重叠**。

上提有闸，下架也有闸：「频道级场景长期没人用 / 被取代 → 从 `scenes/` 摘除，防库越长越肿。」

## 素材三分区的判据

```
素材/真材料/<来源>/    真拍 / 真截 / 录屏      ← 是证据
素材/生图/             AI 整图
素材/精灵/             透明底可拼装件
```

铁律：**`真材料/` 是证据，缺位诚实降级、绝不 AI 生成顶替。**

每区自带 `_meta/` sidecar 记来源与用途。两种形态都可以：

- **逐文件 JSON**（`_meta/<同名>.json`）：`kind` / `prompt` / `backend` / `source` / `created`，
  生成件多一个 `washed: true`（已抠透明），音效多 `license` / `usage` / `used_count`。
- **一份人写的 `_meta/来源.md`**（较新的做法）：比 JSON 多装得下「怎么截的 + 脱敏处置 + 没拿到什么」。

第二种形态里有一条值得抄的纪律——**脱敏必须在落库那一刻处置**：

> 原始全景图的左侧树里露出了未发布选题的 slug，所以那张图**只裁到某一层为止**。
> **这一条必须在分镜里写死，不能留给渲染时临场判断。**

## 建骨架的顺序

```
1. 建两区：风格卡/ + 内容/（四库 + 工作台）
2. 写 card.json 的 layout 段：contentDir / entryDirName / sections / artifacts / cardAssets
3. 按 layout 的声明 mkdir 出卡内各库（声明和磁盘要对得上）
4. 在 app 里打开一次 → AGENTS.md + CLAUDE.md 自动生成
5. 写 .gitignore（照 templates/gitignore.txt 改目录名）
6. 开第一条内容，把 8 个目录 + 2 个文件的骨架建全（空目录也建）
```

**第 3 步和第 2 步的顺序不能反**：先声明后建目录，才不会出现「盘上有的卡里没有」
或者「卡里写的盘上没有」。

## 自检

- [ ] 卡里声明的每一条路径，`ls` 一遍都真的存在
- [ ] 盘上每一个卡内目录，都能在 `layout.cardAssets` 里找到指向它的那一行
- [ ] `内容/` 里没有任何一份东西是「卡里那份的第二个副本」
- [ ] `.channek/local/` 与 `.claude/` 已被 `.gitignore` 挡住
- [ ] 卡里没有任何一条本机绝对路径（机器值全在 `plugin-settings.json`）
- [ ] 条目骨架 8 个目录一个不少，空的也在
- [ ] 条目名前六位是能被 `gateSinceDate` 解析的 YYMMDD
