<!-- 同步自 Channek 仓库 docs/plugin/reference/contribution-keys.md（由源码生成）。勿手改：跑 scripts/sync-contracts.mjs -->
<!-- 此文件由 pnpm gen:plugin-ref 生成，请勿手改。 -->
# 贡献键全表（扩展点）

插件在 `manifest.json` 的 `contributes` 里按这些键贡献东西。共 **41** 个。

> 这张表是**声明面**的全集——列在这里不等于每个点都已经有消费方。某个点现在有没有人读它，
> 看它那一列的声明文件与调用处；契约本身以类型定义为准。

| 贡献键 | 它是什么 | 契约类型 · 声明在 |
|---|---|---|
| `ai.analyzer` | 内容理解分析器（转写 / 静音 / 口头禅 / 镜头 …）。 | `AiAnalyzerDecl` · `shared/ipc-contract/src/ai-points.channels.ts` |
| `ai.delegate` | 一个能接受托任务的贡献者。 | `AiDelegateDecl` · `shared/ipc-contract/src/delegation.channels.ts` |
| `ai.macro` | — | `AiMacroDecl` · `shared/ipc-contract/src/ai-points.channels.ts` |
| `ai.tool` | AI 层的三个点声明面（extension-points §2.5）。 | `AiToolDecl` · `shared/ipc-contract/src/ai-points.channels.ts` |
| `capability.definition` | 一条能力**吃什么、吐什么**——接口归能力，不归 provider。 | `CapabilityDefinitionDecl` · `shared/ipc-contract/src/capability.channels.ts` |
| `capability.provider` | — | `CapabilityProviderDecl` · `shared/ipc-contract/src/capability.channels.ts` |
| `credential.kind` | 一种密钥长什么样（`credential.kind` 扩展点的贡献声明）。 | `CredentialKindDecl` · `frontend/ui/src/extensions/points/credentialKind.point.ts` |
| `developer.terminal` | `developer.terminal` 声明（extension-points §2.8）。 | `TerminalProfileDecl` · `shared/ipc-contract/src/terminal-points.channels.ts` |
| `editor.assetSource` | — | `EditorAssetSourceDecl` · `shared/ipc-contract/src/editor-points.channels.ts` |
| `editor.inspector` | — | `EditorInspectorDecl` · `shared/ipc-contract/src/editor-points.channels.ts` |
| `editor.panel` | 剪辑台扩展面的四个点（extension-points §2.6）。 | `EditorPanelDecl` · `shared/ipc-contract/src/editor-points.channels.ts` |
| `editor.surface` | `editor.surface` 的**声明面**：整个剪辑工作台由谁承载。 | `EditorSurfaceDecl` · `frontend/ui/src/extensions/points/editorSurface.point.ts` |
| `editor.timelineBadge` | — | `EditorTimelineBadgeDecl` · `shared/ipc-contract/src/editor-points.channels.ts` |
| `generation.baker` | `generation.baker` 声明（extension-points §2.2·AGENTS §10）——把 generator→footage 的**烘焙器** 变成可插拔贡献。 | `GeneratorBakerDecl` · `shared/ipc-contract/src/baker.channels.ts` |
| `generation.preview` | 编辑期场景预览 bundle 能力；与离线 baker 分开，避免两条生命周期互相冒充。 | `GeneratorPreviewDecl` · `shared/ipc-contract/src/generation-preview.channels.ts` |
| `generation.provider` | — | `GeneratorProviderDecl` · `shared/ipc-contract/src/generation.channels.ts` |
| `generation.scene` | `generation.scene` 声明（extension-points §2.3）。 | `SceneRendererDecl` · `shared/ipc-contract/src/scene-points.channels.ts` |
| `media.analyzer` | `media.analyzer` 声明（extension-points §2.4）——让「探一个媒体文件是什么」可插拔。 | `MediaAnalyzerDecl` · `shared/ipc-contract/src/media-points.channels.ts` |
| `media.exportPreset` | 导出预设 = 一档「容器 + 编码 + 码率 + 采样率」的纯数据声明。 | `ExportPresetDecl` · `frontend/ui/src/extensions/points/exportPreset.point.ts` |
| `media.importer` | `media.importer` 声明（extension-points §2.4）——把「外部素材 / 第三方工程 → 初始 `.channek`」这条路做成可插拔。 | `MediaImporterDecl` · `shared/ipc-contract/src/importer.channels.ts` |
| `operations.dataSource` | `operations.dataSource` 声明（extension-points §2.6）——运营中心的指标来源可插拔。 | `OperationsDataSourceDecl` · `shared/ipc-contract/src/operations-points.channels.ts` |
| `production.analyzer` | `production.analyzer` 声明（extension-points §2.2）——让**进度真相模型**可插拔。 | `ProgressAnalyzerDecl` · `shared/ipc-contract/src/production-points.channels.ts` |
| `production.step` | `production.step` / `production.template` 声明（extension-points §2.2）。 | `ProductionStepDecl` · `shared/ipc-contract/src/production-points.channels.ts` |
| `production.template` | 出片模板 = 一组预设步序（卡 `pipeline.template` 引用之·12 §3.1）。 | `ProductionTemplateDecl` · `shared/ipc-contract/src/production-points.channels.ts` |
| `publish.platform` | — | `PublishPlatformDecl` · `shared/ipc-contract/src/publish.channels.ts` |
| `ui.command` | 一条用户可触发的操作。 | `CommandDecl` · `frontend/ui/src/extensions/points/command.point.ts` |
| `ui.contentStep` | 内容工作站「步 workbench」的可插拔声明（C0 冻结·对齐 docs/design/12-channel-system.md §3 + docs/plugin/extension-points.md §2.1 + 09-CONTRACTS §J1）。 | `ContentStepDecl` · `frontend/ui/src/extensions/points/contentStep.point.ts` |
| `ui.contentSurface` | `ui.contentSurface` 的**声明面**：一条内容的详情页由谁承载。 | `ContentSurfaceDecl` · `frontend/ui/src/extensions/points/contentSurface.point.ts` |
| `ui.fileViewer` | — | `FileViewerDecl` · `frontend/ui/src/extensions/points/fileViewer.point.ts` |
| `ui.iconTheme` | — | `IconThemeDecl` · `frontend/ui/src/extensions/points/iconTheme.point.ts` |
| `ui.keybinding` | — | `KeybindingDecl` · `frontend/ui/src/extensions/points/keybinding.point.ts` |
| `ui.menu` | — | `MenuDecl` · `frontend/ui/src/extensions/points/menu.point.ts` |
| `ui.panel` | — | `PanelDecl` · `frontend/ui/src/extensions/points/panel.point.ts` |
| `ui.settingsSection` | — | `SettingsSectionDecl` · `frontend/ui/src/extensions/points/settingsSection.point.ts` |
| `ui.submenu` | 一个二级子菜单节点自身（顶层显示为「标题 ▸」，展开后列出 submenu 指向它的菜单项）。 | `SubmenuDecl` · `frontend/ui/src/extensions/points/submenu.point.ts` |
| `ui.suiteSection` | — | `SuiteSectionDecl` · `frontend/ui/src/extensions/points/suiteSection.point.ts` |
| `ui.theme` | — | `ThemeDecl` · `frontend/ui/src/extensions/points/theme.point.ts` |
| `ui.viewerAction` | — | `ViewerActionDecl` · `frontend/ui/src/extensions/points/viewerAction.point.ts` |
| `workspace.artifactKind` | 一种类型化工件——步骤间唯一的数据衔接契约（12 §4.1）。 | `ArtifactKindDecl` · `shared/ipc-contract/src/workspace-points.channels.ts` |
| `workspace.layout` | 工作区目录布局 preset（WorkspaceService 数据驱动的探测/脚手架源·12 §5）。 | `WorkspaceLayoutDecl` · `shared/ipc-contract/src/workspace-points.channels.ts` |
| `workspace.styleCard` | `workspace.styleCard` 声明（extension-points §2.7）。 | `WorkspaceStyleCardDecl` · `shared/ipc-contract/src/style-card-points.channels.ts` |
