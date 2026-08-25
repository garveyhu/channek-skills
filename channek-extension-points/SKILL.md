---
name: channek-extension-points
description: Channek 扩展点 API 速查与路由：「我要做 X → 该用哪个扩展点 / 桥 op / 能力」，附全部贡献键表、decl 契约摘要、suite 桥 op 白名单表。当用户问「Channek 有哪些扩展点 / extension points」「这个功能该插在哪」「manifest contributes 能写什么键」「suite 桥能调什么 op」「T1 能拿到什么数据」时使用。Use when looking up Channek extension points, contribution keys, or sandbox bridge ops.
---

# Channek 扩展点速查

这是一本速查手册。回答用户时守三条：**先给结论**（用哪个扩展点 / 能不能做），再补一句白话解释
那个扩展点是干嘛的；表里标 🚧 的要明说「规格定了但还没实现，现在做会踩空」；用户描述的是需求
不是术语——由你来把「我想在侧边加个自己的页面」翻译成 `ui.suiteSection`，不要反问他术语。

先分清三种加法（方向选错要么白写、要么改不动）：

| 你要的是 | 机制 | 加法 |
|---|---|---|
| **插件提供能力给宿主装配**（新面板 / 新步骤 / 新主题…） | 扩展点（manifest `contributes`） | 查下面的路由表选 point |
| **插件调用别的插件的能力**（出图 / TTS / 浏览器会话…） | `capability.invoke`（权限点名 + 桥 op / T2 ctx） | 注册能力 id，不动内核 |
| **插件调用宿主的特权能力**（导航 / 剪贴板 / 读频道数据…） | suite 桥 op（封闭白名单） | 查 `references/bridge-ops.md`——表里没有 = 现在拿不到 |

## 「我要做 X」路由表

| 我要做 | 扩展点 | 信任级 | 状态 |
|---|---|---|---|
| 换配色皮肤（token 包 + 自带字体） | `ui.theme` | T0 | ✅ |
| 文件图标集 | `ui.iconTheme` | T0 | ✅ |
| 某类文件的查看器 / 编辑器 | `ui.fileViewer` | T0 声明 + T1 UI | ✅ |
| 左栏面板 | `ui.panel` | T1 | ✅ |
| 整页功能区（activity bar 一个区） | `ui.suiteSection` | T0 声明 + T1 页面 | ✅ |
| 用户可触发的操作 | `ui.command`（+ `ui.menu` / `ui.keybinding` / `ui.submenu` / `ui.viewerAction`） | T0 声明 + T1/T2 实现 | ✅ |
| 插件自己的设置页 | `ui.settingsSection`（schema 自动渲染表单；`action` / `embed` / `dynamicSelect` 字段可用） | T0 | ✅ |
| 出片流程里的一步（工作台面） | `ui.contentStep`（与 `production.step` 同 id = 一步两面） | T1 可承载 | ✅ |
| 出片流程里的一步（自动化面） | `production.step` | T2 | 🚧 蓝图 |
| 一组预设步序（出片模板） | `production.template` | T0 | 🚧 蓝图 |
| 进度灯轨的判定逻辑 | `production.analyzer` | 声明面 ✅ / 第三方代码面 🚧 | |
| 定义一条能力（吃什么吐什么） | `capability.definition` | T0 | ✅ |
| 提供一条能力（本机脚本 / 云 API） | `capability.provider` | T2（command 形态） | ✅ |
| 素材生成器 / 场景预览 / 烘焙器 | `generation.provider` / `generation.preview` / `generation.baker` / `generation.scene` | T2 | provider·preview ✅ / baker·scene 🚧 |
| 发布平台对接 | `publish.platform` | T2 | ✅ |
| 导出预设（容器 / 编码 / 码率） | `media.exportPreset` | T0 | ✅ |
| 媒体探测（这个文件是什么） | `media.analyzer` | | ✅ |
| 媒体导入器 | `media.importer` | | 🚧 蓝图 |
| 内容理解（转写 / 静音 / 镜头…） | `ai.analyzer`（注意与 `media.analyzer` 不是一回事） | | 🚧 蓝图 |
| AI 工具 / 宏 / 受托执行 | `ai.tool` / `ai.macro` / `ai.delegate` | | 🚧 蓝图 |
| 携带风格卡模板（出现在建频道向导） | `workspace.styleCard` | T0 | 🚧 蓝图（卡本体机制已可用） |
| 声明一种工件类型 | `workspace.artifactKind` | T0 | 🚧 蓝图 |
| 工作区目录布局 preset | `workspace.layout` | T0 | 🚧 蓝图 |
| 运营中心数据源 | `operations.dataSource` | | 🚧 蓝图 |
| 剪辑台面板 / 检查器 / 素材源 / 时间轴徽标 | `editor.panel` / `editor.inspector` / `editor.assetSource` / `editor.timelineBadge` | | 🚧 蓝图（声明面已登记） |
| 内置终端 profile | `developer.terminal` | T2 | 🚧 蓝图 |
| 密钥种类 | `credential.kind` | | ✅ |
| **自己开一个插座**让别的插件插 | manifest `extensionPoints`（id 须 `<你的pluginId>.` 前缀） | 声明 T0 | ✅ |

状态口径：✅ = 已实现（契约以 app 内 decl 校验为准）；🚧 = 蓝图（规格已定，实现时可能回改——
写之前先在 app 里验证该点是否已开）。

## 判断法：这个需求能不能做成插件

```
① 它要维护一份平行的真相吗（时间轴 / 播放时钟 / 显存）？
      是 → 红线。改成「提议 + 内核执行」的形态（改工程 = 提案 EditTransaction）
② 它要的数据在 suite 桥白名单里吗（references/bridge-ops.md）？
      在 → 现在就能做（T1）
③ 它能靠自己的 T2 算出来吗（读文件 / 跑命令 / 调 API）？
      能 → 现在就能做（T2 + rpc）
④ 都不能 → 那是内核该开新扩展点 / 新 op 的活——不是被禁止，是还没开
```

永远不能外包的三组（红线）：`.channek` 数据模型与 EditTransaction 唯一写路径 · 媒体引擎
（时钟 / 帧调度 / 显存）· 安全地基（验签 / 信任 / IPC 校验）。一句话：**插件可以做任何事，
但不能各自维护一份真相。**

## References

- `references/contribution-keys.md`——manifest `contributes` 全部 41 个贡献键
- `references/decl-contracts.md`——常用扩展点的 decl 字段摘要
- `references/bridge-ops.md`——T1 suite 桥全部 34 条 op（权限 / 读写 / 限额）
