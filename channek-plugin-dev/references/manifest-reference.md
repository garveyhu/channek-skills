# manifest.json 字段参考

契约类型：`@channek/plugin-kit`（`PluginManifest`）。编辑器补全：manifest 首行加
`"$schema": "https://cdn.archeruuu.com/libs/channek/plugin-manifest.schema.json"`。

## 字段表

| 字段 | 必填 | 说明 |
|---|---|---|
| `manifestVersion` | ✅ | 恒为 `1` |
| `id` | ✅ | `<publisher>.<name>`，正则 `^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+$`；**与目录名一致**；`channek.` 保留官方 |
| `name` | ✅ | 显示名；不得含「Channek」字样冒充官方 |
| `version` | ✅ | semver |
| `description` | ✅ | 清单列表里那一行（一句话说「装了它能做什么」） |
| `minAppVersion` | ✅ | 低于此版本的 app 标 incompatible |
| `trust` | ✅ | `declarative`（T0）/ `sandboxed`（T1）/ `privileged`（T2） |
| `apiVersion` | T1/T2 ✅ | 恒为 `"1"`；T0 禁止 |
| `entries` | 视级 | `{ sandbox?: "dist/xx.html", main?: "dist/main.cjs" }`；T0 禁止；T1 必有 sandbox；插件目录内相对路径（绝对路径 / 逃出插件根被拒） |
| `permissions` | 可选 | 见下；T0 禁止 |
| `contributes` | 可选 | `{ "<扩展点键>": [decl, …] }`——贡献声明的家 |
| `activation` | 可选 | 懒激活事件：`onStartup` / `onStartupFinished` / `onWorkspaceOpen` / `workspaceContains:<glob>` / `onProjectOpen` / `onExport` / `onCommand:<id>` / `onFileOpen:<ext>` / `onFileOpen:mediaType:<type>` / `onPanel:<id>` / `onView:<id>` / `onGenerator:<kind>` / `onBackground:<id>` |
| `background` | 可选 | T2 专用后台任务：`[{ id, intervalSeconds(≥60), runAtStartup? }]`，单插件 ≤4 条；非 privileged 声明即非法 |
| `dependencies` / `optionalDependencies` | 可选 | `Record<插件id, semver range>`；不许依赖自己 |
| `extensionPoints` | 可选 | **自己开的插座**：`[{ id, mode: 'collect'|'single', declSchema? }]`，id 必须 `<你的pluginId>.` 前缀——别的插件就能往里插贡献 |
| `author` / `homepage` / `repository` / `license` | 可选 | repository 与 homepage 分开（详情页两条都显示） |
| `icon` | 可选 | 运行时图标：**插件目录内路径**（断网也要能显示，不收外链） |
| `marketplace` | 可选 | 上架物料：`{ icon?, screenshots? }`——收外链或包内路径 |
| `category` / `order` | 可选 | 设置列表纯展示分组（`workspace` / `ai` / `tools` / `appearance`）与位次 |
| `l10n` / `extensionPack` | 可选 | 本地化目录 / 插件合集 |
| `signature` | 可选 | `{ algorithm: 'ed25519', keyId, value }`——发布侧签名，本地目录装不要求 |

## permissions 取值

| 权限 | 买到什么 |
|---|---|
| `workspace:read` | 读当前频道工作区（T1 经桥读 op；T2 的 `ctx.workspace.list/readText`） |
| `workspace:write` | 写工作区（T1 写 op 另过每 (插件,频道) 一次性同意闸；**恒排除 `.channek` 工程文件**——改工程只能提案 EditTransaction） |
| `project:read` / `project:edit` | 工程读 / 编辑提案 |
| `clipboard:read` / `clipboard:write` | 剪贴板 |
| `shell:openExternal` | 外链 |
| `ai:control` | 控制面接入点（把 app 工具面交给外部模型级别的重权限，安装告示逐条列它） |
| `{ "permission": "net:fetch", "hosts": ["api.example.com"] }` | T2 网络（逐 host 声明） |
| `{ "permission": "capability:invoke", "capabilities": ["channek.image"] }` | 调用已注册能力（逐条点名，不给通配） |

## 校验规则速查（被拒时报的编号）

| 规则 | 管什么 |
|---|---|
| V1 | 结构：manifest 是对象、manifestVersion=1、必填字符串非空 |
| V2 | id 合法性、id=目录名、官方命名空间保留 |
| V3 | version / minAppVersion 是合法 semver |
| V5 | T0（declarative）禁 entries / permissions 等代码面字段 |
| V6 | 代码插件要 apiVersion；T1 要 sandbox 入口；T2 要 apiVersion |
| V7 | workspace scope 的插件必须是 declarative |
| V9 | permissions 数组合法、无未知权限、net 权限形状对 |
| V11 | contributes 是对象、每键的贡献是数组 |
| V12 | 自定义扩展点：id 须 `<pluginId>.` 命名空间、declSchema 是数组 |
| V13 | 命令 id / activation 命令引用须 `<pluginId>.` 命名空间 |
| V14 | dependencies 形状、不许自依赖、range 合法 |
| V15 | 同一 manifest 内既定义又提供能力时，invoke 模板的 `{{input.x}}` 必须都在 definition 的 inputs 里声明过 |
| V16 | plugin.requirement 结构校验（remedy.commandId 必须由本 manifest 贡献、remedy.key 必须是本 manifest 某设置字段、providers 点名必须存在） |

本地校验：`plugin-cli validate`（与商店目录 CI 同一执行体），error 级 = 直接拒收。
