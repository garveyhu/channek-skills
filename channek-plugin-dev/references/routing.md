# 「我要做 X」→ 插在哪

先分清三种加法（方向选错要么白写、要么改不动）：

| 你要的是 | 机制 | 加法 |
|---|---|---|
| **插件提供能力给宿主装配**（新面板 / 新步骤 / 新主题…） | 扩展点（manifest `contributes`） | 查下面的路由表选 point |
| **插件调用别的插件的能力**（出图 / TTS / 浏览器会话…） | `capability:invoke` 权限点名 + 沙箱侧 `sdk.suite.invokeCapability` | 只能从 **T1 沙箱**发起；T2 host 没有调用口（它只能查「谁提供」） |
| **插件调用宿主的特权能力**（导航 / 剪贴板 / 读频道数据…） | suite 桥 op（封闭白名单） | 查 `generated/suite-bridge-ops.md`——表里没有 = 现在拿不到 |

## 路由表

| 我要做 | 扩展点 | 信任级 |
|---|---|---|
| 换配色皮肤（token 包 + 自带字体） | `ui.theme` | T0 |
| 文件图标集 | `ui.iconTheme` | T0 |
| 某类文件的查看器 / 编辑器 | `ui.fileViewer` | T0 声明 + T1 UI |
| 左栏面板 | `ui.panel` | T1 |
| 整页功能区（activity bar 一个区） | `ui.suiteSection` | T0 声明 + T1 页面 |
| 用户可触发的操作 | `ui.command`（+ `ui.menu` / `ui.keybinding` / `ui.submenu` / `ui.viewerAction`） | T0 声明 + T1/T2 实现 |
| 插件自己的设置页 | `ui.settingsSection`（schema 自动渲染表单；`action` / `embed` / `dynamicSelect` 字段可用） | T0 |
| 出片流程里的一步（工作台面） | `ui.contentStep`（与 `production.step` 同 id = 一步两面） | T1 |
| 出片流程里的一步（自动化面） | `production.step` | T2 |
| 一组预设步序（出片模板） | `production.template` | T0 |
| 进度灯轨的判定逻辑 | `production.analyzer` | |
| 定义一条能力（吃什么吐什么） | `capability.definition` | T0 |
| 提供一条能力（本机脚本 / 云 API） | `capability.provider` | T2（command / http 形态可零代码） |
| 素材生成器 / 场景预览 / 烘焙器 | `generation.provider` / `generation.preview` / `generation.baker` / `generation.scene` | T2 |
| 发布平台对接 | `publish.platform` | T2 |
| 导出预设（容器 / 编码 / 码率） | `media.exportPreset` | T0 |
| 媒体探测 / 导入 | `media.analyzer` / `media.importer` | |
| 内容理解（转写 / 静音 / 镜头…） | `ai.analyzer`（与 `media.analyzer` 不是一回事） | |
| AI 工具 / 宏 / 受托执行 | `ai.tool` / `ai.macro` / `ai.delegate` | |
| 携带风格卡模板（出现在建频道向导） | `workspace.styleCard` | T0 |
| 工件类型 / 目录布局 preset | `workspace.artifactKind` / `workspace.layout` | T0 |
| 运营中心数据源 | `operations.dataSource` | |
| 剪辑台面板 / 检查器 / 素材源 / 时间轴徽标 | `editor.panel` / `editor.inspector` / `editor.assetSource` / `editor.timelineBadge` | |
| 内置终端 profile | `developer.terminal` | T2 |
| 密钥种类 | `credential.kind` | |
| **自己开一个插座**让别的插件插 | manifest `extensionPoints`（id 须 `<你的pluginId>.` 前缀） | 声明 T0 |

**这张表只管「方向」，不承诺「已经能用」。** 贡献键的全集与各自的契约类型、声明位置在
`generated/contribution-keys.md`（由源码生成）；**列在那里不等于已经有消费方**。某个点现在
有没有人读，动手前在 app 里装一个最小插件实测一次，比任何手写的状态标记都准——手写的
「已实现 / 未实现」标记在这份文档的前身里已经过期过一次。

## 判断法：这个需求能不能做成插件

```
① 它要维护一份平行的真相吗（时间轴 / 播放时钟 / 显存）？
      是 → 红线。改成「提议 + 内核执行」的形态（改工程 = 提案 EditTransaction）
② 它要的数据在 suite 桥白名单里吗（generated/suite-bridge-ops.md）？
      在 → 现在就能做（T1）
③ 它能靠自己的 T2 算出来吗（读文件 / 跑命令 / 调 API）？
      能 → 现在就能做（T2 + 沙箱侧驱动）
④ 都不能 → 那是内核该开新扩展点 / 新 op 的活——不是被禁止，是还没开
```

永远不能外包的三组（红线）：`.channek` 数据模型与 EditTransaction 唯一写路径 · 媒体引擎
（时钟 / 帧调度 / 显存）· 安全地基（验签 / 信任 / IPC 校验）。一句话：**插件可以做任何事，
但不能各自维护一份真相。**
