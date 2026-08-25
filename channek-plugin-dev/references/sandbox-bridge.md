# T1 沙箱运行时与 suite 桥

## 运行时事实（写 T1 页面前要知道的）

- 你的页面跑在 `<iframe sandbox="allow-scripts allow-same-origin">`，文档 origin =
  `plugin://<你的插件 id>`（每插件一个 origin，插件之间、与宿主之间全部跨源隔离）。
- **CSP `script-src plugin://<你的 id>`，不含 `'unsafe-inline'`**：内联 `<script>` 一行不跑
  （症状极具迷惑性——HTML/CSS 照常渲染，页面停在初始文本，看着像宿主没发 init）。
  js/css 必须外部文件；从 CDN 引 `<script>` 会被当场挡掉，一切依赖打进自己的 bundle。
- `localStorage` / `sessionStorage` / IndexedDB **原生可用**（origin 是你自己的）。SDK 的
  `installWebStorage()` 只为一件事：`{ scope: 'workspace' }` 按频道分身存储。
- 沙箱页照样能开 WebGPU / WebCodecs / canvas——限制的是「访问别人的东西」，不是「自己画」。
- 唯一数据通道是宿主握手时递来的 `MessagePort`：页面先 `window.parent.postMessage({type:'ready'},'*')`，
  宿主回 `init` 消息 +（`event.ports[0]`）端口；之后全走 port。SDK 把这些封好了：

```ts
import { createSandboxSdk, suiteContextFromInit, SuiteBridgeError } from '@channek/sandbox-sdk';

const sdk = createSandboxSdk();
sdk.onInit(async init => {
  const context = suiteContextFromInit(init);   // null = 非 suite 承载面
  if (!context || context.workspaceId === null) return;
  const overview = await sdk.suite.assetsOverview();
  render(overview);
});
```

- 读 op 应答的精确 DTO 从 `@channek/ipc-contract` **类型层** `import type`（运行时保持零依赖）。
- 错误分支认 `SuiteBridgeError.code`（`unknown-op` / `not-a-suite` / `response-too-large` /
  `permission-denied` / `consent-required` / `timeout` / `invalid-payload` / `rate-limited` /
  `host-error`），别 parse 文案——文案不冻结，码才冻结。
- 素材图片 / 视频**不过桥**：读应答里的 `channek-media:` capability URL 直接 `<img>`/`<video>`
  加载（URL 不可外携，插件停用即失效）。
- 主题 token 由 init 注入 + `theme:changed` 事件更新；SDK 会帮你应用到 CSS 变量。

## suite 桥 op 全表（封闭白名单，34 条）

不在表里的 op 一律 `unknown-op`；通用逃逸口（读任意路径 / exec / 转发任意 IPC）永不进表。
标 ✍ 的是**写 op**：需 `workspace:write` 权限 + 每 (插件, 频道) 一次性同意闸
（首写得 `consent-required` 并弹确认，允许后长期有效、详情页可撤销）。

### 读数据（`workspace:read`）

| op | 说明 |
|---|---|
| `workspace.info` | 当前频道信息 |
| `content.list` / `content.detail` | 内容条目列表 / 详情 |
| `content.readFile` | 读这条内容目录里的工件正文 |
| `card.active` | 活动卡声明（只读投影） |
| `card.brandAssets` | 卡品牌资产 |
| `assets.overview` | 素材概览 |
| `operations.snapshot` | 运营快照 |
| `pipeline.status` | 进度灯轨状态 |
| `artifact.urls` / `artifact.mediaUrl` | 工件 capability URL（批量 / 单个） |
| `publish.platforms` | 已注册发布平台目录 |

### 导航与宿主动作（免权限，宿主逐条校验实参防钓鱼）

| op | 说明 |
|---|---|
| `shell.openContent` | 打开一条内容（itemId 必须命中条目索引） |
| `shell.openSection` | 切到一个功能区（sectionId 必须 ∈ 活动卡启用区集） |
| `shell.openArtifact` | 把这条内容的一份产物交给 app 文件工作台 |
| `shell.openPublishedUrl` | 系统浏览器打开**这条内容已回填的**作品链接（宿主与自己记录的 url 对账，递别的 URL 一律拒；https-only） |
| `clipboard.writeText` | 剪贴板（需 `clipboard:write`；≤32KiB、≤10 次/分，SDK 本地先限流） |

### 写与动作 ✍

| op | 说明 |
|---|---|
| `content.createEntry` ✍ | 建一条内容 |
| `content.writeFile` ✍ | 写这条内容目录里的工件 |
| `operations.saveBacklog` ✍ / `operations.updateField` ✍ | 运营台账（revision 乐观并发，冲突刷新快照重试） |
| `content.generateImages` ✍ / `content.regenerateCover` ✍ | 跑一次出图 / 封面（画风锁、尺寸、端点由宿主注入——插件只说「画什么」） |
| `card.kickoff` | 从卡发起创作 |
| `card.updateSoundMeta` ✍ | 改活动卡声音库里某条 wav 的说明卡（卡 id 宿主注入） |
| `publish.autoFill` ✍ / `publish.backfillLinks` ✍ | 半自动发布预填 / 回填（去哪个网站由 T2 平台 provider 写死，插件指定不了目的地） |
| `capability.invoke` ✍ | 调一条已注册能力（manifest 逐条点名 `capability:invoke` 白名单；file 类入参由宿主解析注入） |
| `pipeline.acknowledgeStale` ✍ / `pipeline.acknowledgeAllStale` ✍ / `pipeline.revokeStaleAcknowledgement` ✍ | 灯轨过期确认三件套（应答恒为重算后的整条灯轨） |

### 场景（依赖 `generation.preview` 贡献者）

| op | 说明 |
|---|---|
| `scene.preview` | 为这条内容烘一次场景预览，拿回一次性 `plugin://<grant>/index.html`（只能 iframe 显示） |
| `scene.bakeClip` | 把一镜烘成无声 mp4，回可播放授权 URL（配原生 `<video controls>`） |
| `scene.export` | 把一镜烘成 mp4 另存到用户挑的位置（原生保存框；用户取消回 `false`，不是错误） |

## 限额

- 写请求单条 ≤256KiB；读应答 ≤1MiB（超限 `response-too-large`，大清单在 iframe 内自己虚拟滚动）。
- suite / rpc / storage 共享每分钟消息总闸；剪贴板独立门（32KiB / 10 次每分）。
- **桥不是搬运带**：大数据走 capability URL，或「T2 侧持有 + rpc 分页取」。

## T1 → 自己的 T2（rpc）

同一条隧道、不同消息 type：页面 `rpc:request` → 宿主 → 主进程 → **只路由到同插件的**
Extension Host（`ctx.registerSandboxRequest(method, handler)` 接）。`method` 名自定，宿主不解释
payload、只做搬运与限额。**纯 T1 插件调 rpc 恒失败**（没有 T2 可路由）；跨插件调用不存在——
插件间协作走 `capability.invoke`。
