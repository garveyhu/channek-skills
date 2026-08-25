# 贡献键全表（manifest `contributes` 的合法键）

共 **41** 个。这是**声明面**的全集——列在这里不等于每个点都已有消费方；契约以 app 内的
decl 类型与校验为准（对应类型名附后，供查 SDK / 文档站）。

| 贡献键 | 它是什么 | 契约类型 |
|---|---|---|
| `ai.analyzer` | 内容理解分析器（转写 / 静音 / 口头禅 / 镜头…） | `AiAnalyzerDecl` |
| `ai.delegate` | 一个能接受托任务的贡献者 | `AiDelegateDecl` |
| `ai.macro` | 高层意图宏（确定性算法批量产编辑 op） | `AiMacroDecl` |
| `ai.tool` | LLM 可调用的读 / 写工具（写只产提案） | `AiToolDecl` |
| `capability.definition` | 一条能力吃什么、吐什么——接口归能力不归 provider | `CapabilityDefinitionDecl` |
| `capability.provider` | 提供一条能力（command / http / module / host 四形态） | `CapabilityProviderDecl` |
| `credential.kind` | 一种密钥长什么样 | `CredentialKindDecl` |
| `developer.terminal` | 内置终端 profile | `TerminalProfileDecl` |
| `editor.assetSource` | 剪辑台素材面板来源页签 | `EditorAssetSourceDecl` |
| `editor.inspector` | 检查器区段（按选中对象类型匹配） | `EditorInspectorDecl` |
| `editor.panel` | 剪辑台 dock 可停靠面板 | `EditorPanelDecl` |
| `editor.surface` | 整个剪辑工作台由谁承载（声明面） | `EditorSurfaceDecl` |
| `editor.timelineBadge` | clip 上的声明式装饰（插件给数据、内核渲染） | `EditorTimelineBadgeDecl` |
| `generation.baker` | generator → footage 的烘焙器 | `GeneratorBakerDecl` |
| `generation.preview` | 编辑期场景预览 bundle 能力（与离线 baker 分开） | `GeneratorPreviewDecl` |
| `generation.provider` | 素材生成器接入（image / video / tts / cover…） | `GeneratorProviderDecl` |
| `generation.scene` | 数据可视化幕的原生渲染器 | `SceneRendererDecl` |
| `media.analyzer` | 媒体探测：按扩展名认领文件，读时长 / 尺寸 / 轨道 | `MediaAnalyzerDecl` |
| `media.exportPreset` | 导出预设（容器 + 编码 + 码率 + 采样率，纯数据） | `ExportPresetDecl` |
| `media.importer` | 外部素材 / 第三方工程 → 初始工程的导入器 | `MediaImporterDecl` |
| `operations.dataSource` | 运营中心的指标来源 | `OperationsDataSourceDecl` |
| `production.analyzer` | 进度真相模型（灯轨怎么亮）可插拔 | `ProgressAnalyzerDecl` |
| `production.step` | 出片流程一步的自动化面 | `ProductionStepDecl` |
| `production.template` | 出片模板 = 一组预设步序（卡 `pipeline.template` 引用） | `ProductionTemplateDecl` |
| `publish.platform` | 发布平台 adapter | `PublishPlatformDecl` |
| `ui.command` | 一条用户可触发的操作 | `CommandDecl` |
| `ui.contentStep` | 内容工作站「步 workbench」（与 production.step 同 id 关联） | `ContentStepDecl` |
| `ui.contentSurface` | 一条内容的详情页由谁承载（声明面） | `ContentSurfaceDecl` |
| `ui.fileViewer` | 文件查看器 / 编辑器（按扩展名 / 文件名 / mediaType 匹配） | `FileViewerDecl` |
| `ui.iconTheme` | 文件图标集 | `IconThemeDecl` |
| `ui.keybinding` | 快捷键绑定 | `KeybindingDecl` |
| `ui.menu` | 菜单项（filetree / tab / editor / palette / styleCard row / plugin row 等位置） | `MenuDecl` |
| `ui.panel` | 左栏（rail）面板 | `PanelDecl` |
| `ui.settingsSection` | 插件设置页（schema 自动渲染表单） | `SettingsSectionDecl` |
| `ui.submenu` | 二级子菜单节点 | `SubmenuDecl` |
| `ui.suiteSection` | 整页功能区（activity bar 区位；卡 presentation 点名启用） | `SuiteSectionDecl` |
| `ui.theme` | 配色主题（白名单 token 包 + 自带字体） | `ThemeDecl` |
| `ui.viewerAction` | 查看器头部动作钮 | `ViewerActionDecl` |
| `workspace.artifactKind` | 一种类型化工件——步骤间唯一的数据衔接契约 | `ArtifactKindDecl` |
| `workspace.layout` | 工作区目录布局 preset（探测 / 脚手架数据源） | `WorkspaceLayoutDecl` |
| `workspace.styleCard` | 插件携带风格卡模板（出现在建频道向导） | `WorkspaceStyleCardDecl` |

另有一个**非扩展点**的贡献键同样写在 `contributes` 里：

| 键 | 说明 |
|---|---|
| `plugin.requirement` | 前置就绪声明（探测 + 补救）——见 channek-plugin-dev 的 readiness 参考 |
