# 01 · 骨架：菜谱 / 菜的切分与条目结构

> 用户点名要的「目录组织形式」。这一章给的是**可以直接照着 mkdir 的骨架**，以及每一层为什么在那儿。

## 频道根：一份频道卡，一条切分线

```
<频道根>/
├── channel.json       频道卡：内核唯一认的固定文件名 → 见 02
├── channel.md         创作宪章（最高法律）            ← docs.charter → 见 07
├── AGENTS.md          频道说明书（托管块由卡渲染 + 手写补充块）→ 见 03
├── CLAUDE.md          转发器，只写 @AGENTS.md，不复制内容
├── .gitignore         能重渲的不入库 → 见 templates/gitignore.txt
├── .channek/          这台机器上对这个频道的状态（下节详解）
├── .claude/skills/    软链挂载点（生成物，不入库）
│
├── sop/               ← **怎么做**（菜谱）：随卡分享
├── brand/             ← 品牌资产：视频频道才需要，按 bundle.omit 挑着分享
├── plugins/           ← 频道插件：只在这个频道加载，跟着频道走
└── work/              ← **做出来的东西**（菜）：不进卡包
```

**认频道只看一件事：根目录有没有 `channel.json`。** 除了它，`sop/` `brand/` `work/` 这些名字
都不是内核规定的——是飞轮日记自己的选择，由频道卡声明。一个写小说的频道可以只有
`channel.json` + `sop/` + `work/`，没有 `brand/`、没有 `plugins/`，同样合法。

我们自己的频道统一按「菜谱 / 菜」来摆，和 Bench 的 SOP 空间是同一套词：**sop 是菜谱，work 是做出来的菜。**

**这条切分线是整个范式最硬的一条**，写在 AGENTS.md 的手写块里：

> 路径速记：**频道卡**是根目录 `channel.json`，**做法**在 `sop/`、**品牌**在 `brand/`（哪个文件夹谁用见 `sop/README.md` 地图）；
> **私有创作**在 `work/`（intel 情报 / inbox 选题 / runs 每期 / review 复盘；踩坑账在 `sop/lessons/`）。机器值统一从 `channel.json` 取。

判据：**换一个人拿走这个频道，他该拿到的 → 进做法；只有你有的 → 进 `work/`。**

这条线不只是整理习惯，**分享时它就是那把刀**：导出 `.channekcard` 是拷贝语义，只带做法——
布局声明的内容容器（`contentDir` 和没标 `recipe` 的 sections）不进包，点开头的本机状态不进包，
`bundle.omit` 点名的也不进包。切错了的后果很具体：作品放进 `sop/`，会被当成做法打包送人；
做法放进 `work/`，收卡人拿到的就是一套缺件的流程。

配套一条禁令（写在每期内容所在目录的 README 里）：

> **这里不留第二份清单。** 两份清单必然漂移，而读到旧的那份的人会照着已经不成立的描述干活。
> 要补充或纠正家底，改卡里那份。

## `.channek/`：本机状态，整个不入库

```
.channek/
├── plugins.json           这台机器上启用了哪些插件（id + version + enabled）
├── settings.json          文件扫描排除规则
├── plugin-settings.json   按插件 id 分桶的本机设置（本机绝对路径住这里）
└── local/
    ├── capabilities.json      本机解析出的能力快照
    ├── publish.json           发布用 Chrome 的 profileDir / debugPort
    ├── skill-mounts.json      skill 软链账本
    ├── skills-consent.json    卡带 skill 的用户授权记录（含卡指纹）
    └── plugin-storage/        插件自己的数据
```

**`.channek/` 的语义是「这台机器上对这个频道的状态」**：删掉它频道照样能开，只丢本机偏好；
**频道的定义一概不放在里面**。旧结构里频道身份住在 `.channek/workspace.json`，现在它搬进了
根目录的 `channel.json`——可见、入库、随频道走。

`plugin-settings.json` 是**机器值的家**——本机绝对路径就住在这里，不进卡：

```json
{
  "links.voice-lab": { "promptWav": "<本机路径>/default-v2.wav", "ttsTimesteps": 30 },
  "links.remotion":  { "styleCardRoot": "<本机路径>/<频道根>" },
  "links.ffmpeg":    { "bedFloorDb": -28 }
}
```

**「卡里为什么不能写路径」的答案就在这个文件**：这些值每台机器都不一样，卡是要出门的。
需要随频道走的插件偏好（不含本机路径的那些）写频道卡的 `pluginSettings` 段。

> `skills-consent.json` 记着卡的 `fingerprint` + 已授权的 skill 名单——**卡带的 skill 要用户点头才挂载**。
> 卡内容改了指纹就变，会重新征求同意。写卡时知道有这道门就行。
>
> 频道插件也有同一类门：第一次打开带频道插件的频道会弹信任卡，信任绑在**频道真实路径 + 代码指纹**上，
> 代码变了重新问。见 [02 · 频道插件](02-card-config.md#plugins住在频道里的插件)。

## `sop/`：怎么做

```
sop/
├── README.md              工作流 + 文件夹地图 + 三套指引机制  ← agent.guide · docs.readme
├── STOREFRONT.md          商店页（给还没装的人看）
├── CHANGELOG.md           变更日志（给已装旧版的人看）
│
├── prompts/               作业指令 × 5              ← prompts 段
│   开工.md 选题.md 脚本.md 分镜.md 审稿.md
│
├── skills/                方法论 × 16               ← agent.skills → 见 04
│   _shared/ produce-flow/ <每一步>-craft/
│
├── kit/                   做事要用的东西
│   ├── scripts/           脚手架（飞轮日记只有 1 个 new-entry.sh） ← agent.scripts → 见 05
│   ├── scenes/            频道级可复用画面组件      ← libraries.scenes
│   └── snippets/          文字物料 + 骨架           ← libraries.reusable
│
├── lessons/踩坑账.md       质检教训                  ← sections[id=qc]，recipe: true → 见 06
└── assets/                卡自己的门面图            ← meta.cover
```

宪章 `channel.md` 放在频道根而不是 `sop/` 里：它管的是「这个频道是谁、立场是什么」，
比任何一步的做法都高一层，给人和 agent 一进门就看见。

## `brand/`：脸与法的事实源

```
brand/
├── README.md
├── tokens.dtcg.json       design token 人读版        ← brand.tokensRef
├── locks/                 判据层
│   画风锁.md              静态脸                    ← locks.visualStyle.docRef
│   动效音线锁.md          动态脸                    ← locks.motionSound.docRef
├── 品牌文档/ 封面/ 平台矩阵/ 字幕样式/ 音色/ 头像/ 背景/ 片头片尾/ <IP名>/
├── audio/                 声音库                    ← libraries.sound
│   进场/ ← soundIntro    背景乐/ ← soundBgm    转场/ 交互/
└── library/               通用素材                  ← libraries.asset
```

整个 `brand/` 由 `layout.cardAssets.brandAssets.root` 指向 → 见 07。

**每一行右边那个箭头很重要**：目录名是你起的，但**卡里必须有一条声明指向它**，否则
它对 app 和收卡人的 AI 都不存在。命名规矩来自品牌目录的 README：

> 人读的文档用中文（`品牌文档/`），skill 按路径读的 token 保留英文（`tokens.dtcg.json`）。

## `work/`：四库

```
work/
├── intel/     ← sections[id=intel]   上游弹药
├── inbox/     ← sections[id=topics]  决策层（index: 选题库.md）
├── runs/      ← contentDir           主战场，一期一个子目录
└── review/    ← sections[id=review]  数据闭环

sop/lessons/   ← sections[id=qc]      横切 + 菜谱（所以不在 work/ 里）
```

**质检记忆为什么不在 `work/` 里**：它横切所有环节，而且它是「下次怎么别再犯」——是做法，不是作品。
所以它住进 `sop/`，在卡里标 `recipe: true`，分享频道时随卡走；另外三个区标的是做出来的东西，不进卡包。

**`intel` / `topics` / `review` / `qc` 是内核认识的四个约定 id**，写对了 AGENTS.md 才会渲成中文说明。
目录名（`path`）随你起——同作者另外三个频道就把同一组 id 换成了各自的行话
（它们还没迁到频道卡结构，下表只列目录名）：

| 语义 id | 视频·飞轮日记 | 视频·比奇堡 | 播客·夜话 | 图文·工具笔记 |
|---|---|---|---|---|
| `intel` | `work/intel` | `4-参考拆解` | **`听友来信`** | **`摘抄`** |
| `topics` | `work/inbox` | `1-选题库` | `选题池` | `选题箱` |
| *(contentDir)* | `work/runs` | `2-内容工作台` | `节目` | `文章` |
| `review` | `work/review` | *(无)* | `数据复盘` | `发布记录` |
| `qc` | `sop/lessons` | `3-质检记忆` | *(无)* | *(无)* |

**这不是命名习惯的巧合，是内核级的心智骨架。** 播客把 `intel` 用成「听友来信」
（它的情报来源是听众投稿），第二个视频频道把 `intel` 用成「参考拆解」（拆对标片的动效规格）
——**同一个槽位，因媒介和阶段而异的用途**。

命名上有两种做法，id 不变就都行：飞轮日记迁到频道卡后用 `work/` 下的英文短名（inbox / intel /
runs / review）；老结构用带序号的中文名（`1-情报库` `2-选题库`…），序号让人在文件管理器里看到的
就是工作顺序。轻量频道容器少，连序号和外层目录都不需要。

## 一条内容的骨架：8 个目录 + 2 个文件

飞轮日记 **29 条内容，29/29 完全一致**：

```
work/runs/<YYMMDD>-<slug>/
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
+ 出片问题记录.md       质检记忆的捕获层（21/29 条有）
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
| 跨内容复用的画面组件 | `sop/kit/scenes/` | **验证过 ≥3 片会复用**才上提 |
| 本条独有的 bespoke 组件 | `<条目>/工程/components/` | 只在这条片里成立 |
| 跨片复用的素材 | `brand/library/` | 换一条片还用得上 |
| 本条的截图 / 生图 / 精灵 | `<条目>/素材/` | 只在这条片里成立 |
| 频道固定音库 | `brand/audio/` | 每片都可能用 |
| 本片专属音效 | `<条目>/配音/音乐音效/` | 为这一拍现造的 |

AGENTS.md 手写块：

> **不往公共引擎塞一次性组件**——频道级、跨内容复用的才进 `sop/kit/scenes/`，本条独有的留 `工程/`。

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
1. 建频道根，写 channel.json（最少只要 name）
2. 写 layout 段：contentDir / entryDirName / sections（菜谱类标 recipe）/ artifacts / cardAssets
3. 按 layout 的声明 mkdir：sop/ brand/ work/ 下各库（声明和磁盘要对得上）
4. 写 agent 段（guide / skills / scripts），在 app 里打开一次 → AGENTS.md + CLAUDE.md 自动生成
5. 写 .gitignore（照 templates/gitignore.txt 改目录名）
6. 开第一条内容，把 8 个目录 + 2 个文件的骨架建全（空目录也建；sop/kit/scripts/new-entry.sh 按卡建）
```

**第 3 步和第 2 步的顺序不能反**：先声明后建目录，才不会出现「盘上有的卡里没有」
或者「卡里写的盘上没有」。

## 自检

- [ ] 卡里声明的每一条路径，`ls` 一遍都真的存在
- [ ] 盘上每一个做法目录，都能在频道卡里找到指向它的那一行（`layout.cardAssets` / `agent` / `prompts`）
- [ ] `work/` 里没有任何一份东西是「卡里那份的第二个副本」
- [ ] 菜谱类的区（如质检教训）标了 `recipe: true`，作品类的区没标
- [ ] `.channek/` 与 `.claude/` 已被 `.gitignore` 挡住
- [ ] 卡里没有任何一条本机绝对路径（机器值全在 `.channek/plugin-settings.json`）
- [ ] 条目骨架 8 个目录一个不少，空的也在
- [ ] 条目名前六位是能被 `gateSinceDate` 解析的 YYMMDD
