# 05 · 脚本层：把「感觉题」变成「能退非零的判定题」

> 一句话概括这一层：**脚本只做一件事——把主观判断变成可判定的退出码，然后诚实地报告自己判不了什么。**

## 先看这个频道有哪些脚本（以及没有哪些）

| 类别 | 数量 | 说明 |
|---|---|---|
| **质检闸 `check_*.py`** | **9** | 绝对主体 |
| 扫描层 / 内部库 | 1 | 被某个闸 import，自带 CLI 用来打回归基准 |
| 复盘 / 账本 | 2 | 在九步之外 |
| 脚手架 `.sh` | 1 | 开题建目录 |
| **读卡助手** | **0** | ← 见下 |
| **渲染 / 混音 / 出图 / 发布脚本** | **0** | ← 见下 |

**两个「0」比那 9 个闸更能说明这套范式。**

- **没有渲染 / 发布脚本**，因为「做一件具体的事」一律是插件能力，经 `channek invoke` 调。
  频道里**一行 ffmpeg 都没有**（除了两个「量」音视频的闸）——这是设计，不是缺失。
- **没有读卡助手**，因为读卡只有两条路（下文），两条都不需要辅助层。

**规模分布也有信息**：最大的闸 2625 行，最小的 84 行。**篇幅 ≈ 那一维判据有多难判对**，
不是 ≈ 那一步有多重要。

## 脚本怎么读卡：四条路，按优先级

### 路 A（首选）· 调用方读、脚本收参数

脚本**不认识 `channek`**，卡值由 skill 文档里的 shell 命令注入，脚本只负责「少一个就骂人」：

```python
ap.add_argument("--ceiling-hz", type=float, required=True,
                help="从卡读：channek card sound.sfxBrightnessCeilingHz")
```

skill 里给完整可粘贴的命令：

```bash
python check_sfx_palette.py <条目目录> \
    --policy <策略文件> --sfx-root <音库根> \
    --ceiling-hz "$(channek card sound.sfxBrightnessCeilingHz)"
```

**`required=True` 且无默认值**——拿不到卡值 = 没有尺子 = 判不了。

### 路 B · 阈值多了走「键=值」流

超过三四个阈值时别堆 flag，走 stdin：

```bash
for k in sceneMaxSec sceneOverLimitMax rhythmCvMin sceneMeanMaxSec …; do
  echo "$k=$(channek card quality.$k)"
done | python check_storyboard.py "$ITEM/<分镜产物>" --thresholds -
```

脚本这一侧**没有默认值，缺一个就抛**：

```python
# 卡里的键名原样用作阈值名——报告里出现哪个名字，就去 `channek card quality.<名字>` 查它。
THRESHOLD_KEYS = ["sceneMaxSec", "sceneOverLimitMax", "rhythmCvMin", …]

def load_thresholds(source):
    """吃 `键=值` 行（`-` = stdin）。**没有默认值**：缺一个就报缺一个。"""
    …
    missing = [k for k in THRESHOLD_KEYS if k not in values]
    if missing:
        raise ValueError("卡里没读到这些阈值：" + "、".join(missing)
                         + "（逐个 channek card quality.<键> 补上）")
```

**「卡里的键名原样当阈值名」是一条关键约定**——它让报告可反查：报告里出现 `sceneMaxSec`，
读的人直接 `channek card quality.sceneMaxSec` 就能查到那把尺子。

### 路 C · 脚本按相对位置自定位 `card.json` 直读

只在「值太多 / 要判来源 / 要做兜底」时用。**靠自己的文件位置反推，不靠 cwd、不靠环境变量**：

```python
def card_path() -> str:
    """脚本住在 <卡>/skills/<skill>/scripts/ —— 卡在往上第三层。"""
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.abspath(os.path.join(here, *([os.pardir] * 3), "card.json"))

def card_number(key: str):
    """卡里那个数值键的原值；卡不在（夹具 / 别处跑）就返 None，别自己编一个。

    原值不许收成整数 —— `keyframesPerSecMin` 是 0.6，取整就成了 0，闸当场变成摆设。
    """
    …

def _fallback(given, key, default):
    """命令行 > 卡 > 脚本默认。三层里只有第一层是调用方的意思，后两层是兜底。"""
```

走这条路时，**脚本默认值的来源必须写进注释**，不许拍脑袋：

```python
# 卡里还没有这三个键时的落点。三个数都是从近期内容实测反推的：
# 空窗 2 秒 = 观众开始觉得「画面卡住了」的量级；密度 0.6 拍/秒 ≈ 一个五分钟片的自然节拍下限；
# 永动位点上限 2 = 允许一个组件带一处氛围微动 + 一处机制性循环，再多就是拿循环填时长。
DEFAULT_MAX_STILL_GAP_SEC = 2.0
```

### 路 D · 阈值写死在脚本 + 文档

只允许在「值本身就是方法论、不是频道参数」时用，且必须标出唯一真相源：

```python
GATES = {"浅引流占比": (0.25, 0.50), …}
# 不过闸 → 退出码 1。闸门值见 <skill>/SKILL.md §6，改闸要连着改那份文档。
```

### 三条硬禁止

- ❌ **脚本里 `subprocess` 调 `channek card`**（这个频道全库零处；`channek` 只在那个 shell 脚手架里出现）
- ❌ 卡值有默认值兜底而不声明来源
- ❌ 把卡里的量互相套用（配速含首尾静音，与分镜估时的纯说话速率是两个量）

## 一个「手抄卡值就算不合格」的设计

字幕闸有一条极值得抄的规则：**不指 `--card` 恒退非零。**

```python
# 有一项不是从卡读来的（覆盖或补空），这一轮量的就不再是卡；
# 「与卡一致」这句话此时是假的 —— 卡里那个键可能压根没有值。
spec_label = "卡" if card_path and not overrides and not gap_fills else "生效规格"
failed = bool(warns or overrides or gap_fills) or card_path is None
```

docstring 给的理由：

> 手抄一遍卡里的值，本身就是又一跳可以抄错的地方——抄错了闸照样全绿，因为它只知道你告诉它的规格。
> **守卫不能比它守的那条路更松**：`--card` 加单项覆盖会退非零，把 `--card` 整个删掉就绿灯，
> 那这道闸绕过去只要少打一个参数。所以**绿灯只有一条路：指着卡跑**。

## 退出码约定

| 码 | 含义 |
|---|---|
| **0** | 机器维度全过 —— **但报告仍要说清哪几维没跑 / 被软化** |
| **1** | 有 WARN 待复核（`[REVIEW]`）；也用于「输入读不了」这类温和失败 |
| **2** | 硬闸 `[FAIL]`（渲了也白渲）**或** 判不了（拿不到阈值 / 产物不存在 / 依赖缺失） |

共同点是 **「2 = 别往下走」**。

底层原则一句话：**「检不了」不等于「检过了」。** 某一项跑不出来记 FAIL，不记 PASS。

> ⚠️ 这套码**与 `channek invoke` 的码不是一回事**（那边是 `0 ok / 1 调用失败 / 2 用法错误 /
> 3 能力不可用`）。闸的码是闸自己的契约。

## 报告格式：五层结构契约

```
① 抬头行：  == <闸名> · <规模统计> ==
② 可选：    生效规格 / 规格来源 / 日期门声明（哪几条被软化）
③ 维度行：  「两空格 + <图标> [<维度名>] <说明·必须带数、带阈值、带修法>」
            图标只有四个：✅ PASS · ℹ️ NOTE · ⚠️ WARN · 🔴 FAIL
④ 分隔块：  ── 脚本查不了 —— 你必须自己过 ──   （HUMAN_CHECKS，逐条 □）
⑤ 判决行：  [PASS] / [REVIEW] / [FAIL] + 为什么 + 这一轮跑了几维
```

真实输出（截取）：

```
== 分镜体检 · 15 内容镜 / 16 总镜 @ 30fps · 总长 229s ==
  ✅ [节奏起伏] CV=0.23（镜长有起伏）
  ⚠️  [真材料到位] <条目>/素材/真材料 里一张真材料都没有 —— 历史每片 1~3 张。旁白讲到有 URL /
      有唯一标识 / 有日期主体 / 观众能自己复现的东西，就该截图（SKILL.md §7）
  ✅ [图标名] payload 里的图标名都在真表里

── 脚本查不了 —— 你必须自己过（别指望机器替你勾）──
  □ 两测：静音看得懂机制吗？把画面换个概念还成立吗（成立 = 通用容器 = 装饰）？
  □ 一镜一 signature moment，其余克制留白？

[REVIEW] 3 项机器维度没过（见 ⚠️）。此处改 > 渲完返工。
```

### 每条 WARN 必须带三件东西：实测数 · 阈值 · 怎么修

```
❌ 反例： ⚠️ [节奏起伏] 节奏不好
✅ 正例： ⚠️ [节奏起伏] 镜长变异系数 CV=0.14<0.18 = 节奏单调（镜长都差不多·缺张弛）→ 长短交替制造呼吸
```

能定位就定位到行（`SomeComponent.tsx:215` / `scenes[6](某镜)` / `#12(15字宽「…」)`）；
列表要截顶（`[:8] + '…'`）。

### 绿灯也要自曝边界

```
[PASS] 7/9 维跑过且全过，但这不等于「机器维度全过」：
  · 1 项因日期门只提示不拦（样式落地）：这条内容早于生效日，**退出码不覆盖它们**
  · 9 维里这一轮只跑了 7 维，没跑的是：断句凭据（没给 --refined）；文本真相（没给 --acts）
  · 抽帧看画面仍须作者亲核
```

**这是全套报告纪律里最独特的一条。** 一个不说自己跑了几维的 PASS，读的人只会当「全过了」。

### 报告格式本身是被消费的契约

复盘账本对账器靠正则反向索引闸里的维度名，判断「踩坑账里写的反哺去向指得到实体吗」：

```python
for m in re.finditer(r'return \(\s*"([^"]{2,12})"', body):      idx["dim"].add(m.group(1))
for m in re.finditer(r'\[\s*([一-鿿]{2,8})\s*\]', body):        idx["dim"].add(m.group(1))
# 维度还有第二个名字：函数名。销账时写 `still_gap` 比写「拍点空窗」自然，
# 索引不收它就会把刚销的账重报成「记了没修」（本脚本自己踩过）。
for m in re.finditer(r"^def check_([a-z0-9_]+)", body, re.M):   idx["dim"].add(m.group(1))
```

**「维度名 = 判据函数返回的三元组第一格 = 报告方括号里那个词 = 踩坑账能点名的实体」，四者是同一个字符串。**

## HUMAN_CHECKS：机器判不了的，原样列出来、绝不替你勾

```python
print("\n── 脚本查不了 —— 你必须自己过（别指望机器替你勾）──")
for item in HUMAN_CHECKS:
    print(f"  □ {item}")
```

设计原则（写在闸的 docstring 里）：

> 脚本只查「能客观跑数」的项，且**从不假装能判画面好不好**。……
> 它会在报告末尾把它们列成「脚本查不了、你必须自己过」的清单，**绝不替你勾**。

`HUMAN_CHECKS` 同时是踩坑账的**三种归宿之一**（见 06）——机器判不了的坑（遮挡 / 语感 / 审美）
不是没归宿，它进这个清单，于是每次跑那道闸都会被自动打印出来提醒。

## 两个「判不了 ≠ 有问题」的处理

**① 读不出来的不定罪**：

```python
# 时序表达式读出来不到这个比例，三条读数一律不判。
# 覆盖率漏读会**偏低**、空窗漏读会**偏高**，两个方向都朝着定罪走 —— 只解出 1/28
# 还敢报「2% 覆盖率」，那不是判断，是拿读不出来当证据。
TIMING_READ_RATIO_MIN = 0.5
```

判不了的会被**单列成一份必须有人看的名单**：

```
── 闸判不了的 N 个组件 —— 这几个只能你自己过 ──
  □ SomeComponent（xx.tsx）：28 处时序只解出 3 处 → 覆盖率 / 空窗 / 密度三条对它一个数都没报
     （读不出来不等于没问题，也不等于有问题。闸不拿读不出来定罪，
       所以这份名单必须有人看 —— 混在尾注里等于没报）
```

**② 依赖缺了是「判不了」不是崩溃**：

```python
try:
    import numpy as np
    from PIL import Image
except ImportError:
    print("⚠️ 需要 numpy 与 Pillow", file=sys.stderr)
    return 2                       # ← 不是 crash，是「判不了」
```

## 日期门：质量标准可以持续加严而不产生历史债

```python
# 这几条是后装的，只管新片；旧内容早于卡里的生效日就只报不拦。
DATE_GATED_DIMENSIONS = ("静止空窗", "关键帧密度", "永动周期", "字阶", "垂直分区")
GATE_SINCE_DATE_KEY = "quality.gateSinceDate"

def item_date(path):
    """内容项目录名前六位就是它的日期。

    从产物往上找第一个这样命名的目录；找不到（夹具、临时目录）就返 None ——
    没有日期的一律按新片走，不能让「认不出日期」变成一张免检卡。
    """

def soften_new_gates(findings, made, since):
    """旧内容不重新烘焙，新装的闸在它们身上只报不拦。

    钉红一堆不会重跑的历史内容，只会让人对红色麻木 —— 那时真红了也没人看。
    """
```

## 命名与放置

| 类别 | 规则 | 例 |
|---|---|---|
| 质检闸 | `check_<被检对象单数>.py` | `check_storyboard.py` |
| 扫描层 / 内部库 | `<名词>_<角色>.py`，**不带 `check_` 前缀** | `band_tracker.py` |
| 数据 / 账本 | `<域>_<动作>.py` | `review_data.py` `reconcile_ledger.py` |
| 脚手架 | kebab-case `.sh` | `new-entry.sh` |
| 判据函数 | `def check_<维度英文>(…)` → 返 `(维度中文名, 档位, 说明)` | → `("节奏起伏", "PASS", …)` |
| 阈值常量 | 卡键名大写化 `DEFAULT_<卡键的大写下划线形>` | `quality.maxStillGapSec` → `DEFAULT_MAX_STILL_GAP_SEC` |
| 命令行 flag | 卡键的 kebab-case | `quality.animCoverageMin` → `--anim-coverage-min` |
| 人工清单 | 模块级常量 `HUMAN_CHECKS` | 四个大闸统一用这个名字 |

```
风格卡/scripts/<脚手架>.sh                      卡级、跨步的工具
风格卡/skills/<skill>/scripts/check_<x>.py      某一步的闸，跟着那个 skill 走
风格卡/skills/<skill>/scripts/<lib>.py          只给这个 skill 用的扫描层
风格卡/skills/<skill>/scripts/fixtures/<场景>/  反向验证夹具
风格卡/skills/<skill>/<baseline>.json           历史欠账豁免名单
```

**铁律：脚本永远住在它所服务的那个 skill 里。** 一个闸被别的 skill 当判官用时，
那边**跨 skill 引用它的路径，不复制一份**。

## 可移植性：七条落实手段

顶层原则（卡的 README）：

> **没有第四套。** 出现「某个脚本按固定名去扫某个目录」这种硬约定，
> 就是在卡之外又建了一份真相源——换一张目录结构不同的卡时它会**静默失灵**。

1. **路径走参数**，help 里只写语义 id（`channek.storyboard`），不写文件名。
2. **频道根靠自定位**：`Path(__file__).resolve().parents[N]`，不靠 cwd / 环境变量 / 绝对路径。
3. **shell 脚本从卡推目录，不抄一份**：
   ```sh
   # 目录名**不写在这个脚本里**——从卡自己的 `layout.artifacts` 推。卡改了目录约定，
   # 这里自动跟上；抄一份在脚本里就是第二个真相源，迟早对不上。
   ```
   而且**不引 jq**（「agent 的终端里有没有它不好说」），扁平 JSON 用 `sed` 取值即可；
   还做了路径逃逸防护：`case "$pattern" in /* | *..*) continue ;; esac`
4. **零第三方为默认**：11 个 Python 里 8 个纯标准库。
5. **外部二进制只有 ffmpeg/ffprobe**，且只出现在两个「必须量真音频 / 真视频」的闸里——
   **不为了干活调 ffmpeg**（干活走 `channek invoke`），**只为了量**。
6. **同目录 import 保证任何 cwd 都能跑**：`sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))`
7. **文件读写显式 `encoding="utf-8"`**（中文路径 + 中文内容的必要习惯）；CSV 用 `utf-8-sig`。

> **诚实记录**：这个频道自己也有几个脚本违反了上面第 1、2 条——硬编码了中文目录名
> （`内容/3-内容工作台`、`配音/音乐音效/palette.json`）。同类需求的合规写法是从卡的
> `layout.sections` / `layout.contentDir` 读。**照抄这套范式时抄合规的那几个，别抄这几个。**

## 注释纪律：每道闸的 docstring 要回答「为什么这道闸在这里」

而且**要拿具体事故当依据**：

```python
"""音线体检 —— 把「听着不舒服」从耳朵题变成量得出的判定题。

为什么这道闸在这里：卡的 `sound.sfxBrightnessCeilingHz` 写着 4000Hz、`sound.vibe` 写着
「谱质心压在 4kHz 以下」，但**没有任何一步在量它**。结果是用户耳测点名两个音效不舒服 ——
一查，那两件正是全库最亮的一档（6480Hz / 7693Hz），超卡自己写的上限 62% 和 92%。
**规范只写在文档里、闸里没有，就等于没有。**
"""
```

数值型红线要写来源：

```python
CONTENT_BOTTOM_MAX = 830   # 内容元素底边红线（基线三个组件实测 827/830/830）
WEIGHT_LADDER = (500, 700, 900)   # 来自 25 条历史内容 1886 处字重：96.3% 落在这三档
```

**已知盲点要写出来，不许假装覆盖了**：

```python
# 已知漏报（写在这里，别当成覆盖到了）：
#    · transform: translateY(...) 的位移不跟踪
#    · flex 列方向叠加撑出来的高度估不出来（所以它只是软判）
```

## 装闸的两步验收

**装一维新判据不是「写完跑一遍新片全绿」就算装好了。** 完整规约见
[04-methodology.md](04-methodology.md#_shared装闸契约md给闸加判据的元规约)，这里只提最关键的物证：

`fixtures/` 目录下按**病名**建的反例夹具，每组是一个「应该被报出来的坏东西」的最小样本：

```
fixtures/水时长/     淡入+淡出的假货：装闸前七维全绿、退出码 0
fixtures/刷闸/       十三行死变量把 17.8s 空窗刷成 2.0s；改名/格式化能不能掀掉闸
fixtures/抖满整镜/   有界循环接力铺满镜长
fixtures/铺满/       真·逐拍铺满（**阴性对照**）
```

以及扫描层文件尾部的 `CALIBRATION` 注释块——把三组真实语料的读数钉死，接进闸后必须复现：

```python
# ① 某条内容（16 个组件）· 开 --props → 12 WARN / 2 NOTE
# ② 范例库五个基线组件 → 0 WARN / 0 NOTE（**必须恒为 0，是最硬的回归线**）
# ③ 历史全量（383 个文件）→ 55 WARN / 28 NOTE。
#    这是**历史欠账，不是误报** —— 抽验 10 条逐个读源码核对，全部为真阳性…
#    所以**必须接进 DATE_GATED_DIMENSIONS**
```

## 自检

- [ ] 频道里**没有渲染 / 混音 / 出图 / 发布脚本**（那些是能力的活）
- [ ] 没有任何脚本 `subprocess` 调 `channek`
- [ ] 每个闸的每个阈值都能追到卡里的一个键，且脚本不带默认值（或默认值写了来源）
- [ ] 每个闸都有 `HUMAN_CHECKS` 尾块（凡机器判不了语义的）
- [ ] 每条 WARN 都带了实测数 + 阈值 + 修法
- [ ] PASS 的判决行说清了这一轮跑了几维、软化了几条
- [ ] 判不了的（依赖缺 / 读不出）退非零或单列名单，**没有被折叠成通过**
- [ ] 每个闸的 docstring 写了「为什么这道闸在这里」，带具体事故
- [ ] 新装的每一维都有反例夹具，且跑基线组件恒 0 报
