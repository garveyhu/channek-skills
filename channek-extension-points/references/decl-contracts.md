# 常用扩展点 decl 字段摘要

只摘**已实现（✅）**与**蓝图中最常被问到（🚧）**的点。契约以 app 内校验为准；蓝图点实现时可能回改。

## UI 外壳（✅）

```ts
// ui.command —— 用户可触发的操作（Yan 与命令面板都从这张表读）
{ id; title; description?; keywords?; category?; when?; danger? }
// description 给模型读（一句人话说做什么）；keywords 写「用户会怎么说」（纯索引）。
// 两位不写照常工作，但 Yan 按用户说法搜不到你。danger: true = 不可逆动作按危险色渲染。

// ui.keybinding
{ command; key; when? }              // key 如 'mod+shift+p'

// ui.menu —— 挂进某个菜单位置
{ menu: 'filetree/context' | 'tab/context' | 'editor/context' | 'palette'
        | 'styleCard/row' | 'plugin/row';
  command; group?; order?; when?; submenu? }

// ui.submenu —— 二级子菜单节点（顶层显示「标题 ▸」）
{ menu; id; title; group?; order?; when? }

// ui.panel —— 左栏面板
{ id; label; slot: 'rail'; order?; when? }          // props: { active }

// ui.viewerAction
{ id; command; icon?; when? }

// ui.fileViewer
{ id; label; matches: { extensions?; filenames?; mediaTypes? };
  priority?; capabilities?: { edit? } }              // 实现：内置组件或 T1 sandbox entry

// ui.theme —— 白名单 token 包（没有自由 CSS；间距 / 字号动不了）
{ id; label; base: 'light' | 'dark'; tokens: Record<string,string>;
  fonts?; preview: { surface; ink; accent } }

// ui.iconTheme
{ id; label; defs: { folder; folderOpen; file; … } }

// ui.settingsSection —— schema 自动渲染表单
{ id; label; provider?; fields: SettingsField[] }
// SettingsField: boolean / string / number / directory / select / dynamicSelect
//   / action(按下跑本插件一条命令) / embed(这一格挂本插件的 T1 沙箱页)
// 每字段：{ key; type; label; default; scope?: 'user'|'workspace'|'both'; snapshot?; placeholder? }
// dynamicSelect: { optionsFrom: <command 形态> } —— 子进程 stdout 末行回 {"options":[…]}

// ui.suiteSection —— 整页功能区
{ id;            // 点分小写命名空间 ≥2 段（如 acme.fan-ops.assets）；裸 id 非法
  label; icon;   // icon: 内置图标名 | 内联 SVG data-URI，未知值兜底中性字形
  order?;        // 仅无 presentation 的默认链排序用；卡声明时数组序是唯一顺序
  when?;
  declaredOnly?; // true = 只在卡 presentation.sections 点名时出现
  entry? }       // 本区沙箱入口 html（缺省回落 manifest entries.sandbox）；入口即身份
// props: { workspaceId: string | null; active: boolean }
```

## 后端与数据（✅）

```ts
// generation.provider
{ id; label; kinds: string[] }
// 运行时：{ providerKind; capabilities: Set<能力id>; secretsNeeded; supports(req); generate(req, ctx) }

// generation.preview（编辑期预览，与离线 baker 刻意分开）
{ id; label; generatorKinds: string[]; bringYourOwnRuntime? }

// publish.platform
{ id; label; platform: string }      // + 运行时平台 adapter（T2）

// media.exportPreset（T0 纯数据，喂 WebCodecs 编码器）
{ id; label; description?; container: 'mp4';
  video: { codec: 'avc'; bitrate: number | null }; audio: { codec: 'aac'; sampleRate } }

// media.analyzer（媒体探测——不是内容理解）
{ id; label; extensions: string[]; fallback?: boolean }

// production.analyzer（进度真相模型；由布局的 progressAnalyzer 语义 id 点名）
{ id; label }

// plugin.requirement —— 见 channek-plugin-dev/references/readiness.md
```

## 频道系统（🚧 蓝图·卡侧机制已可用）

```ts
// workspace.artifactKind —— 类型化工件
{ kind: '<ns>.<name>'; label;
  storage: { pattern: string;        // 条目目录内相对 glob；可被卡 layout.artifacts 覆盖
             format?: 'markdown' | 'json' | 'media' | 'directory' | string };
  schema?; viewer? }
// 内核只自带 channek.entry（entry.md）与 channek.project（project/{slug}.channek）；
// 创作域工件由贡献对应步骤的插件声明。

// workspace.layout —— 目录布局 preset
{ id; label; contentDir; entryDirName?; sections?: [{ id; path }];
  artifacts?: Record<kind, 落点>; detect?: { anyOf: string[] } }
// 内核默认 preset：channek.default（contentDir='content'，entryDirName='{date}-{slug}'）

// ui.contentStep —— 步的工作台面（与 production.step 同 id 关联为一步两面）
{ id; label; kind: 'creative' | 'production'; icon?;
  consumes?; consumesOptional?; produces?;   // ArtifactKind ids；写集=白名单
  promptKey?; capabilities?; primaryDocument?;
  entry?;                                    // T1 沙箱工作台入口
  configSchema?; order? }                    // order 仅模板编辑器排序建议
// props: { workspaceId; slug; stepKey; config; card(只读投影); artifacts(受控读写句柄); onOpenEditor? }

// production.step —— 步的自动化面
{ id; kind: 'creative' | 'mechanical'; consumes; produces; configSchema?;
  run(ctx): Promise<StepOutcome> }
// StepOutcome: advance | awaitInput | rewind | fail

// production.template —— 预设步序
{ id; label; description?; steps: [{ key; step; config?; optional? }]; defaults? }
```

## 剪辑台扩展面（🚧 蓝图）

```ts
// editor.panel
{ id; label; icon?; dock: 'left' | 'right' | 'bottom'; order?; when? }
// editor.inspector（按选中对象类型匹配）
{ id; matches: { clipKind?; generatorKind?; transitionKind? }; order? }
// editor.assetSource（素材来源页签；拖入一律经内核导入管线，大二进制只传路径）
{ id; label; icon?; order? }
// editor.timelineBadge（插件给数据、内核渲染）
{ id; appliesTo: { clipKind?; analyzerKind? } }
// 贡献数据形状：{ clipId; range?; icon?; color?; label? }
```

**全族写权限红线**：任何贡献改工程文档只能经宿主 API 提案 `EditTransaction`（带 baseRevision）；
拿到的项目数据是只读投影。

## 能力体系（✅）

`capability.definition` / `capability.provider` 的完整契约（invoke 四形态、占位符、credentials）
见 channek-plugin-dev/references/capability-provider.md。

## 自定义扩展点（✅）

```jsonc
"extensionPoints": [{ "id": "acme.myplugin.effects", "mode": "collect",
                      "declSchema": [{ "key": "id", "type": "string", "required": true }] }]
```

id 必须 `<你的pluginId>.` 前缀；别的插件就能往 `contributes["acme.myplugin.effects"]` 里插贡献
——生态长在生态上。
