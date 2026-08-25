# suite 桥 op 全表（T1 沙箱插件的宿主能力面）

共 **34** 条，**封闭白名单**——不在表里的方法一律 `unknown-op`；通用逃逸口（读任意路径 /
执行命令 / 转发任意 IPC）**永不进表**。准入原则：凡 app 打开这个工作区时**本来就已加载 /
已授权**的数据，都该让 T1 读到（插件读它 ≡ app 自己读它，同一份用户授权）。

权限图例：R = `workspace:read`；**W** = `workspace:write` + 每 (插件, 频道) 一次性同意闸
（首写回 `consent-required` 并弹确认，允许后长期有效，插件详情页可撤销）；C = `clipboard:write`；
— = 免权限（宿主逐条校验实参防钓鱼）。

| # | op | 权限 | 一句话 |
|---|---|---|---|
| 1 | `workspace.info` | R | 当前频道信息 |
| 2 | `content.list` | R | 内容条目列表 |
| 3 | `content.detail` | R | 条目详情 |
| 4 | `content.readFile` | R | 读这条内容目录里的工件正文 |
| 5 | `content.createEntry` | **W** | 建一条内容 |
| 6 | `content.writeFile` | **W** | 写这条内容目录里的工件 |
| 7 | `content.generateImages` | **W** | 为这条内容跑一次画面素材出图（画风锁 / 尺寸 / 端点由宿主注入） |
| 8 | `content.regenerateCover` | **W** | 重出三尺寸封面 |
| 9 | `card.active` | R | 活动卡声明（只读投影） |
| 10 | `card.brandAssets` | R | 卡品牌资产 |
| 11 | `card.kickoff` | R | 从卡发起创作 |
| 12 | `card.updateSoundMeta` | **W** | 改活动卡声音库某条 wav 的说明卡（卡 id 宿主注入） |
| 13 | `assets.overview` | R | 素材概览（应答 ≤1MiB，超限提示分页） |
| 14 | `operations.snapshot` | R | 运营快照 |
| 15 | `operations.saveBacklog` | **W** | 存选题库（revision 乐观并发） |
| 16 | `operations.updateField` | **W** | 改台账字段 |
| 17 | `pipeline.status` | R | 进度灯轨状态 |
| 18 | `pipeline.acknowledgeStale` | **W** | 「这次的过期我认了」：认下一步 |
| 19 | `pipeline.acknowledgeAllStale` | **W** | 一键认下整条 |
| 20 | `pipeline.revokeStaleAcknowledgement` | **W** | 反悔（应答恒为重算后的整条灯轨） |
| 21 | `artifact.urls` | R | 条目工件 capability URL（批量） |
| 22 | `artifact.mediaUrl` | R | 单个产物懒铸 capability URL |
| 23 | `publish.platforms` | R | 已注册发布平台目录 |
| 24 | `publish.autoFill` | **W** | 半自动发布预填（目的地由 T2 平台 provider 写死，插件指定不了） |
| 25 | `publish.backfillLinks` | **W** | 回填作品链接 |
| 26 | `shell.openContent` | — | 打开一条内容（itemId 必须命中条目索引） |
| 27 | `shell.openSection` | — | 切功能区（sectionId 必须 ∈ 活动卡启用区集） |
| 28 | `shell.openArtifact` | — | 把这条内容的一份产物交给 app 文件工作台 |
| 29 | `shell.openPublishedUrl` | — | 系统浏览器打开**已回填的**作品链接（与宿主记录对账，https-only） |
| 30 | `clipboard.writeText` | C | 剪贴板（≤32KiB · ≤10 次/分） |
| 31 | `scene.preview` | R | 烘一次场景预览，回一次性 grant URL（只能 iframe 显示） |
| 32 | `scene.bakeClip` | R | 把一镜烘成无声 mp4，回可播放授权 URL |
| 33 | `scene.export` | R | 把一镜烘成 mp4 走原生另存框（用户取消回 `false`，不是错误） |
| 34 | `capability.invoke` | **W** | 调一条已注册能力（manifest `capability:invoke` 逐条点名；file 类入参由宿主解析注入，插件给的值丢弃） |

## 限额与错误码

- 写请求单条 ≤256KiB；读应答 ≤1MiB（`response-too-large`）。suite / rpc / storage 共享每分钟
  消息总闸。素材图片视频不过桥——用应答里的 `channek-media:` capability URL 直接加载。
- 错误认 `SuiteBridgeError.code`：`unknown-op` / `not-a-suite` / `response-too-large` /
  `permission-denied` / `consent-required` / `timeout` / `invalid-payload` / `rate-limited` /
  `host-error`。文案不冻结，码才冻结。

## 表里没有你要的？

1. 数据能靠自己的 T2 算出来（读文件 / 跑命令 / 调 API）→ 走 T2 + `rpc:request`（同插件路由）。
2. 是「调别的插件的本事」→ 走 `capability.invoke`（注册能力 id，不用动内核）。
3. 是「只有宿主做得了的事」且 app 本来就已加载这份数据 → 这属于值得向官方提的新 op；
   在那之前如实告诉用户「T1 现在拿不到」。
