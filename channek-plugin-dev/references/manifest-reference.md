# manifest.json 字段参考

契约类型：`@channek/plugin-kit`（`PluginManifest`）。编辑器补全：manifest 首行加
`"$schema": "https://cdn.channek.com/libs/channek/plugin-manifest.schema.json"`
（schema 随 `@channek/plugin-kit` 发布，装了这个包也可以指向 `node_modules/@channek/plugin-kit/schema/plugin-manifest.schema.json`）。
npm 上的 schema 可能比 app 晚一拍（比如还不认识新加的字段），**以 `channek check <插件目录>` 为准**。

## 字段表

| 字段 | 必填 | 说明 |
|---|---|---|
| `manifestVersion` | ✅ | 恒为 `1` |
| `id` | ✅ | `<publisher>.<name>`，正则 `^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+$`；**与目录名一致**；`channek.` 保留官方 |
| `name` | ✅ | 显示名；不得含「Channek」字样冒充官方 |
| `version` | ✅ | semver |
| `description` | ✅ | 清单列表里那一行（一句话说「装了它能做什么」） |
| `minAppVersion` | ✅ | 低于此版本的 app 标 incompatible。写你真正测过的版本（当前 app `0.1.1`），别凭感觉写高 |
| `trust` | ✅ | `declarative`（T0）/ `sandboxed`（T1）/ `privileged`（T2） |
| `apiVersion` | T1/T2 ✅ | 恒为 `"1"`；T0 禁止 |
| `entries` | 视级 | `{ sandbox?: "dist/xx.html", main?: "dist/main.cjs" }`；T0 禁止；T1 必有 sandbox；插件目录内相对路径（绝对路径 / 逃出插件根被拒） |
| `permissions` | 可选 | 见下；T0 禁止 |
| `contributes` | 可选 | `{ "<扩展点键>": [decl, …] }`——贡献声明的家 |
| `channelConfig` | 可选 | **插件要的频道参数**：`[{ id, name, group?, hint?, fields }]`。频道卡的 `config` 里用插件段 `{ id, plugin, values }` 只存值，字段定义只在这里有一份。见下方「channelConfig」 |
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
| V9 | permissions 数组合法、无未知权限、net 权限形状对 |
| V11 | contributes 是对象、每键的贡献是数组 |
| V12 | 自定义扩展点：id 须 `<pluginId>.` 命名空间、declSchema 是数组 |
| V13 | 命令 id / activation 命令引用须 `<pluginId>.` 命名空间 |
| V14 | dependencies 形状、不许自依赖、range 合法 |
| V15 | 同一 manifest 内既定义又提供能力时，invoke 模板的 `{{input.x}}` 必须都在 definition 的 inputs 里声明过 |
| V16 | plugin.requirement 结构校验（remedy.commandId 必须由本 manifest 贡献、remedy.key 必须是本 manifest 某设置字段、providers 点名必须存在） |
| V17 | `channelConfig` 结构：段 id 合法且不重复、字段类型八选一、select 选项非空不重复、number 的 min ≤ max、默认值合类型、不许 `valueFrom` |

本地校验：`channek check <插件目录>`（与 app 装插件、上架安检同一份 `validateManifest`），error 级 = 直接拒收。

## channelConfig：插件声明自己要读的频道参数

频道参数（画幅、字幕规范、音色、发布账号……）住在频道卡的 `config` 里。**由插件读的那几段，字段定义写在插件清单里**，
卡里只存值——插件一升级，字段定义跟着插件走，不会和卡里抄的一份漂开。

```jsonc
"channelConfig": [
  {
    "id": "captions",                 // 段 id：字母开头，可带点（quality.voice）；完整键的前缀
    "name": "字幕",
    "group": "style",                 // style / rules / advanced 三选一，缺省 style
    "fields": [
      { "key": "maxLines", "name": "最多几行", "type": "number", "value": 2, "min": 1, "max": 3 },
      { "key": "stroke", "name": "描边", "type": "select", "value": "soft",
        "options": [{ "value": "none", "label": "无" }, { "value": "soft", "label": "柔和" }] },
      { "key": "highlight", "name": "关键词高亮", "type": "boolean", "value": true }
    ]
  }
]
```

频道卡里对应的插件段（段 id 照抄、`plugin` 写你的插件 id、只写值；没写的键按这里的 `value` 补默认）：

```jsonc
{ "id": "captions", "plugin": "acme.production", "values": { "maxLines": 2, "stroke": "soft" } }
```

- 字段类型八种：`text` / `number` / `boolean` / `select` / `color`（只收 hex）/ `fileRef`（频道内相对路径）/
  `directory`（本机目录，值永不入卡）/ `list`（字符串数组）。字段上的 `value` 在这里是**默认值**。
- `valueFrom`（长文本外置）只给卡里的作者段用，插件清单里写了就是 V17 错误——长默认值直接写进 `value`。
- 字段可带 `ask: { example? }`（用卡开频道时要问的题）、`brief: false`（不渲进 AGENTS.md）、`required`、`hint`。
- **完整键 = 段 id + `.` + 短键**（`captions.maxLines`）。插件读值走桥 `card.config`（`sdk.suite.cardConfig(keys?)`），
  缺的键宿主已按你的默认值补上；agent 与脚本用 `channek card captions.maxLines`。
- 插件已装时 `channek check <频道>` 与 app 按这份声明校验卡里的值（类型、选项、范围；声明之外的键报警告）；
  插件没装时那一段只读显示、照常进 AGENTS.md。
- `channelConfig` 与 `ui.settingsSection` 分工：前者是**这个频道取什么值**（随卡走、进 AGENTS.md、谁都能读）；
  后者是插件自己的设置页（机器级路径、端点、内部调参，`scope` / `snapshot` 决定随不随卡）。


## 设置字段的隐性必填

渲染层那道校验（`frontend/ui/src/extensions/points/settingsSection.point.ts`）比字段表严：

- **`type: "string"` 的 `default` 必须是 string —— 缺席也算违规**
  （报 `string field default must be a string`）。不想给默认值就写 `""`。
  `boolean` 同理，必须是 boolean。
- `endpoint` 标记只能挂在 string 字段上。
- `secret` / `credentialRef` / `action` / `embed` **不承载值**，别指望从设置里读出东西来。

## `shell` 权限到底能干什么

`shell:openExternal` 给到的只有一个方法，而且**只放 http/https**：

```ts
shell: { openExternal: (url: string) => Promise<void> }   // host-api-gate.ts
```

给它 `file://` 会被当场回绝（`URL scheme rejected: file:`）—— 这限制是对的，
一个能让插件开任意本地文件的口子，威胁面比看上去大。

要打开本机文件（比如自己刚生成的产物），**T2 自己 spawn 系统的打开命令**：
`open`（macOS）/ `cmd /c start`（Windows）/ `xdg-open`（Linux）。
T2 本来就有 spawn，不额外扩权限面。
