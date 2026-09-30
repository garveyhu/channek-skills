<div align="center">

<h1><img src="https://cdn.archeruuu.com/images/channek/logo-triad.png" height="40" align="top" />&nbsp; Channek Skills</h1>

**让你的 coding agent 说一口流利的 Channek。**

[English](README.md) · **简体中文**

![Agent Skills](https://img.shields.io/badge/agent%20skills-SKILL.md-333333?style=flat-square)
![Skills](https://img.shields.io/badge/skills-2-555555?style=flat-square)
![Contract](https://img.shields.io/badge/contract-generated%20from%20source-005A9C?style=flat-square)
![License](https://img.shields.io/badge/license-Apache--2.0-1A1A1A?style=flat-square)

</div>

---

> ### 文档写给人，这一册写给 AI
> 开发一张 [Channek](https://github.com/garveyhu/Channek) 风格卡或一个插件，人读的是概念与来龙去脉；
> coding agent 要的是另一种东西：可执行的工作流、逐字段的契约表、值得逐字照抄的模板。
> 这个仓库就是那份东西——装上它，你的 agent 在落笔之前就已经懂规矩。

## 都有什么

两个 skill，各管一件事：

| skill | 干什么 | 什么时候醒 |
|---|---|---|
| [`channek-card-dev`](channek-card-dev/SKILL.md) | 写或改一张**风格卡**：`card.json` 逐层过、可移植红线自检、打包 `.channekcard` | 「写一张风格卡」·「做个频道模板」·「把我的频道打包分发」 |
| [`channek-plugin-dev`](channek-plugin-dev/SKILL.md) | 造一个**插件**：选信任级 → manifest → 实现（T1 沙箱 / T2 特权）→ 调试 → 打包发布 | 「写一个 Channek 插件」·「加个主题 / 功能区 / 能力」·「这个功能该插在哪」 |

每个 skill 同一副骨架。`SKILL.md` 是 agent 照着执行的工作流——步骤、取舍、自检清单；
`references/` 是它按需翻开的部分：契约速查（字段表、桥 op 白名单、校验规则）与值得照抄的模板
（三份 manifest、一张完整示例卡、一个零依赖的 T1 入口）。agent 平时只背薄薄一页，
用到哪张表再翻哪张——**这正是 skill 和「把整个文档站灌进上下文」的分别**。

## 安装

### Claude Code

```bash
git clone https://github.com/garveyhu/channek-skills.git
cd channek-skills

# 装进某个项目——推荐：只在开发卡 / 插件的项目里生效
mkdir -p <你的项目>/.claude/skills
for s in channek-card-dev channek-plugin-dev; do
  ln -s "$(pwd)/$s" <你的项目>/.claude/skills/
done

# 或装成全局，所有项目可用
ln -s "$(pwd)/channek-plugin-dev" ~/.claude/skills/
```

不想用软链就把目录整个拷过去；升级就是一次 `git pull`。

### 其它 agent

任何认 [Agent Skills](https://agentskills.io) 约定（`SKILL.md` + YAML frontmatter）的助手都能装：
把 skill 目录放进它的 skills 发现目录即可。每个 skill 连同自己的 `references/` 自包含，离线也完整。

## 契约与 app 同源

会随 app 变的契约表——贡献键、suite 桥 op 白名单、清单校验规则、主题 token、卡字段——**不是手写的**：
它们由 Channek 源码生成，原样同步进各 skill 的 `references/generated/`。skill 正文只引用这些表，
不自己写数字。

动手校验用 app 自带的命令，它和 app 用的是同一份判据：

```bash
channek check <频道目录|卡目录|插件目录>
```

哪天某张表和你装的 app 说法不一，**以 app 的校验器为准——它是唯一会拒绝你的那一方**。欢迎提 issue。

### 维护

```bash
node scripts/sync-contracts.mjs --from <Channek 仓库>          # 同步生成表（加 --check 只检查）
node scripts/check-examples.mjs                               # 用 channek check 校验示例卡
```

两条都绿了再提交。示例卡是被照抄得最多的东西，它不合法，每个照抄的人都踩同一个坑。

## 它在整盘棋里的位置

Channek 的开放面是**格式与协议**：卡格式、插件 manifest、扩展点契约都有公开规范。
开发者文档把它们讲给人听；本仓把它们编成 agent 拿起就能动手的形状。同一套事实源、两种深度——
**看懂去读文档，动手装这里。**

## License

Apache-2.0
