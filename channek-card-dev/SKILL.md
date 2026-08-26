---
name: channek-card-dev
description: 开发、修改、校验并打包一张 Channek 风格卡（card.json / .channekcard）。当用户要「写一张风格卡 / style card」「做一个 Channek 频道模板」「声明出片流程 pipeline」「把频道打包分发 / 一键复刻」「修卡的 requires / layout / presentation」时使用。Use when developing a Channek style card, channel template, or packaging a .channekcard bundle.
---

# Channek 风格卡开发

**风格卡是什么,一句白话**:一张卡描述「这类创作怎么做」——分几步、什么风格、文件放哪、
要用到哪些能力。它像一份菜谱:写清步骤和要用的工具,但菜谱本身不含锅也不含火(卡是纯数据,
永远不含代码;能力由插件提供,卡只声明「我要用哪些」)。

一张卡落到一个文件夹上就是一个频道:**频道 = 文件夹 × 卡**。分发形态是 `.channekcard`
包,收卡人导入后一键复刻整套创作方式。

## 怎么带用户(先读这段)

来找你写卡的多半是**创作者,不是工程师**。守住四条:

1. **说人话**。术语第一次出现给一句白话解释(如「pipeline,就是你从想法到发布的那几步」)。
   用户听不懂不是用户的问题,是你的问题。
2. **一次只问一两个问题**,别一口气抛一张问卷。用户答不上来就给 2~3 个带推荐的选项让他挑
   (「多数口播频道是:选题 → 写稿 → 配音 → 剪辑 → 发布,你也差不多?哪里不一样?」)。
3. **用户说的是想法,不是字段名**。把「我想让我的视频都是那种手绘风」翻译成对应的卡段
   (画风锁 `locks` + 生成默认 `generation`),不要反问他术语。
4. **动手前复述方案**(「你要的是一个 X 频道,流程五步…我准备这样写,对吗?」),确认后再写文件;
   **写完要交代**:每个文件是干嘛的、怎么装进 app 看效果、下一步能做什么。

## 工作流

### 0. 先判断用户要干哪件事

- **从零建一张卡** → 走完整访谈(下一步)。
- **改现有的卡** → 先读他的 card.json,复述你理解的现状,再问要改哪里。
- **把频道打包分发** → 跳到第 6 步,重点过可移植红线。

### 1. 访谈:问清创作系统的形状

四组问题,按顺序聊(不是一次全问),每组给出建议默认值:

| 问什么 | 白话问法 | 答不上来时的默认 |
|---|---|---|
| **流程** | 「从一个想法到发出去,你平时分几步?哪些步想让 AI 自动干,哪些你要亲手做?」 | 五步:选题 → 写稿 → 配音 → 剪辑 → 发布 |
| **风格** | 「有没有固定的品牌色 / 声音 / 字幕样子 / 画风?」 | 全部留空——风格段都是可选的,以后随时补 |
| **目录** | 「你的稿子、成片这些文件,习惯放什么目录结构?」 | 用内核默认布局,不写 `layout` |
| **依赖** | 「哪几步要靠外部能力(出图 / 配音 / 转写 / 发布)?有没有指定想用哪家?」 | 只声明能力不点名插件,由收卡人机器上的候选顶上 |

**新手路线**:只填 5 个必填字段 + 一个三五步的 `pipeline` 就是一张合法的卡——先跑起来,
风格与布局以后再加。不要一上来就把所有段都填满。

### 2. 写 card.json

骨架从 `references/card-template.jsonc` 抄,字段表查 `references/card-schema.md`。要点:

- **顶层必填只有 5 个**:`schema: "channek.stylecard"` · `formatVersion: 2` · `id` · `name` · `slug`。
  其余全部可选;**某段一旦写了,段内引用会被严格校验**(如写了 `voice`,那 `voice.default`
  必须是 `voice.profiles` 里真实存在的一个)。
- `id` 用 `<发布者>.<名字>` 点分小写(如 `acme.talkfast`);`channek.*` 前缀是官方保留,不可用。
- 流程写进 `pipeline`(步序 + 每步配置)、目录写进 `layout`(含工件落点覆盖)、
  界面写进 `presentation`(启用哪些功能区)、依赖写进 `requires`——细则见
  `references/pipeline-and-artifacts.md` 与 `references/requires-and-secrets.md`。

### 3. 先过 schema(机器判 · 最硬的一道闸)

**写完 card.json 的第一件事,是用 app 自己的 zod schema 验一遍,不是用你自己写的检查脚本。**
自写脚本查得了路径引用和可移植红线,查不了字段级的结构合法性——两者不是一回事。

在 Channek 源码仓的 `shared/style-card` 目录下跑(`<CHANNEK_REPO>` 换成本机路径):

```bash
cd <CHANNEK_REPO>/shared/style-card
cat > .validate.tmp.mjs <<'EOF'
import { validateStyleCard } from './src/card-schema/card.schema.ts';
import { readFileSync } from 'node:fs';
const r = validateStyleCard(JSON.parse(readFileSync(process.argv[2], 'utf8')));
if (r.ok) console.log('✅ 通过');
else { console.log(`❌ ${r.issues.length} 条:`); r.issues.forEach(i => console.log(' ·', i.path || '(根)', '→', i.message)); }
EOF
npx tsx .validate.tmp.mjs /绝对路径/风格卡/card.json; rm -f .validate.tmp.mjs
```

**为什么这道闸必须排在最前**:卡不合 schema 时,app 的表现**不是报错,是装作没事**——
频道照常打开,但这张卡进不了卡库,于是频道的卡绑定解析不出来,整条链一路退回「活动卡」
(= 上一个打开过的频道那张卡)。

用户实际看到的症状是这三条:

| 他看到的 | 真实原因 |
|---|---|
| 设置页里画风锁 / 配音 / 字幕全是**别的频道**的内容 | 这张卡没进卡库 |
| 插件区「本频道在用 · 0」,没有任何「这张卡要什么」的提示 | `cardRequiredPlugins` 查回 0 条 |
| 「当前频道」写着本频道名,「风格卡」却写着**别的卡名** | 退回了活动卡 |

**没有一条症状指向「你的卡第 N 行写错了」。** 实测这三条会把人(和 AI)引向
「app 坏了 / 注册表错了 / 窗口状态乱了」,查很久都查不到卡上。跑一次校验,10 秒定位。

**最容易踩的一类**:**可选段一旦写了,段内必填字段一个都不能少**。
「这个段可以不写」≠「段内字段可以不填」。完整清单见 `references/card-schema.md` 的「段内必填」表。

### 4. 过可移植红线(每次保存前自检)

卡要在**别人的机器**上活,所以「只在你这台机器上成立的东西」一律不进卡:

- [ ] **密钥值**不进卡——卡只声明「要哪把钥匙」,钥匙本身由每个用户自己在 app 里填。
- [ ] **本机绝对路径**(`/Users/...`、`C:\...`、`~` 开头)不进卡——别人机器上没有这个路径。
      这类因机而异的配置属于插件设置,不属于卡。
- [ ] `runtime.endpoints` 段**只声明需要哪些端点**,URL / 端口 / 模型路径等真值写了会被
      schema 直接拒(这是校验红线,不是风格建议)。
- [ ] 卡内相对路径不含 `..`、不是绝对路径(防路径逃逸,校验会拒)。
- [ ] 卡目录里**没有可执行代码**——要代码就拆成独立插件,卡用 `requires` 引用它。

### 5. 过流程体检(写完 pipeline 后自查)

- [ ] 每步 `key` 唯一(key 是这一步在这个频道里的名字,进度记账、文件归属都认它)。
- [ ] 引用的步骤 id、工件类型、功能区 id 都真实存在(来自内置或 `requires.plugins` 声明的插件)。
- [ ] 每步要吃的工件,上游有步骤产出它(步骤之间只靠文件衔接——断链在导入时就会被体检报出来,
      不会等用户跑到第 5 步才炸)。
- [ ] 每步 `config` 符合那一步声明的配置结构。
- [ ] `presentation.defaultSection`(若写)必须在 `presentation.sections` 里。

### 6. 交付与验证

**先教用户把卡用起来**(比打包更优先):

1. 在 app 里「新建频道 → 选这张卡」,或把卡应用到他现有的文件夹;
2. 打开频道看灯轨:步骤序和他描述的一致吗?缺插件的步会显示占位卡(「由插件 X 提供 · 未安装」),
   这是正常的诚实降级,不是坏了。

**要分发才做打包**:

- 上架物料写 `meta` 段,市场长文写 `STOREFRONT.md`(规范见 `references/storefront.md`);
- 不想带出门的大资产声明进 `bundle.omit`(带 `reason`,导入时会原样告诉收卡人「这块要你自己补」);
- 导出用 app 的卡导出功能(设置 → 风格卡 → 导出),**绝不手工 zip**——导出器会自动剥掉
  本机路径、按 `requires` 收携带插件;
- 验收标准:在干净机器上导入这张卡包,体检报告正确列出缺插件 / 缺能力 / 缺密钥三张清单,
  补齐后频道可以正常创作。

## 常见判断

| 问题 | 答案 |
|---|---|
| 这个配置放卡里还是插件设置里? | 因机因人而异的(路径、端点、密钥)→ 插件设置;描述创作方式本身的(步序、风格、提示词)→ 卡 |
| 想锁死某家能力提供方不许降级? | `requires.providers[].fallback: false`;缺省是「建议优先,没装就用别家顶上」 |
| 步骤没装会怎样? | 灯轨照常显示 + 占位卡提示装哪个插件;标了 `optional: true` 的步会被跳过——**只降级不崩溃**,但要在 `requires.plugins` 里声明,导入向导才知道引导用户装什么 |
| 提示词放哪? | 卡内 `prompts/` 目录(纯文本),`prompts` 段登记相对路径,步骤配置引用它 |

## References

- `references/card-schema.md`——card.json 全字段表(按层)
- `references/pipeline-and-artifacts.md`——pipeline / layout / 工件契约与解耦原理
- `references/requires-and-secrets.md`——requires 依赖声明、能力偏好链、密钥推导
- `references/card-template.jsonc`——可抄的完整示例卡(口播快剪 6 步频道)
- `references/storefront.md`——meta 段与 STOREFRONT.md 上架规范
