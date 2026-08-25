# requires 依赖声明与密钥推导

`requires` 段回答「复刻这张卡还需要装什么、配什么」——它是「一键复刻频道」能否成立的关键。

## 结构

```jsonc
"requires": {
  "app": ">=0.4.0",                       // app 版本门
  "providers": [                           // 能力 + 偏好链
    {
      "capability": "channek.tts",         // 要哪条能力（共享词汇表 id，不绑实现）
      "prefer": ["acme.voxcpm-local"],     // 优先用哪几家 provider（有序）
      "fallback": false,                   // 可选：false = 钉死，点名之外的候选不许顶上
      "plugins": ["acme.voice-lab"],       // 装哪个插件能得到 prefer 里那些 provider（装任一即满足）
      "reason": "频道音色按这家调过"        // 给收卡人看的一句话
    },
    { "capability": "channek.image", "prefer": ["acme.draw-local"] }
  ],
  "plugins": [                             // 非 provider 类额外依赖（如第三方步骤 / 功能区插件）
    { "id": "acme.review-gate", "optional": true }
  ],
  "secrets": ["llm.anthropic"]             // 作者显式补充的密钥声明（见下）
}
```

## 五条关键语义

1. **provider 按「能力 + 偏好链」声明，不死绑实现。** 卡说「要有 TTS 且优先我用的这家」；
   收卡人没装那家时按候选链顺延（`fallback` 缺省 = 顶得上）。写 `fallback: false` 才是钉死——
   宁可这次出不来也不换家，用于「换一家出来的质感就不对」的场景（如调过音色的 TTS）。
2. **`plugins` 字段说「去哪儿拿」。** 只写 prefer 时，缺件只能报成「本机用别的顶上」；
   写了 plugins，导入向导才能给出「装这个插件」的一键引导。
3. **步骤依赖不必手写**：pipeline 引用的非内置 `step` id 由导入器自动推导为插件依赖。
4. **密钥清单主体也不手写**：「跑这条能力要哪几把钥匙」是 provider 的知识——最终清单 =
   （卡点名的能力 → 提供它的候选 → 候选的 credentials 声明）自动推导 ∪ `requires.secrets`
   手写补充。手写那份只用于「不属于任何 provider 的钥匙」。手打全量清单与插件实际读什么
   之间没有机制保证一致，漂移出的假绿灯比报缺更糟。
5. **运行时选路只认 `requires.providers[].prefer` + 本机插件设置**；`runtime.providers` 段是
   展示与装卡引导（记录作者实际用的 provider / 模型 / 参数），不参与选路——让它参与等于把
   作者机器的状态焊进别人的频道。

## 端点与机器特定配置：为什么不进卡

- `runtime.endpoints` **只声明需要**（`{ id, capability }`），端点真值（URL / 端口 / 模型路径）
  写进卡会被 schema 直接拒。真值住收卡人自己的插件设置。
- 同理，卡里声明本机路径没有意义（别人机器上不存在，还泄露你的目录结构）；声明
  「要这个能力 + 装这个插件」才有意义。机器特定配置属于**那个插件的设置**，不属于卡。
- 例外通道：插件设置字段声明了 `snapshot: true` 的**创作参数**（如出图尺寸）可经卡的
  `pluginSettings` 随卡分发；机器级键（scope: user）在卡层一律被剔除——这是安全边界
  （防导入的卡把本机请求指到别处），不是体验取舍。

## 导入侧会发生什么（帮作者校准预期）

收卡人导入 `.channekcard` 时：容器安检 → 卡 schema 校验 + 迁移 + PipelineLinter 静态体检
（卡非法 → 整包终止）→ **依赖体检三张清单**（缺步骤插件 / 缺 provider / 缺密钥——不阻塞导入）
→ 逐项同意安装携带的插件（各过各的信任门；包内 T1/T2 插件必须有有效签名，无签名拒装、T0 纯
数据免签）→ 建频道（按 layout 脚手架）→ 频道就绪度徽标：缺件标「未就绪」+ 每项给引导
（装插件 / 设置页补 key）。

所以：`requires` 写得越准，收卡人的引导越顺；写漏的依赖不会炸，但会变成「灰掉的步 +
没人解释的缺件」。
