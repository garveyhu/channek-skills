<!-- 同步自 Channek 仓库 docs/plugin/reference/suite-bridge-ops.md（由源码生成）。勿手改：跑 scripts/sync-contracts.mjs -->
<!-- 此文件由 pnpm gen:plugin-ref 生成，请勿手改。 -->
# suite 桥 op 全表

T1 沙箱插件经 `@channek/sandbox-sdk` 的 suite 桥能调的**全部**方法，共 **31** 条。
**这是一张封闭白名单**——不在表里的方法一律拒绝，通用逃逸口（任意路径读文件 / 执行命令 /
转发任意 IPC）永不进表。分组与说明照抄源码里那几段注释（它们记的是每一批为什么被放进来）。

- `assets.overview`
- `shell.openContent`
- `shell.openSection`
- `clipboard.writeText`

v2 数据面（plugin-architecture §2.2.1）：**app 打开这个工作区时本来就已加载/已授权的数据** 一律给 T1——插件读它 ≡ app 自己读它，同一份用户授权，不构成新的信任要求。 反面同样成文：通用逃逸口（任意路径读文件 / 执行命令 / 转发任意 IPC）永不进这张表。

- `workspace.info`
- `content.list`
- `content.detail`
- `card.active`

`card.config`：按**完整键**（`段 id.短键`，如 `voice.default`、`publish.accounts`）取频道参数。 插件段缺的键已按插件声明补上默认值；不给 `keys` 回整张表。内核不认识任何领域键—— 人设、画风、平台、素材目录都从这里按名字取（宪法 §0）。 /

- `card.config`

`artifact.urls`：按**种类**点名取一条内容的工件地址（`{ byKind, files }`）。内核不认识母版、 封面这些名字——插件说要哪几种（`channek.master`、`channek.covers` …），宿主按卡的布局与种类 声明去找文件、铸地址。点了名但频道不认识的种类直接报错。 /

- `artifact.urls`
- `pipeline.status`
- `content.createEntry`

主页替代插件撞出来的三条（自吃狗粮：内核自己的区做不出来，第三方更做不出来）。 头像横幅的位置由插件从 `card.config` 读出来传进来，宿主不按名字读卡。

- `publish.platforms`
- `card.brandAssets`
- `card.kickoff`

`card.readDoc`：读一份**卡自己指名过**的文档（`card.active` 的 `docRefs` 列的那些）。 判据（§2.2.1「该给 T1」那格）：卡是「这个频道怎么创作」的公开声明，app 打开这个工作区时 本来就加载了它。插件读它 ≡ app 读它。**不是通用文件读**：两道闸——路径必须是卡内相对路径 （绝对 / `..` 一律拒），且读的是**这扇窗那张卡**（宿主核对活动卡就是本频道绑的那张， 与 `card.updateSoundMeta` 同一条判断·§12-6）。 有它，「封面版面写在卡里、由插件拼提示词」才成立——否则那份知识只能挪进内核。 /

- `card.readDoc`

内容步承载面撞出来的两条：步的工作台就是「打开这条内容的某份工件，改完存回去」。 没有它们，T1 步只能显示 init 快照里的文件名与字节数，正文一个字都读不到—— 而同一份正文，app 自己的文件面板在同一个工作区里早就打开着（同一份用户授权）。

- `content.readFile`
- `content.writeFile`

频道级的文本读写：选题库、声音库说明卡这类不属于某一条内容、而属于整个频道的数据。 插件自己的数据自己存，内核不再为每一种各开一条专线。遏制在频道根内；`.channek/`、`.git/` 不可见；频道卡与频道插件目录只读。写回带读到的 `revision`，中间被改过就冲突。 /

- `channel.readFile`
- `channel.writeFile`

素材 / 配音 / 封面步搬去第三方之后撞出来的「宿主动作」。四条都不是通用逃逸口—— 不接受任意命令、任意路径、任意 IPC 通道名，每条只接受一组**具体语义**的实参， 做的事 app 自己在同一个工作区里早就在做、且用户已经为它授权过（§2.2.1「该给 T1」那格）。 - `shell.openArtifact`：把**这条内容目录里的一份产物**交给 app 自己的文件工作台。 与 `openContent` / `openSection` 同族的导航 op：不返数据、不落盘，宿主逐条校验实参 （itemId 过条目索引 + relPath 过形状门 + 文件树里找不到就如实提示），免权限。 /

- `shell.openArtifact`

`scene.preview`：为**这条内容**烘一次场景预览，拿回一枚 `plugin://<grant>/index.html`。 不是逃逸口：插件递不进路径、递不进 runtime 位置、也指定不了用哪个 provider——宿主按 `generation.preview` 扩展点找贡献者（当前是 `links.remotion`），产物落宿主自己的临时目录， 交回来的 URL 是**一次性 grant**（随机 256-bit host，随工作区释放而失效）。插件拿到它只能 放进 iframe 显示：跨 origin，框进来读不到内容。 为什么必须过桥而不是插件自己渲：tsx 要变成画面得跑 Remotion 的构建，那是 T2 的活； T1 沙箱页既没有 Node 也不该有。这条正是「插件说要什么、宿主决定怎么做」的样子。 /

- `scene.preview`

`scene.export`：把**这一镜**烘成 mp4 并另存到用户挑的位置。 承载类而非业务类（OPEN-ISSUES 的 op 分界草案）：终点是**工作区外的原生保存框**——只有宿主 开得了那个框，也只有特权侧能裁决往哪写。插件递的是 itemId + 组件名 + 建议文件名， 选哪个目录、要不要覆盖，全是人在原生对话框里当场决定的。 用户取消保存框 = 回 `false`，不是错误：那是一次正常的「算了」。 /

- `scene.export`

「先看再要」两条：`capability.preview` 跑一次能力但**产物不进频道**（落 trials 目录， 回一枚预览 URL），`capability.adopt` 把看中的那件落成这条内容的正式工件。 为什么要有它们：生成类能力（封面 / 生图 / 配音）的产出值不值得留，人得先看一眼。 只有 `capability.invoke` 的话，插件能做的只有直出直落——而那意味着「不满意」等于 「上一张已经没了」。 三道闸与 `capability.invoke` 同源，另加两条： ① **`file` 类入参插件仍然给不了绝对路径**，只能用 `cardRefs` 点名**卡内**的素材 （参考图 / 画风锁），宿主解析并遏制在卡根内——插件读得到卡，但指不出卡外的东西； ② **落点由卡回答**：`adopt` 收的是语义 id + 实例名（`channek.covers` + `16x9`）， 路径与文件名从卡为那个 kind 声明的 pattern 解析。插件说不出「写到哪个文件」。 组装提示词、出哪几档、界面怎么挑——全在插件那边，宿主一个字都不认识。 /

- `capability.preview`
- `capability.adopt`

`capability.invoke`：调一条**已注册能力**——插件之间协作的通用通道。 在它之前，每加一种跨插件协作都要开一条专用 op（协议 + 宿主 + IPC 三处一起改）：发布步 想让浏览器起来、想借出图能力画一张，都得先动内核。那不是扩展点，那是每次都要改内核的 硬编码分派——正是 ADR-18 要消灭的东西。 三道闸，缺一不可： ① **清单白名单**：`{permission:'capability:invoke', capabilities:[…]}` 逐条点名，不给通配； ② **目的地归宿主**：`file` 类入参一律由宿主按 `itemId` 解析后注入，插件给的值丢弃—— 插件说得出「做什么」，说不出「对哪个目录做」； ③ **params 插件看不见**：profile 目录、端口、密钥、解释器路径是装配期算好的，不过桥。 与被否掉的 `shell.openExternal` 的分界仍然清楚：那条是「打开任意 URL」，目的地由插件给； 这条的目的地全由宿主算。 /

- `capability.invoke`

配音步搬去第三方之后撞出来的两条，判据同上一组： - `artifact.mediaUrl`：为条目内**单个**产物懒铸一枚 capability URL。§2.2.1「该给 T1」那格 明列「工件 capability URL」，批量口 `artifact.urls` 早在本表内——这条只是同一份授权的 per-item 兜底（逐幕旁白试听：批量授权覆盖不到 pipeline 那侧 `url:null` 的音频行）。 遏制与批量口同源，铸不出条目目录以外的任何东西。 - `card.updateSoundMeta`：改活动卡声音库里那条 wav 的说明卡（评分 / 用途 / 说明）。 app 自己在配音步就提供这个编辑器，同一份用户授权。**卡 id 由宿主注入**、插件递不进来； 遏制在 media 侧（限卡声明的声音库目录内 · 只认 `.wav` · 只写同目录 `_meta/<名>.json` · patch 字段白名单）。它写盘 → 进写 op。 /

- `artifact.mediaUrl`
- `card.updateSoundMeta`

灯轨上「这次的过期我认了」三条：认下一步 / 一键认下整条 / 反悔。 黄灯是内核按上游工件指纹推出来的，而 mtime 会因为一次无关的改动就翻新——没有出路的话 用户只能看着一盏永远消不掉的黄灯。灯轨此刻是 T1 插件画的，所以这条出路必须过桥， 否则它就只在内核自己的界面上存在。 判据与 `content.writeFile` 同一格（§2.2.1「该给 T1」）：确认记落在**这条内容自己的目录**里， 是 app 在灯轨上本来就提供的动作、同一份用户授权。插件递不进落点，也决定不了「过期」怎么算： 判定与指纹全由 media 侧现探现算，插件只能把已经算出来的那盏灯按下去或松开。 三条都写盘 → 进 `SUITE_BRIDGE_WRITE_OPS`（`workspace:write` + 一次性同意闸）。应答一律是 **重算后的整条灯轨**（≡ `pipeline.status`）：让插件确认完再拉一次只会先画一帧旧的。 /

- `pipeline.acknowledgeStale`
- `pipeline.acknowledgeAllStale`
- `pipeline.revokeStaleAcknowledgement`
