# 信任三级：T0 / T1 / T2

| 级 | `trust` | 形态 | 跑在哪 | 信任本质 |
|---|---|---|---|---|
| **T0 声明级** | `declarative` | 纯 JSON / SVG / 字体，manifest 禁代码入口 | 只被读取 | 数据即载荷；宿主对注入面做白名单封堵 |
| **T1 沙箱级** | `sandboxed` | manifest + 沙箱 UI 入口（html） | 跨源沙箱 iframe（`plugin://<插件id>`，每插件一个 origin）+ MessagePort 桥 | **有真实运行时隔离**：能力面 = 桥消息白名单，权限是宿主硬强制 |
| **T2 特权级** | `privileged` | manifest + `main` 入口（可同时带 `sandbox` UI 入口） | Extension Host（独立 Node 进程） | **等同完全本机信任**：进程内是完整 Node，权限清单是安装前知情同意与审计面、**不是运行时沙箱**。安装 T2 插件即信任其作者 |

一句话：**T1 是一个被关起来的网页，T2 是一个没有界面的后台进程。** 它们与 app 之间只能传消息
——不共享代码，不共享内存。

## 各级能承载什么

- **T0**：`ui.theme` / `ui.iconTheme` / 文件类型关联 / `ui.command`·`ui.menu`·`ui.keybinding` 声明 /
  `ui.settingsSection` schema / `workspace.styleCard` / `media.exportPreset` / 自定义扩展点的声明贡献。
- **T1 UI 承载面**：`ui.fileViewer` / `ui.panel` / `ui.suiteSection`（整页功能区）/
  `ui.contentStep`（内容步工作台）/ `editor.panel`。沙箱页有 DOM / canvas / WebGPU / WebCodecs /
  原生 localStorage·IndexedDB；没有 fs / spawn / 父页面 DOM。
- **T2**：全部逻辑侧扩展点（`capability.provider` 的 command 形态按契约要求 T2、
  `publish.platform`、后台任务…）。T2 有 fs / spawn / net / 任意 npm 包；**没有 DOM**——
  它的界面仍是沙箱 iframe（`SandboxFrame` 渲染 iframe 时不看 trust，特权永不传染给界面）。

## 选级判据（防「什么都上 T2」）

分级不是能力天花板，是「用户要交出多少信任」：

| | T1 的权限 | T2 的权限 |
|---|---|---|
| `workspace:read` 是什么 | 宿主替它做事、做之前真的查 | 一份知情披露 |
| 能绕过吗 | 不能（iframe 里除桥无出口） | 能（`require('fs')` 即绕过） |

三档数据判据：

1. **app 打开工作区时本来就已加载 / 已授权的数据**（素材索引、内容条目与详情、卡声明、
   运营台账、管线状态、工件 capability URL）→ T1 经 suite 桥拿得到——插件读它 ≡ app 自己读它。
2. **app 不知道的事**（读工作区外文件、跑外部程序、连第三方服务、任意本机计算）→ 归 T2，
   让用户知情同意。
3. **通用逃逸口**（读任意路径 / exec / 转发任意 IPC）→ 永不给 T1——一开 T1 就等于
   「没有隔离的 T2」。

所以：只做界面 + 读写频道数据 → T1 足够；真需要后台逻辑（重扫描 / 网络 / 长任务 / spawn）
才升 T2——且推荐形态是「UI 留 T1 沙箱页 + 逻辑在 T2 host，页面经 rpc 桥调自己的后端」。

## 三条铁则（宿主侧执行，写插件时对齐预期）

1. **信任只升不降**：能力来自 loader 等级而非 manifest 自称；没开闸的等级只标 incompatible，
   绝不静默降级运行。
2. **第一方无特权**：内置与第三方同一条校验 / 注册 / 启停路径。
3. **`channek.*` 命名空间保留**：外置目录里出现即 error。

## 来源 scope

| scope | 位置 | 允许 trust |
|---|---|---|
| `builtin` | 随 app 分发 | 全部 |
| `user` | `~/.channek/plugins/<id>/`（目录本身可以是 symlink——本地开发一等公民） | 全部 |
| `workspace` | `<工作区>/.channek/plugins/<id>/` | **永远仅 T0**，且默认不装载、过工作区信任门——工作区可能来自网盘 / git，克隆仓库 ≠ 同意执行代码 |

## T2 运行时要点

- 入口 ABI：`exports.activate(ctx)` 必有；`deactivate` / `onUpdate(from, to, ctx)` 可选。
  **CJS 单文件**（`.cjs`；TS + ESM 随你写，打包 `format: 'cjs'` 输出）。
- 「注册」发生两次：manifest 贡献注册在装载时（不跑你的代码）；`ctx.register*` 实现注册在
  激活事件触发时（可能几小时后）——这是装几十个插件不拖慢启动的原因。activate 有 10 秒超时。
- 入口路径两道门：不许绝对路径；realpath 后必须仍在插件根内（软链逃逸被拒）。
- 多频道身份：T2 全 app 只有一份实例，「当前是哪个频道」没有唯一答案——按频道分数据一律用
  **调用带来的那个身份**（rpc / 命令由宿主盖章注入），别自己记「当前频道」单值。
- 你经 host 调命令时宿主会盖 `caller: 'plugin'` + 你的 pluginId 的调用章（身份宿主认，不认自报）。
