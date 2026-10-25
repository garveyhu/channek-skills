# 样板 · 飞轮日记（九步视频频道）

**这是一个跑通过 29 条内容、发布过 25 条的真实频道。** 这一册把它从频道卡、目录、脚本、方法论到
内容管理整个拆开，给你一份「照着能建出同等质量」的骨架。

> **它给你什么，不给你什么。** 这个频道自己的商店页写着：「**方法拿走，脸留下。**」
> 本册同理——**结构、流程、判据写法、命名约定照抄**；具体的色值、提示词、IP 形象
> 是它的身份，你要换成自己的。文中出现的数值一律是**它当前的取值，不是常量**。

## 一分钟看懂它长什么样

频道 = 一个文件夹 + 根目录一份**频道卡** `channel.json`。除了这个文件名，里面每个目录叫什么、
放哪，都由频道卡声明。飞轮日记按「菜谱 / 菜」来摆：

```
links.feilun-diary/
├── channel.json  ← 频道卡：912 行（config 段占一半）        │  机器真相源
├── AGENTS.md     ← 十二节托管块（卡渲染）+ 手写区：宪章与补充约定 │  给 AI 的说明书
├── CLAUDE.md     ← 转发器，只写 @AGENTS.md                   │
├── sop/          ← 怎么做（菜谱）：随卡分享                  │
│   ├── README.md         工作流 + 文件夹地图（agent.guide）
│   ├── prompts/          5 份作业指令
│   ├── skills/           16 个（_shared + produce-flow + 14 个单步）
│   ├── kit/              scripts/（1 个脚手架）· scenes/ · snippets/
│   └── lessons/踩坑账.md  114 条坑 → 9 道机器闸（recipe: true，随卡走）
├── brand/        ← 品牌资产（只有视频频道才需要）：token / 风格锁 / 封面 / 平台矩阵 / 字幕 / IP / 音效 …
├── plugins/      ← 频道插件：links.feilun-suite（素材区 + 运营区 + 富灯轨）
└── work/         ← 做出来的东西（菜）：不进卡包
    └── inbox/ 选题 · intel/ 情报 · runs/<YYMMDD-slug>/ 每一期 · review/ 复盘
```

**九步流水线**：选题 → 脚本 → 分镜 → 素材 → 配音 → 字幕 → 剪辑 → 封面 → 发布。

## 四条把它和「一张能跑的卡」区分开的东西

如果你只想要一份合法的频道卡，看 [`../../card-schema.md`](../../card-schema.md) 就够了。
下面这四条才是「质量」的来源：

| | 是什么 | 在哪一章 |
|---|---|---|
| **① 卡是 AGENTS.md 的源** | 说明书的十二节各自由频道卡的某一段喂出来。想让别人的 AI 懂你的频道，唯一动作是**把该进卡的东西都进卡** | [03](03-agents-md.md) |
| **② 方法论随卡分发** | `_shared`（接口契约）+ 单步 skill（怎么做对）+ produce-flow（谁先谁后），由 `agent.skills` 登记。一份只有 `channel.json` 的频道，是把方法论留在了作者脑子里 | [04](04-methodology.md) |
| **③ 判据是可执行的** | 9 道闸挂在**交接口**上，阈值从卡读、脚本不带默认值；装一维新判据要过反向验证 + 历史回归 | [05](05-scripts-and-gates.md) |
| **④ 翻车必须有归宿** | 每条坑三选一：成机器维度 / 进 HUMAN_CHECKS / 引擎侧。**只记不修 = 白记** | [06](06-content-ops.md) |

## 七章，按你要干的事挑

| 章 | 讲什么 | 什么时候读 |
|---|---|---|
| [01 · 骨架](01-skeleton.md) | 菜谱 / 菜的切分 · `.channek/` 是本机状态 · 四库 · 条目 8 目录 2 文件 · 频道级 vs 本条独有 | **建目录前** |
| [02 · 频道卡](02-card-config.md) | 912 行卡的比例尺 · 两层身份 · pipeline 是重映射层 · layout 三套相对基准 · config 的分组 / hint / 阈值容差对 · requires 与频道插件 · 问卷与拷贝语义 | **写 channel.json 时** |
| [03 · 频道说明书](03-agents-md.md) | 托管块十二节 ← 卡的哪一段 · 信任围栏 · `agent` 段的「先看这里」 · prompts 十个约定键 · docs 七个挂载点 · 手写区（宪章 / 补充约定）写什么 | **卡写完、第一次在 app 打开后** |
| [04 · 方法论层](04-methodology.md) | prompts / docs / skills 三件套 · skills 三层 · 单步骨架 · 装闸契约 · 六条范式指纹 | **要写 skill 时** |
| [05 · 脚本与闸](05-scripts-and-gates.md) | 读卡四条路 · 退出码 · 报告五层契约 · HUMAN_CHECKS · 日期门 · 可移植七条 | **要写 check 脚本时** |
| [06 · 内容管理](06-content-ops.md) | 情报五层 · 绝不双写 · 进度双轨 · 质检记忆两层 + 九条通则 · 复盘双闭环 | **要开始做内容时** |
| [07 · 风格与发布](07-style-and-publish.md) | 三套指引机制 · 宪章 vs config · 静/动两张脸 · 判据六种手法 · token 四道防线 · 平台矩阵 + provenance | **要定脸、要发布时** |

模板在 [`templates/`](templates/)：

- [`config-section.jsonc`](templates/config-section.jsonc) —— `config` 段七种字段类型 + 十四个语义键
- [`step-skill-skeleton.md`](templates/step-skill-skeleton.md) —— 单步 skill 的填空骨架
- [`gitignore.txt`](templates/gitignore.txt) —— 频道 `.gitignore`

## 复刻清单：从零到第一条内容

按这个顺序做，每一步都指得到章节。**别跳过第 0 步。**

```
0. 先想清楚「别人拿走这个频道时，什么该跟着走」                         → 01「菜谱 / 菜」
   ├─ 怎么做 → 进做法（方法、判据、token、提示词、流程、质检教训）：sop/ brand/
   └─ 做出来的 → 进作品（情报、选题、成片、复盘）：work/

1. 写名字 + card 段 + profile / format + pipeline                     → 02
   □ name（唯一必填）；card.id / card.slug / card.face / card.version
   □ 顶层 id / slug 不用写：app 首次打开时生成并写回，导出时自动剥掉
   □ profile 八个字段（slogan / mindWord / strategy 不是装饰，AI 会读）
   □ format：横竖屏 / 数字人 / 字幕颗粒（视频频道才写）
   □ pipeline：从九步超集里抽步、改成你的行话（3 / 6 / 9 步都行）

2. 写 layout：目录 + 工件落点 + 资源库                                → 01 + 02
   □ contentDir / entryDirName（{date} 用 YYMMDD，日期门靠它）
   □ sections 用约定 id：intel / topics / review / qc；菜谱类的区标 recipe: true
   □ artifacts：语义 id → 条目内相对路径（描述「是什么」不描述「在哪」）
   □ cardAssets.libraries + docs（七个挂载点）+ brandAssets

3. 按 layout 的声明 mkdir，声明和磁盘要对得上                          → 01

4. 写 config：把每一条判据变成一个可读可改的配置项                      → 02 + templates/
   □ 分组，key 以组 id 为前缀
   □ 阈值配容差项（单点越界是取舍，一串越界才是塌陷）
   □ hint 写「这条尺子防的是哪种偷懒」，不写「这个数是什么」
   □ 该冻的冻（channek.freeze.*）

5. 写判据文档：宪章（AGENTS.md 手写区）/ 静态脸 / 动态脸 / 平台矩阵      → 07
   □ 形容词一律换成可判定的形态（六种手法）
   □ 机器读 JSON + 人读 md 成对，人读那份自标「可能滞后」
   □ 平台矩阵：limit* / sweet* / video 分开，每值挂 provenance，null = 没有尺子

6. 写 prompts（含 kickoff）                                          → 03 + 04

7. 写 agent 段：guide（工作流说明）/ skills / scripts                 → 03
   □ 在 app 里打开一次 → AGENTS.md 生成 → 逐节检查有没有空掉的
   □ 空掉的每一节都要问一句：是我不需要，还是卡里漏写了？

8. 写 skills：_shared 先行，再单步，最后 produce-flow                 → 04 + templates/
   □ _shared 定死两条接口（读卡 / 调能力）+ 五条硬禁止
   □ 单步照骨架填，按需删节
   □ produce-flow 只写跨步的东西：交接链 / 顺序约束 / 闸挂哪 / 退回定位

9. 跑第一条内容，边跑边补 skill                                       → ../../first-content-run.md
   □ 骨架建全（空目录也建）
   □ 两套进度都写（report-step + frontmatter）
   □ 翻的每一次车都记进出片问题记录

10. 验收后蒸馏：出片问题记录 → 踩坑账 → 三选一的归宿                    → 06 + 05
    □ 能成机器闸的当场装，别留 🔴
    □ 装闸过两步验收：反向验证 + 历史回归

11. 要分享时：写 questions + bundle.omit，导出前看身份泄漏提示            → 02
    □ 问卷点名的身份字段（人设 / 口号…）导出时撤下原值、改作示例
    □ 做法文件里写死的频道名 / 人设，导出会提示，自己判断改不改
```

## 三件最容易做反的事

1. **手写 AGENTS.md。** 它的主体是渲染出来的。手改会被下次同步冲掉，
   而且你改的那一节本来该由卡的某个字段喂出来。→ [03](03-agents-md.md)
2. **以为写卡主要是设计流程。** `pipeline` 不到 5%，`config` 占一半。
   流程是九行映射，工作量在「把判据变成配置项」。→ [02](02-card-config.md)
3. **在卡里声明一个阈值就以为它生效了。** 声明本身不产生检查。
   加阈值时问一句：**谁读它？** → [06 通则七](06-content-ops.md#沉淀出的九条通则)

## 诚实标注

- 文中所有数值（配速 5.13、seed 9、830px、阈值…）都是**这个频道当前的取值**，不是常量。
- 这个频道自己还有两个脚本写死了文件名，违反了它自己的可移植规约。
  [05 里点了名](05-scripts-and-gates.md#可移植性七条落实手段)——**照抄合规的那几个**。
- 它的**运营复盘闭环目前是断的**（25 条已发、0 条 reviewed）。设计完整、执行未跟上，
  [06 里如实记了](06-content-ops.md#复盘回流两条闭环诚实地说一条是断的)。
