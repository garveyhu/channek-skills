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
