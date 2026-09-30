# 能力体系：把「出图 / 配音 / 转写」做成人人可调的能力

**能力 id 是一张共享词汇表。** `channek.image` 不属于任何插件——谁都可以实现它；卡与调用方按
这个名字要东西，宿主按它排候选链（装了三个出图插件就有三条候选，按序试，每条为什么没用上都
记进 `attempts`）。接口归能力、不归 provider：换一家 provider 不换参数名。

## 两个扩展点

### `capability.definition`——定义一条能力吃什么吐什么（T0 纯数据）

```jsonc
{ "contributes": { "capability.definition": [{
  "id": "channek.tts", "label": "语音合成",
  "inputs": [{ "key": "text", "type": "text", "required": true, "as": "inline|file" },
             { "key": "voiceId", "type": "string", "required": false }],
  "output": { "type": "audio", "formats": ["wav", "mp3"] },
  "turnaround": "brief"        // brief=调完就返回；不声明按 extended（几十秒起）处置
}] } }
```

- id：`<域>.<能力>` 全小写点分；内核能力 `channek.*`，第三方不得占用。
- **诞生条件：说得出至少两个不同实现塞得进这个接口**——只有一个实现的是你插件的私有命令。
- **别重定义别人已定义的能力**——只提供它就行；签名分叉会被记成 `definitionConflicts`。
- `inputs` vs `params` 判据：每次调用会变的 → inputs；装的人配一次的 → params。拿不准放 params
  （params→inputs 是加可选字段，反向是破坏性变更）。
- 已发布能力字段只增不改；破坏性变更新开 id（`channek.tts.v2`）。

### `capability.provider`——提供一条能力（command 形态按契约属 T2）

```jsonc
{ "contributes": { "capability.provider": [{
  "id": "acme.local-tts",              // 卡 prefer、--prefer/--only、设置页归属都引用它；用带前缀的形态
  "label": "本机推理",
  "capabilities": ["channek.tts"],     // 一条 provider 可同时提供多种能力
  "invoke": { … },                     // 四形态之一，见下
  "credentials": [ … ],                // 要哪几把钥匙、注到哪儿
  "traits": { "languages": ["zh"] }    // 静态筛选用；不做运行时能力协商
}] } }
```

## invoke 四形态

### `command`：spawn 子进程（最常用）

```jsonc
"invoke": {
  "kind": "command",
  "program": { "pluginFile": "bin/tts" },     // 三形态见下
  "args": ["--text-file", "{{input.text@file}}", "--model", "{{params.modelPath}}",
           "--out", "{{outputDir}}/tts-{{runId}}.wav"],
  "env": { "ACME_KIT": "{{params.kit}}" },
  "timeoutMs": 600000,
  "result": { "kind": "stdout-json", "okField": "ok", "pathField": "path" }
}
```

- **`args` 恒为数组，永不是 shell 字符串**（值里有引号 / `$` / 反引号——走 shell 就是命令注入）。
  整 token 替换、不经 shell、无 glob 无管道无条件循环；复杂拼参由你的入口脚本承担。
- `program` 三形态，安全等级递减：`{ pluginFile }`（插件目录内，最安全）·
  `{ setting, suffix?, fallback? }`（设置值拼路径；fallback = 留空走 PATH 找该名）·
  `{ lookup }`（裸名走 PATH，最危险，体检会点名）。
- 子进程 cwd 缺省 `~/.channek/plugin-work/<pluginId>/`（不是调用方 cwd）。
- **被 `program` / `cwd` / `env` 引用的设置键必须机器级（scope: user）**；`args` / `body` 里的
  `{{params.*}}` 可以频道级——可执行位置与数据的区分是安全不变量。

### `http`：直接发请求

```jsonc
"invoke": { "kind": "http", "method": "POST", "url": "{{params.endpoint}}/v1/audio",
  "body": { "kind": "json", "template": { "text": "{{input.text}}" } },
  "result": { "kind": "binary", "saveAs": "{{outputDir}}/tts-{{runId}}.wav" } }
```

method 只收 GET/POST/PUT；body.kind = json / form / binary。

### `module` / `host`：离不开 app 的两种

`{ "kind": "module", "requiresApp": true }`——实现是你的 T2 JS，跑在 Extension Host；
`{ "kind": "host", "op": "…" }`——实现在内核，provider 只点名操作。两者对脱机调用方等于不存在
（app 开着时可用）；想进脱机 skill 生态就提供 command / http 形态。

### result 三形态

| kind | 怎么取产物 |
|---|---|
| `stdout-json` | **stdout 末行一行紧凑 JSON**（进度日志走 stderr）；成功 = 退出码 0 **且** `ok: true` 同时成立 |
| `binary` | 响应体存到 `saveAs`（必填） |
| `files-in-outdir` | 按 `glob` 在 outputDir 收产物 |

## 占位符（两期两批人替换）

| 期 | 占位符 | 谁填 |
|---|---|---|
| 装配期（app 写能力目录时） | `{{params.<设置键>}}` `{{pluginDir}}` `{{workspaceRoot}}` | app 主进程 |
| 调用期（真跑那一刻） | `{{input.<key>}}` `{{input.<key>@file}}` `{{outputDir}}` `{{runId}}` `{{tmpDir}}` | 调用方（CLI / 宿主） |

- 认不出的占位符原样保留不替空串——目录里看到还带花括号的 `{{params.x}}` = 那个设置是空的。
- manifest 里声明的字段 `default` 会先落进 params 再物化——没有 default 的必填设置，用户没配
  时你的脚本会收到整串占位符（作者本地配过所以最难自查的坑）。
- 只有标量能进命令行；`@file` 表示调用方把值落成临时文件、替换成路径（长正文防 ARG_MAX）。

## credentials：密钥声明

**值永远不落盘。** 目录里只有句柄与存在性；真值在调用那刻注入本次请求。

```jsonc
"credentials": [
  { "kind": "app-secret", "secretId": "credential.{{params.credential}}", "field": "apiKey",
    "as": { "header": "Authorization", "scheme": "Bearer" } },   // http 用
  { "kind": "env",  "name": "ACME_KEY", "as": { "env": "ACME_KEY" } },  // command 用
  { "kind": "file", "path": "{{params.keysFile}}" }
]
```

- `as` 是注入点：`{ env }` 只对 command 有效、`{ header, scheme? }` 只对 http 有效，写反直接
  校验报错。不给 `as` = 只当存在性前置，内核不注入（声明了 key 却裸发请求换 401 的坑）。
- **禁止**把密钥填进普通设置再 `{{params.apiKey}}` 拼进 env / 认证头——校验按接收方键名
  （`*KEY` / `*TOKEN` / `*SECRET` / `Authorization` 等 + 值带 `{{`）直接拒：那条路会让 app 把
  key 明文物化进 0644 的目录文件。

### 密钥到得了哪、到不了哪（先看这张表再选形态）

这是最容易走错的一步：**密钥只在「调用发生的那一刻」注入调用本身，它不会流到插件代码里。**

| 你在哪写代码 | 拿得到密钥吗 | 为什么 |
|---|---|---|
| `invoke.kind: "command"` 的子进程 | ✅ 走 `as: { env }` 注进环境变量 | 注入点就是为它设的 |
| `invoke.kind: "http"` 的请求 | ✅ 走 `as: { header, scheme? }` | 同上 |
| **T2 host（`entries.main` 里的 Node 代码）** | ❌ **拿不到** | `as` 只有 env / header 两种注入点，没有「交给宿主进程里的模块」这一种 |
| T1 沙箱 | ❌ 拿不到 | 同上，且沙箱本就不该持有密钥 |

配套的两条硬事实，翻源码可核：

- **`credentialRef` 设置字段的值是密钥 id，不是密钥。** 在 host 里 `settings.get('xxxCredential')`
  读到的是一个句柄，直接拿去当 `Authorization` 发出去必然 401。
  出处：`shared/plugin-kit/src/runtime/settings-schema.ts`——「值是密钥 id，不是密钥，真值只在
  特权侧 `resolveCredential` 取得到，插件说得出『用哪把钥匙』、拿不到钥匙本身」。
  `type: "secret"` 同理（「值不进插件设置存储，只经主进程写 OS 钥匙串」）。
- **T2 host 没有调用能力的口。** 能力只能从 T1 沙箱侧发起：`sdk.suite.invokeCapability(id, { inputs })`。
  出处：`frontend/app/src/main/plugin/host-api-gate.ts` 是 T2 的完整 API 面，里面只有
  workspace / project / commands / ui / shell / storage，**没有 capability**。

### 由此推出的形态选择

把上面两条合起来，需求一旦同时包含「要用密钥」和「要编排多步」，架构其实已经被定死了：

```
沙箱（T1）驱动流程                    host（T2）只做沙箱做不到的事
├─ invokeCapability(...)  ← 密钥在这条路的尽头注进子进程
├─ 决定下一步跑什么                   ├─ 起子进程 / 读写文件 / 存盘
└─ 拿结果、渲染                       └─ 把产物读回来给沙箱
```

**别试图在 T2 host 里串一条「调几次能力」的流水线**——那里既拿不到密钥、也调不动能力。
反过来说这个分层是对的：沙箱是 UI 层，本来就该握着「现在跑到哪一步」。

一个配套细节：能力的 `inputs` 是 `Record<string, string>`，**长提示词与图片都要走文件**
（先让 host 把文本落成临时文件，再把路径当 input 传）。命令行塞不下几千字，更塞不下一张图。

## 调用侧：三条会让你算错账的事

### 1. 产物落哪，取决于给不给 `itemId`

```ts
sdk.suite.invokeCapability(id, { itemId?, inputs })
//                               ↑ 可选，而它决定 outputDir
```

| 给 `itemId` | 产物落哪 |
|---|---|
| 给了 | **那条内容条目的目录**（宿主用 `itemDir` 覆盖 `contentDir`） |
| 没给 | app 的运行数据区（`~/Library/Application Support/Channek/…` 一类） |

宿主在兜底那行留了注释：「**它是给 UI 回读逐条结果用的中间产物，不该混进频道目录**」。
所以没有条目可挂的场景（不是在处理某条内容），落兜底目录是对的 ——
**但那里没人替你清**，一次跑十几个中间文件堆着就是垃圾。**读完就删。**

顺带一条**必踩**：沙箱要读回产物，得让 T2 开一个读文件的 rpc；
写路径白名单时别忘了 app 数据区那一处，否则你会被自己那道门拦下来
（症状：`这个路径不在允许读的范围里`）。**报错带上真实路径**，不然只能靠猜。

### 2. `Promise.all` 是假并行 —— 能力调用会排队

日志里长这样：

```
本机正忙：acme.foo 在排队（重活档同时只跑 1 条，前面还有 0 条），已等 18 秒
```

宿主按档位限并发，**重活档同时只跑一条**。所以并排发两次能力调用，
总时间等于串行，只是多了一堆排队日志。算耗时预算时按**串行**算。

### 3. 超时要和宿主对齐，否则「自己掐自己」

三个超时套在一起，写反了会得到一个最诡异的结果 —— 明明能成的调用一次都跑不完：

```
provider.invoke.timeoutMs   宿主给这条能力的总上限
  └─ 你脚本里的单次请求超时     必须 < 上限
       └─ 重试                  重试后的总和也必须 < 上限
```

**真实案例**：脚本单次超时写 300 秒，而那次调用本身要 333 秒 —— 第一次必被自己掐断；
掐断后重试两次，总时长 900+ 秒，又把宿主 600 秒那道闸撞穿。写大反而一次都跑不完。

两条经验：**超时不重试**（超时说明它本来就慢，再跑一次只会把外层闸也撞穿），
只对「还没开始就失败」（连不上 / 5xx）重来一次。

## 三层配置与 params

`params` 由三层合并：user（机器级）< card（卡 pluginSettings）< workspace（频道侧车）。
只有 `ui.settingsSection` 声明过的键落进 params；机器级键在卡层与侧车层一律被剔除（安全边界）。
字段 `scope` 缺省 `'user'`；创作参数（尺寸 / 风格）用 `workspace` + `snapshot: true` 才随卡走。

## 命令行验收

```bash
channek caps                      # 能力在不在、谁提供、就绪徽章
channek cap channek.tts --json    # 这条能力要什么参数（AI 靠它问，SKILL 里别写死参数）
channek invoke channek.tts text=@稿.md --out ./out [--prefer|--only <providerId>] [--dry-run]
channek doctor                    # 卡要求的能力有一条必然失败 → 退 3（可进 CI）
```

`invoke` stdout 末行恒是一行 JSON（`{"ok","path","backend","attempts":[…]}`）；退出码
0 成功 / 1 候选链全败 / 2 用法错 / 3 能力不可用。产出交付物的调用配 `--place <语义id>`
让产物按卡声明的落点归位。

## 自包含铁律

插件必须自带它的实现：脚本用 `{{pluginDir}}/bin/x.py`，**清单里的 default / program 是随插件
分发的值，不许写本机路径**、不许指向宿主机器上的其他资产树。留给用户填的只有三类：
解释器 / 工具路径 · 用户私有资产（模型 / 参考音 / 密钥）· 调参。
插件用法说明（给用户 AI 读的 skill）放 `<插件根>/skills/`，跟插件一起分发。
