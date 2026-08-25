---
name: channek-plugin-dev
description: 开发一个 Channek 插件：按需求路由到扩展点与信任级（T0 声明 / T1 沙箱 / T2 特权），写 manifest，实现沙箱页或 Extension Host 代码，声明能力 provider 与前置就绪，本地调试并打包发布 .channekplugin。当用户要「写一个 Channek 插件」「给 Channek 加主题 / 图标 / 面板 / 功能区 / 查看器 / 出图 / TTS / 转写 / 发布平台能力」「接一条 capability」「打包发布插件」时使用。Use when developing, debugging, or publishing a Channek plugin.
---

# Channek 插件开发

**插件是什么,一句白话**:Channek 本体是个壳子,几乎所有看得见摸得着的功能都是插进去的。
一个插件 = 一个文件夹,里面一份 `manifest.json`(说明书:我叫什么、我贡献什么、我要什么权限)
加上资源或代码。官方插件和你写的插件走**完全同一条**校验、注册、启停路径——没有后门。

心智模型:**扩展点是插座,manifest 是说明书,registry 是配电盘,loader 是安检门——
安检门分三级信任(T0 / T1 / T2,下面会解释)。**

## 怎么带用户(先读这段)

来写插件的用户水平差异极大,先摸底再动手:

1. **先听想法,再翻译**。让用户用自己的话说「想让 Channek 多做什么」,你来对照第 1 步的
   路由表翻译成扩展点——不要反问他「你要贡献哪个 point」。
2. **问三个摸底问题**(一次一个):① 这个功能给自己用还是要发布给别人?② 你写不写代码?
   不写也完全能做(见「零代码路线」);③ 功能要不要碰网络 / 本机文件 / 外部程序?
   (这决定信任级。)
3. **给方案再动手**:告诉用户「你要的是 X,我建议做成 Y 级的 Z 插件,因为…」,确认后再写文件。
4. **说人话**:每个术语第一次出现给一句白话(如「T1 沙箱,意思是你的界面代码被关在一个
   隔离的小房间里跑,只能通过白名单跟 app 说话——所以用户装它不用担心安全」)。
5. **写完要交代**:怎么装进 app 验证(第 5 步)、改了怎么热重载、发布要做什么。

## 工作流

### 1. 按「要做什么」选形态

三级信任,一句话版:**T0 = 纯声明零代码,装了绝对安全;T1 = 界面代码关在沙箱里跑,权限是
硬隔离;T2 = 真代码真权限,装它等于信任作者**。选级原则:**够用就低**——「显示个列表」就上
T2 是生态灾难。

| 你要做的 | 扩展点 | 信任级 | 实现形态 |
|---|---|---|---|
| 主题 / 图标集 / 导出预设 / 卡模板 | `ui.theme` / `ui.iconTheme` / `media.exportPreset` / `workspace.styleCard` | **T0** | 纯 manifest,零代码 |
| 文件查看器 / 面板 / 整页功能区 / 内容步工作台 | `ui.fileViewer` / `ui.panel` / `ui.suiteSection` / `ui.contentStep` | **T1** | 沙箱 iframe 里的网页(HTML+JS 自包含) |
| 出图 / 配音 / 转写 / 转码等**能力** | `capability.provider`(+ 可选 `capability.definition`) | **T2** | 声明式 command/http 调用(可以一行 JS 都没有),或宿主进程里的模块 |
| 发布平台 / 后台逻辑 / 读写工作区外的东西 | `publish.platform` / 自定义 | **T2** | Extension Host(Node 进程)`main.cjs` |
| 命令 / 菜单 / 快捷键 | `ui.command` / `ui.menu` / `ui.keybinding` | T0 声明 + T1/T2 实现 | |

**零代码路线(推荐新手从这里进)**——这三种一行代码都不用写:

1. **主题 / 图标集**(T0):一份 manifest + 一堆颜色 token 或 SVG;
2. **导出预设**(T0):声明容器 / 编码 / 码率;
3. **声明式能力**(T2 但无代码):把本机脚本或云 API 用 `invoke: { kind: "command" | "http" }`
   模板接成一条能力(如「调我自己的出图脚本」),见 `references/capability-provider.md`。

一个提醒:app 已经加载过的数据(内容条目、卡声明、素材索引、管线状态…),T1 经 suite 桥
都拿得到——别因为「要读数据」就误上 T2。桥能给什么查 `references/sandbox-bridge.md`;
三级的完整边界见 `references/trust-tiers.md`。

### 2. 写 manifest

字段表见 `references/manifest-reference.md`;可抄骨架在 `references/templates/`
(T0 主题 / T1 功能区 / T2 能力各一份)。铁规:

- `id` = `<发布者>.<名字>` 点分小写,**与目录名一致**;`channek.` 前缀保留官方。
- T0(`trust: "declarative"`)的 manifest 里出现 `entries` / `permissions` 即校验失败。
- T1 要 `apiVersion: "1"` + `entries.sandbox`;T2 要 `apiVersion` +(有代码时)`entries.main`。
- 权限按需最小化;命令 id 必须带 `<pluginId>.` 前缀。
- `description` 是插件市场里用户看到的那一行:说「装了它我能做什么」,不说实现细节。

### 3. 实现

- **T1 沙箱页**:`npm i @channek/sandbox-sdk`(零依赖),**必须打进你自己的 bundle**——
  沙箱的安全策略只放行你自己域内的外部 js/css 文件,内联 `<script>` 和外部 CDN 一律不跑。
  数据 / 导航 / 剪贴板全走桥的白名单操作;图片视频用应答里给的专用 URL 直接 `<img>/<video>`
  加载。模板见 `references/templates/t1-entry-template/`。
- **T2 Extension Host**:入口必须导出 `activate(ctx)`,**产物必须是单文件 CJS**(`.cjs`)。
  `ctx` 提供读写工作区文件、网络请求(都要声明权限)、存储、注册命令等。注意:T2 没有界面,
  它的 UI 仍然是 T1 沙箱页,两边用桥通话。
- **能力 provider**:多数「本机脚本 / 云 API」型能力不用写 JS——manifest 里声明 invoke
  模板即可,见 `references/capability-provider.md`。

### 4. 声明「我需要什么才能跑」

插件依赖机器上的东西(某个程序 / 模型 / 足够内存)时,声明 `plugin.requirement`
(一条可执行的探测 + 装不上时给用户的补救指引)。不声明的话,你的能力在 app 的体检面上
永远是「未验证」而不是绿灯——**「声明了」不等于「能用了」,让 app 替你证明**。
见 `references/readiness.md`。有 npm 依赖时把 `package-lock.json` 放进包里,宿主靠它替用户一键装。

### 5. 本地调试

```bash
ln -s <你的开发目录> ~/.channek/plugins/<manifest.id>   # 软链是受支持的一等开发流
```

然后:设置 → 第三方插件 → 重新扫描 → 启用。manifest 与资源改动会自动热重载。排错速查:

| 症状 | 先查 |
|---|---|
| 列表里没有 | 目录名 = manifest.id?manifest 是合法 JSON? |
| 红标 error | 点开看逐条校验错误(id 不合法 / T0 带了 entries / …) |
| 灰 incompatible | `minAppVersion` 过高,或在工作区 scope 里声明了 T1/T2(那里只许 T0) |
| 页面停在初始文本 | **脚本内联在 html 里了**——安全策略不放行内联脚本,HTML 照常渲染但脚本不跑,改成外部 js 文件 |
| 行为不对 | 插件详情页「日志」(最近 200 条)+ 权限拒绝计数 |

### 6. 打包与分发

- 用 **`channek plugin pack <插件目录>`** 打包,**绝不手工 zip**——pack 会按与安装侧同一份
  黑名单剥掉 `.git*` / `node_modules` / 疑似密钥;手工 zip 哪怕夹带一个 `.gitignore`,
  都会在用户机器上被安装侧整包拒收,而你收不到任何报错。
- 两条分发路:**独立分发**(用户导入 / 商店,通用能力走这条)与**随卡捎带**
  (`.channekcard` 包的 `plugins/` 里,复刻频道走这条;包内 T1/T2 必须有有效签名)。
- 上架硬规则与流程见 `references/packaging-and-publish.md`。

## 自检清单(提交前逐条过)

- [ ] id 点分小写且与目录名一致;不含 `channek.` 前缀;展示名不冒充官方
- [ ] 信任级选到了**够用的最低档**;权限按需最小化
- [ ] T0 无 entries / permissions;T1 脚本全部外部文件、SDK 打进 bundle
- [ ] T2 入口是单文件 CJS、导出 activate;入口用相对路径(绝对路径被拒)
- [ ] 设置项的 `default` / `program` 没有任何本机绝对路径;「所有用户都一样」的东西自带在包里
      (`{{pluginDir}}/...`),只把「因机因人而异」的三类留给用户填:工具路径 · 私有资产 · 调参
- [ ] 密钥走 `credentials` 声明(值永不落盘),不走普通设置拼进 env / header
- [ ] 声明了 `plugin.requirement` 探测;有 npm 依赖时带 `package-lock.json`
- [ ] 命令写了 `description` / `keywords`——否则 app 内的 AI 按用户的说法搜不到你的命令
- [ ] 用 `channek caps` / `channek doctor` 验过:能力列出、徽章就绪、`channek invoke` 真跑通

## References

- `references/manifest-reference.md`——manifest 全字段 + 校验规则速查
- `references/trust-tiers.md`——T0/T1/T2 各自能干什么、安全边界、选级判据
- `references/sandbox-bridge.md`——T1 沙箱运行时、suite 桥操作全表、限额与错误码
- `references/capability-provider.md`——能力体系:定义 / 供货 / 调用形态 / 占位符 / 密钥 / CLI
- `references/readiness.md`——plugin.requirement 前置声明与三态就绪
- `references/packaging-and-publish.md`——pack / 签名 / 命名空间 / 上架规则
- `references/templates/`——manifest 三份骨架 + T1 入口页最小模板
