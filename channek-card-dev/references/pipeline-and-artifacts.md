# pipeline / layout / 工件契约

三个机制合力让「流程 × 结构」都可换：卡声明流程（引用步 id）→ 步骤经**类型化工件**解耦 →
目录路径经**布局**解析。步骤实现互不相识，只对工件契约编程。

## 1. pipeline 段

```jsonc
"pipeline": {
  "template": "channek.explainer-9",        // 可选：继承一个 production.template 的步序
  "steps": [                                 // 有序数组；给出则整体覆盖 template 步序
    { "key": "topic",   "step": "channek.topic" },
    { "key": "script",  "step": "channek.script",
      "config": { "systemPromptRef": "prompts/script.md" } },
    { "key": "review",  "step": "acme.review-gate", "optional": true },   // 第三方步
    { "key": "edit",    "step": "channek.edit" },                          // 内核剪辑步
    { "key": "publish", "step": "channek.publish",
      "config": { "platforms": ["bilibili"] } }
  ]
}
```

| 字段 | 语义 |
|---|---|
| `key` | 本频道内**此步实例**的稳定标识——工件归属、进度记账、灯轨锚点都用它。同一步定义可在一条 pipeline 出现多次（不同 key） |
| `step` | 步**定义** id，在扩展点注册表解析（`production.step` 自动化面 / `ui.contentStep` 工作台面，同 id 关联为一步两面，至少命中一面） |
| `config` | 按步 decl 的 `configSchema` 在导入 / 保存卡时静态校验 |
| `optional` | true = 步缺件或跳过时 Runner 记 skipped 继续；否则停在该步等输入 |

要点：

- **真实顺序 = steps 数组序**。步 decl 里的 `order` 只是模板编辑器的排序建议。
- **缺步只降级不崩溃**：解析不到 `step` id → 灯轨照常显示该步 + 工作台位置渲染占位卡
  （「此步由插件 X 提供 · 未安装」+ 安装引导）。
- `channek.edit` 是内核步（进剪辑器的闸门），永远可用、不可被第三方替换。
- 无 `pipeline` 段的旧卡自动落模板 `channek.explainer-9`（由官方出片插件提供步序；
  没装提供方时卡体检如实报「模板未注册」）。

## 2. 工件（artifact kind）：步骤间唯一的衔接契约

每种工件是一条 `workspace.artifactKind` 声明：

```ts
{ kind: 'acme.shotlist',            // '<ns>.<name>' 命名空间防冒充
  label: '分镜表',
  storage: { pattern: 'shotlist.json', format: 'json' },  // 条目目录内相对 glob（可被卡覆盖）
  schema?: …,                       // json 类工件的结构校验
  viewer?: 'acme.shotlist-viewer' } // 关联文件查看器（可选）
```

- **内核只自带两个与创作域无关的 kind**：`channek.entry`（条目清单，默认 `entry.md`——
  frontmatter 状态机，承载 status / step / blocker / 发布 url 回填）与 `channek.project`
  （工程文件，默认 `project/{slug}.channek`）。口播稿 / 分镜 / 母版这类**创作域工件由贡献
  对应步骤的插件声明**，卡按 `requires.plugins` 带上依赖。
- 步 decl 用 `consumes` / `consumesOptional` / `produces`（ArtifactKind id 数组）声明输入输出；
  linter 静态校验每步 consumes 有上游覆盖、无环。
- **写权限 = 声明即边界**：步的读 ⊆ consumes ∪ produces，写仅限 produces 解析出的路径。
  `.channek` 工程文件恒不在任何步的可写集——改工程只能提案 EditTransaction。
- 进度灯轨从**工件存在性 + mtime 新鲜度**静态推导（诚实灯轨），不信内存标志。

## 3. layout 段：目录结构由卡回答

内核不认识任何具体文件名，只认语义 id；「某个 kind 落在哪」由 layout 解析：

```jsonc
"layout": {
  "preset": "channek.default",              // 内核默认骨架：contentDir=content · entryDirName={date}-{slug}
  "contentDir": "episodes",                  // 条目容器目录（相对频道根）——唯一扫描路径，改了内容就失联
  "entryDirName": "{date}-{slug}",           // 新条目目录命名模板
  "sections": [{ "id": "intel", "path": "intel" }],          // 辅助区（情报 / 选题 / 复盘…）
  "artifacts": { "acme.master": "final/master.mp4" },        // kind → 落点覆盖（唯一写位置）
  "artifactAlsoRead": { "acme.master": ["母版/master.mp4"] }, // kind → 备用读位置（老频道换新卡的过渡面）
  "detect": { "anyOf": ["episodes"] }        // 「这个目录像不像本卡的频道」探测线索
}
```

- 覆盖顺序：kind 默认 `storage.pattern` ← preset ← 卡 `layout.artifacts` 逐 kind 覆盖。
- 想脱离 preset 独立分发的卡，把 `detect` / `artifactAlsoRead` 写进卡自己——只靠 preset
  声明的话，preset 展开后这两样会丢。
- 建频道脚手架按 layout `mkdir` 骨架 + 从卡拷随卡资源（prompts / 素材种子）。

## 4. 为什么这样设计（给用户解释时用）

- **单一真相源**：灯轨、Runner、进度推导、依赖体检读同一份 pipeline + artifactKind 声明，
  没有第二处流程定义可漂移。
- **静态可校验**：断链 / 缺件 / 非法 config 在导入卡时暴露，不是运行时炸。
- **换任何一步不影响其它步**：步骤互不相识，只对工件编程。
- 同构先例：pipeline-in-data ≈ GitHub Actions 引用 action id；工件 DAG ≈ Make/Bazel 目标依赖；
  layout profile ≈ VS Code workspace 配置。
