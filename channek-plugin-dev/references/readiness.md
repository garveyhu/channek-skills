# plugin.requirement：前置就绪声明（装了 ≠ 能用）

插件声明「它需要机器上有什么、怎么探测、缺了怎么办」。一条声明四处消费：插件设置页就绪卡 ·
插件列表徽章 · `channek caps` 候选标注 · 卡体检。**不声明的后果**：你的 provider 在所有体检面
上是「未验」（`undeclared`），不是绿灯——没人说过的东西不许当成安全。

## 声明形状

```jsonc
"contributes": { "plugin.requirement": [{
  "id": "torch-env",
  "label": "torch 运行环境",
  "description": "本机推理靠它；装在哪个 venv 由下面的解释器设置回答。",
  "severity": "required",              // required(缺省) | optional(缺了只掉档) | byo(等用户自接)
  "providers": ["acme.draw-local"],    // 点名 = 只对这几条候选是硬前置；缺省 = 对整个插件
  "probe": { "kind": "command",
             "program": { "setting": "pythonRoot", "suffix": "bin/python" },
             "args": ["-c", "import torch"] },
  "remedy": { "kind": "setting", "key": "pythonRoot" }
}] }
```

## probe 三形态（判据必须可执行，不能是一句说明文字）

| 形态 | 用在 | 说明 |
|---|---|---|
| `command` | 「装了但功能缺失」 | program 复用能力调用的三形态；缺省判退出码 0，`expect.stdoutContains` 给「命令在但没编译进某特性」用 |
| `path` | 「东西在不在那儿」 | `from` 取自设置项、PATH 或 `pluginFile`（插件目录内相对路径）；`expect` 可要求文件 / 目录 |
| `machine` | 「这台机器扛不扛得住」 | `minMemoryGb` / `minCpuCount` / `arch` / `platform`——声明**下限**不是推荐值 |

探测不是调用：只问存在性，不产工件不落盘；缺省 8 秒超时、上限 30 秒（设置页打开时会跑，慢就卡页）。
已知限制：probe 没有 `env`（要递设置值只能经 args）；`lookup` 的结论是「对这个宿主而言」
（CLI 与 app 的 PATH 可能不同）——能探设置项就别探 PATH。

## remedy 四形态（按可自动化程度递降）

| 形态 | 语义 |
|---|---|
| `component` | 宿主自己能装上（**作者不许手写**——当前只由内核替有 npm 依赖的 T2 插件自动补） |
| `action` | 插件自己能装：`{ commandId, buttonLabel }`——commandId 必须由本 manifest 的 `ui.command` 贡献，否则装载即拒 |
| `setting` | 东西在机器上、只是没告诉 app 在哪：`{ key }`——必须是本 manifest 某设置字段 |
| `manual` | 只能人工准备：`{ steps: […], docUrl? }` |

## 三态与归并

探测结果三态：`ready`（探过通过）/ `missing`（确定没满足——探过没过，**或设置项还空着**）/
`unknown`（问不出答案：超时、探测崩了、引用解析不出）。插件级归并：`undeclared` →
`needs-setup`（必需项缺）→ `unknown` → `degraded`（可选项缺）→ `ready`。
**`unknown` / `undeclared` 绝不许折叠进 `ready`**——把「我不知道」渲染成绿灯，机制就退化回
「把声明当能力报」。

severity 作用域：点了 `providers` 就是「对那几条候选而言」——候选级缺了是 `needs-setup`
（选路必须跳过它），插件级最多 `degraded`（还有别的候选，说「插件坏了」是撒谎）。
**正确写法是标 `required` 并点名 provider**，别拿 optional 去迁就徽章颜色。

`byo`（bring-your-own）档给「永远指着用户自己的东西」的前置（自己的脚本 / 自训音色 / 私有服务）：
候选级没接同 required（跳过），插件级**一个色都不染**——空缺是常态不是缺陷。边界：只有
「东西不存在于任何人的机器上、除非用户自己造」才配这档；人人要装的解释器标 byo 是把
「没配好」伪装成「正常」。

## npm 依赖（内核替你补的那条）

`node_modules` 不随包分发（解包侧会整包拒）。插件目录有非空 `dependencies` 时，宿主自动补一条
`channek.node-deps` 前置：探 `node_modules` 在不在，remedy 是一颗「就地安装」按钮——宿主读你的
`package-lock.json`，用 app 自带 node 逐包下载、校 SRI、解包进插件目录（不跑 npm 生命周期脚本）。
**所以：有依赖就必须把 `package-lock.json` 打进包**；没有它宿主装不了（不会去 registry 解 semver）。
要自定义就自己声明一条 id 为 `channek.node-deps` 的前置，内核让位。

## 什么不该做成 requirement

- **凭据不是 requirement**——密钥走 `capability.provider` 的 `credentials`（值永不落盘）。
  要探「这把钥匙能不能用」，写一条点名 provider 的前置，密钥由宿主按 `as` 注进探测子进程。
- **「所有用户都一样」的东西不是 requirement**——那是插件该自带的（`{{pluginDir}}/…`）。
- **运行期失败不是 requirement**——前置回答「能不能开始」，不回答「这次跑成没有」。
