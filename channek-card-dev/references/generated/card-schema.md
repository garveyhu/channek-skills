<!-- 同步自 Channek 仓库 docs/plugin/reference/card-schema.md（由源码生成）。勿手改：跑 scripts/sync-contracts.mjs -->
<!-- 此文件由 pnpm gen:card-ref 生成，请勿手改。 -->
# 卡字段表（card.json）

由 `@channek/style-card` 的 `styleCardSchema` 直接生成，**和 app 读卡时用的是同一份判据**。
写完卡用 `channek check <频道或卡目录>` 验一遍：它报的字段路径就是这张表里的路径。

## 缺一个就读不通的字段（共 5 个）

「必填」只在父级存在时才生效；这里列的是**整条链都必填**的——一张最小的卡恰好只要这些。

| 字段路径 | | 类型 / 取值 |
|---|---|---|
| `schema` | 必填 | `"channek.stylecard"` |
| `formatVersion` | 必填 | `2` |
| `id` | 必填 | string |
| `name` | 必填 | string |
| `slug` | 必填 | string |

## 写了某一段，就必须写全的字段（共 90 个）

这是手写卡最常踩的坑：段本身可选，写了一半就读不通。例如写了 `identity.format`，
它下面的三个枚举就都得有；写了 `brand.tokens`，它下面六项就都得有。

| 字段路径 | | 类型 / 取值 |
|---|---|---|
| `identity.format` | 必填 | object |
| `identity.format.orientation` | 必填 | `landscape` / `portrait` / `square` |
| `identity.format.persona` | 必填 | `none` / `avatar` / `real` |
| `identity.format.captions` | 必填 | `sentence` / `word` / `none` |
| `brand.tokens` | 必填 | object |
| `brand.tokens.colors` | 必填 | { [键]: string } |
| `brand.tokens.accent` | 必填 | string |
| `brand.tokens.fonts` | 必填 | object |
| `brand.tokens.fonts.display` | 必填 | string[] |
| `brand.tokens.fonts.body` | 必填 | string[] |
| `brand.tokens.fonts.mono` | 必填 | string[] |
| `brand.tokens.stroke` | 必填 | number |
| `brand.tokens.radius` | 必填 | number |
| `brand.tokens.grid` | 必填 | number |
| `brand.mascot.name` | 必填 | string |
| `locks.visualStyle` | 必填 | object |
| `locks.visualStyle.backend` | 必填 | string |
| `locks.visualStyle.imagePrompt` | 必填 | string |
| `locks.motionSound` | 必填 | object |
| `locks.motionSound.sound` | 必填 | object |
| `locks.motionSound.sound.bgm` | 必填 | object |
| `locks.motionSound.sound.bgm.enabled` | 必填 | boolean |
| `locks.motionSound.sound.sfx` | 必填 | object |
| `locks.motionSound.sound.sonicLogo.enabled` | 必填 | boolean |
| `locks.motionSound.sound.intro.enabled` | 必填 | boolean |
| `voice.default` | 必填 | string |
| `voice.profiles` | 必填 | { [键]: object } |
| `voice.profiles.<键>` | 必填 | object |
| `voice.profiles.<键>.engine` | 必填 | string |
| `captions.highlight` | 必填 | boolean |
| `captions.maxLines` | 必填 | integer |
| `captions.wordsPerLine` | 必填 | integer |
| `captions.stroke` | 必填 | `none` / `soft` / `hard` / `pill` |
| `cover.config` | 必填 | string |
| `audio.bed` | 必填 | object |
| `audio.bed.enabled` | 必填 | boolean |
| `libraries.sound` | 必填 | object[] |
| `libraries.sound[]` | 必填 | object |
| `libraries.sound[].key` | 必填 | string |
| `libraries.sound[].path` | 必填 | string |
| `libraries.asset` | 必填 | object[] |
| `libraries.asset[]` | 必填 | object |
| `libraries.asset[].key` | 必填 | string |
| `libraries.asset[].path` | 必填 | string |
| `libraries.scenes` | 必填 | object[] |
| `libraries.scenes[]` | 必填 | object |
| `libraries.scenes[].key` | 必填 | string |
| `libraries.scenes[].path` | 必填 | string |
| `libraries.reusable[]` | 必填 | object |
| `libraries.reusable[].key` | 必填 | string |
| `libraries.reusable[].path` | 必填 | string |
| `generation.canvas.width` | 必填 | integer |
| `generation.canvas.height` | 必填 | integer |
| `freeze.visualTokens` | 必填 | boolean |
| `freeze.voice` | 必填 | boolean |
| `freeze.visualStyle` | 必填 | boolean |
| `platforms.<键>` | 必填 | object |
| `platforms.<键>.enabled` | 必填 | boolean |
| `pipeline.steps[]` | 必填 | object |
| `pipeline.steps[].key` | 必填 | string |
| `pipeline.steps[].step` | 必填 | string |
| `layout.cardAssets.brandAssets.root` | 必填 | string |
| `layout.sections[]` | 必填 | object |
| `layout.sections[].id` | 必填 | string |
| `layout.sections[].path` | 必填 | string |
| `layout.detect.anyOf` | 必填 | string[] |
| `editor.trackTemplate[]` | 必填 | object |
| `editor.trackTemplate[].kind` | 必填 | string |
| `editor.trackTemplate[].name` | 必填 | string |
| `config.sections` | 必填 | object[] |
| `config.sections[]` | 必填 | object |
| `config.sections[].id` | 必填 | string |
| `config.sections[].name` | 必填 | string |
| `config.sections[].fields` | 必填 | object 或 object 或 object 或 object 或 object 或 object 或 object[] |
| `presentation.sections[]` | 必填 | object |
| `presentation.sections[].id` | 必填 | string |
| `requires.providers[]` | 必填 | object |
| `requires.providers[].capability` | 必填 | string |
| `requires.providers[].prefer` | 必填 | string[] |
| `requires.plugins[]` | 必填 | object |
| `requires.plugins[].id` | 必填 | string |
| `bundle.omit[]` | 必填 | object |
| `bundle.omit[].path` | 必填 | string |
| `bundle.demo.path` | 必填 | string |
| `runtime.providers[]` | 必填 | object |
| `runtime.providers[].capability` | 必填 | string |
| `runtime.endpoints[]` | 必填 | object |
| `runtime.endpoints[].id` | 必填 | string |
| `runtime.endpoints[].setup.options[]` | 必填 | object |
| `runtime.endpoints[].setup.options[].label` | 必填 | string |

## 全部字段（共 299 个）

`[]` = 数组里的每一项，`<键>` = 由你起名的键。某个段写了，它下面标「必填」的就都得写。

| 字段路径 | | 类型 / 取值 |
|---|---|---|
| `schema` | 必填 | `"channek.stylecard"` |
| `formatVersion` | 必填 | `2` |
| `id` | 必填 | string |
| `name` | 必填 | string |
| `slug` | 必填 | string |
| `face` | 可选 | string |
| `cardVersion` | 可选 | string |
| `createdAt` | 可选 | string |
| `modifiedAt` | 可选 | string |
| `identity` | 可选 | object |
| `identity.niche` | 可选 | string |
| `identity.audience` | 可选 | string |
| `identity.persona` | 可选 | string |
| `identity.slogan` | 可选 | string |
| `identity.pillars` | 可选 | string |
| `identity.bio` | 可选 | string |
| `identity.mindWord` | 可选 | string |
| `identity.strategy` | 可选 | string |
| `identity.format` | 必填 | object |
| `identity.format.orientation` | 必填 | `landscape` / `portrait` / `square` |
| `identity.format.also` | 可选 | `landscape` / `portrait` / `square`[] |
| `identity.format.persona` | 必填 | `none` / `avatar` / `real` |
| `identity.format.captions` | 必填 | `sentence` / `word` / `none` |
| `brand` | 可选 | object |
| `brand.tokens` | 必填 | object |
| `brand.tokens.colors` | 必填 | { [键]: string } |
| `brand.tokens.accent` | 必填 | string |
| `brand.tokens.fonts` | 必填 | object |
| `brand.tokens.fonts.display` | 必填 | string[] |
| `brand.tokens.fonts.body` | 必填 | string[] |
| `brand.tokens.fonts.mono` | 必填 | string[] |
| `brand.tokens.stroke` | 必填 | number |
| `brand.tokens.radius` | 必填 | number |
| `brand.tokens.grid` | 必填 | number |
| `brand.tokensRef` | 可选 | string |
| `brand.mascot` | 可选 | object |
| `brand.mascot.name` | 必填 | string |
| `brand.mascot.kind` | 可选 | string |
| `brand.mascot.i2vSubject` | 可选 | string |
| `brand.mascot.i2vStyle` | 可选 | string |
| `brand.mascot.clipMap` | 可选 | { [键]: string } |
| `brand.mascot.eyeColor` | 可选 | string |
| `brand.mascot.earColor` | 可选 | string |
| `brand.mascot.signature` | 可选 | string |
| `brand.mascot.visualPrompt` | 可选 | string |
| `brand.mascot.assetRef` | 可选 | string |
| `brand.codeTheme` | 可选 | { [键]: string } |
| `locks` | 可选 | object |
| `locks.visualStyle` | 必填 | object |
| `locks.visualStyle.backend` | 必填 | string |
| `locks.visualStyle.fallback` | 可选 | string[] |
| `locks.visualStyle.version` | 可选 | string |
| `locks.visualStyle.seed` | 可选 | number（可为 null） |
| `locks.visualStyle.sref` | 可选 | string（可为 null） |
| `locks.visualStyle.imagePrompt` | 必填 | string |
| `locks.visualStyle.negativePrompt` | 可选 | string |
| `locks.visualStyle.docRef` | 可选 | string |
| `locks.motionSound` | 必填 | object |
| `locks.motionSound.sound` | 必填 | object |
| `locks.motionSound.sound.vibe` | 可选 | string |
| `locks.motionSound.sound.bgm` | 必填 | object |
| `locks.motionSound.sound.bgm.enabled` | 必填 | boolean |
| `locks.motionSound.sound.bgm.genre` | 可选 | string |
| `locks.motionSound.sound.bgm.mood` | 可选 | string[] |
| `locks.motionSound.sound.bgm.bpm` | 可选 | tuple |
| `locks.motionSound.sound.bgm.noVocals` | 可选 | boolean |
| `locks.motionSound.sound.sfx` | 必填 | object |
| `locks.motionSound.sound.sfx.palette` | 可选 | string |
| `locks.motionSound.sound.sfx.brightnessCeilingHz` | 可选 | number |
| `locks.motionSound.sound.sfx.avoid` | 可选 | string[] |
| `locks.motionSound.sound.sonicLogo` | 可选 | object |
| `locks.motionSound.sound.sonicLogo.enabled` | 必填 | boolean |
| `locks.motionSound.sound.sonicLogo.file` | 可选 | string |
| `locks.motionSound.sound.intro` | 可选 | object |
| `locks.motionSound.sound.intro.enabled` | 必填 | boolean |
| `locks.motionSound.sound.intro.file` | 可选 | string |
| `locks.motionSound.sound.intro.source` | 可选 | `fixed` / `generated` |
| `locks.motionSound.transitions` | 可选 | string[] |
| `locks.motionSound.docRef` | 可选 | string |
| `voice` | 可选 | object |
| `voice.default` | 必填 | string |
| `voice.profiles` | 必填 | { [键]: object } |
| `voice.profiles.<键>` | 必填 | object |
| `voice.profiles.<键>.engine` | 必填 | string |
| `voice.profiles.<键>.mode` | 可选 | string |
| `voice.profiles.<键>.modelPath` | 可选 | string |
| `voice.profiles.<键>.kit` | 可选 | string |
| `voice.profiles.<键>.promptWav` | 可选 | string |
| `voice.profiles.<键>.promptText` | 可选 | string |
| `voice.profiles.<键>.sampleRate` | 可选 | integer |
| `voice.profiles.<键>.speedCps` | 可选 | number |
| `voice.profiles.<键>.pauseStyle` | 可选 | string |
| `voice.profiles.<键>.voiceCard` | 可选 | string |
| `voice.profiles.<键>.license` | 可选 | string |
| `voice.profiles.<键>.metadata` | 可选 | { [键]: 任意 } |
| `captions` | 可选 | object |
| `captions.highlight` | 必填 | boolean |
| `captions.maxLines` | 必填 | integer |
| `captions.wordsPerLine` | 必填 | integer |
| `captions.stroke` | 必填 | `none` / `soft` / `hard` / `pill` |
| `captions.docRef` | 可选 | string |
| `cover` | 可选 | object |
| `cover.config` | 必填 | string |
| `cover.docRef` | 可选 | string |
| `audio` | 可选 | object |
| `audio.bed` | 必填 | object |
| `audio.bed.enabled` | 必填 | boolean |
| `audio.bed.source` | 可选 | `synth` / `library` |
| `audio.bed.floorDb` | 可选 | number |
| `audio.headBreath` | 可选 | number |
| `audio.tailBreath` | 可选 | number |
| `audio.paceEven` | 可选 | boolean |
| `audio.toneEven` | 可选 | boolean |
| `audio.ttsCfg` | 可选 | number |
| `audio.ttsTimesteps` | 可选 | integer |
| `audio.metadata` | 可选 | { [键]: 任意 } |
| `libraries` | 可选 | object |
| `libraries.sound` | 必填 | object[] |
| `libraries.sound[]` | 必填 | object |
| `libraries.sound[].key` | 必填 | string |
| `libraries.sound[].path` | 必填 | string |
| `libraries.sound[].kind` | 可选 | string |
| `libraries.sound[].name` | 可选 | string |
| `libraries.sound[].metadata` | 可选 | { [键]: 任意 } |
| `libraries.asset` | 必填 | object[] |
| `libraries.asset[]` | 必填 | object |
| `libraries.asset[].key` | 必填 | string |
| `libraries.asset[].path` | 必填 | string |
| `libraries.asset[].kind` | 可选 | string |
| `libraries.asset[].name` | 可选 | string |
| `libraries.asset[].metadata` | 可选 | { [键]: 任意 } |
| `libraries.scenes` | 必填 | object[] |
| `libraries.scenes[]` | 必填 | object |
| `libraries.scenes[].key` | 必填 | string |
| `libraries.scenes[].path` | 必填 | string |
| `libraries.scenes[].kind` | 可选 | string |
| `libraries.scenes[].name` | 可选 | string |
| `libraries.scenes[].metadata` | 可选 | { [键]: 任意 } |
| `libraries.reusable` | 可选 | object[] |
| `libraries.reusable[]` | 必填 | object |
| `libraries.reusable[].key` | 必填 | string |
| `libraries.reusable[].path` | 必填 | string |
| `libraries.reusable[].kind` | 可选 | string |
| `libraries.reusable[].name` | 可选 | string |
| `libraries.reusable[].metadata` | 可选 | { [键]: 任意 } |
| `generation` | 可选 | object |
| `generation.aspect` | 可选 | string |
| `generation.fps` | 可选 | number |
| `generation.canvas` | 可选 | object |
| `generation.canvas.width` | 必填 | integer |
| `generation.canvas.height` | 必填 | integer |
| `generation.imageSize` | 可选 | string |
| `generation.cps` | 可选 | number |
| `freeze` | 可选 | object |
| `freeze.visualTokens` | 必填 | boolean |
| `freeze.voice` | 必填 | boolean |
| `freeze.visualStyle` | 必填 | boolean |
| `freeze.frozenAt` | 可选 | string |
| `docs` | 可选 | object |
| `docs.charter` | 可选 | string |
| `docs.ipBrief` | 可选 | string |
| `docs.brandSpec` | 可选 | string |
| `docs.readme` | 可选 | string |
| `platforms` | 可选 | { [键]: object } |
| `platforms.<键>` | 必填 | object |
| `platforms.<键>.enabled` | 必填 | boolean |
| `platforms.<键>.reframe` | 可选 | string |
| `platforms.<键>.category` | 可选 | string |
| `platforms.<键>.metadata` | 可选 | { [键]: 任意 } |
| `publish` | 可选 | object |
| `publish.profileDir` | 可选 | string |
| `publish.debugPort` | 可选 | integer |
| `publish.accounts` | 可选 | string[] |
| `secretsNeeded` | 可选 | string[] |
| `pipeline` | 可选 | object |
| `pipeline.template` | 可选 | string |
| `pipeline.steps` | 可选 | object[] |
| `pipeline.steps[]` | 必填 | object |
| `pipeline.steps[].key` | 必填 | string |
| `pipeline.steps[].step` | 必填 | string |
| `pipeline.steps[].config` | 可选 | { [键]: 任意 } |
| `pipeline.steps[].optional` | 可选 | boolean |
| `layout` | 可选 | object |
| `layout.preset` | 可选 | string |
| `layout.cardAssets` | 可选 | object |
| `layout.cardAssets.libraries` | 可选 | object |
| `layout.cardAssets.libraries.sound` | 可选 | string |
| `layout.cardAssets.libraries.asset` | 可选 | string |
| `layout.cardAssets.libraries.scenes` | 可选 | string |
| `layout.cardAssets.libraries.reusable` | 可选 | string |
| `layout.cardAssets.libraries.ipActions` | 可选 | string |
| `layout.cardAssets.libraries.soundIntro` | 可选 | string |
| `layout.cardAssets.libraries.soundBgm` | 可选 | string |
| `layout.cardAssets.libraries.skills` | 可选 | string |
| `layout.cardAssets.pipelineFixedSounds` | 可选 | string[] |
| `layout.cardAssets.docs` | 可选 | { [键]: string } |
| `layout.cardAssets.brandAssets` | 可选 | object |
| `layout.cardAssets.brandAssets.root` | 必填 | string |
| `layout.cardAssets.brandAssets.avatar` | 可选 | string[] |
| `layout.cardAssets.brandAssets.banners` | 可选 | { [键]: string[] } |
| `layout.contentDir` | 可选 | string |
| `layout.entryDirName` | 可选 | string |
| `layout.sections` | 可选 | object[] |
| `layout.sections[]` | 必填 | object |
| `layout.sections[].id` | 必填 | string |
| `layout.sections[].path` | 必填 | string |
| `layout.sections[].index` | 可选 | string |
| `layout.artifacts` | 可选 | { [键]: string } |
| `layout.artifactAlsoRead` | 可选 | { [键]: string[] } |
| `layout.detect` | 可选 | object |
| `layout.detect.anyOf` | 必填 | string[] |
| `layout.progressAnalyzer` | 可选 | string |
| `layout.demoEntry` | 可选 | string |
| `editor` | 可选 | object |
| `editor.trackTemplate` | 可选 | object[] |
| `editor.trackTemplate[]` | 必填 | object |
| `editor.trackTemplate[].kind` | 必填 | string |
| `editor.trackTemplate[].name` | 必填 | string |
| `editor.macros` | 可选 | string[] |
| `editor.panels` | 可选 | string[] |
| `editor.exportPreset` | 可选 | string |
| `prompts` | 可选 | { [键]: string } |
| `config` | 可选 | object |
| `config.sections` | 必填 | object[] |
| `config.sections[]` | 必填 | object |
| `config.sections[].id` | 必填 | string |
| `config.sections[].name` | 必填 | string |
| `config.sections[].hint` | 可选 | string |
| `config.sections[].group` | 可选 | `style` / `rules` / `advanced` |
| `config.sections[].fields` | 必填 | object 或 object 或 object 或 object 或 object 或 object 或 object[] |
| `presentation` | 可选 | object |
| `presentation.sections` | 可选 | object[] |
| `presentation.sections[]` | 必填 | object |
| `presentation.sections[].id` | 必填 | string |
| `presentation.sections[].provider` | 可选 | string |
| `presentation.defaultSection` | 可选 | string |
| `presentation.contentSurface` | 可选 | string |
| `meta` | 可选 | object |
| `meta.author` | 可选 | string |
| `meta.license` | 可选 | string |
| `meta.description` | 可选 | string |
| `meta.icon` | 可选 | string |
| `meta.preview` | 可选 | string 或 string[] |
| `meta.cover` | 可选 | string 或 string |
| `meta.trailer` | 可选 | string 或 string |
| `meta.homepage` | 可选 | string |
| `meta.repository` | 可选 | string |
| `meta.authorUrl` | 可选 | string |
| `requires` | 可选 | object |
| `requires.app` | 可选 | string |
| `requires.providers` | 可选 | object[] |
| `requires.providers[]` | 必填 | object |
| `requires.providers[].capability` | 必填 | string |
| `requires.providers[].prefer` | 必填 | string[] |
| `requires.providers[].fallback` | 可选 | boolean |
| `requires.providers[].reason` | 可选 | string |
| `requires.providers[].plugins` | 可选 | string[] |
| `requires.plugins` | 可选 | object[] |
| `requires.plugins[]` | 必填 | object |
| `requires.plugins[].id` | 必填 | string |
| `requires.plugins[].optional` | 可选 | boolean |
| `requires.secrets` | 可选 | string[] |
| `bundle` | 可选 | object |
| `bundle.omit` | 可选 | object[] |
| `bundle.omit[]` | 必填 | object |
| `bundle.omit[].path` | 必填 | string |
| `bundle.omit[].reason` | 可选 | string |
| `bundle.demo` | 可选 | object |
| `bundle.demo.path` | 必填 | string |
| `bundle.demo.license` | 可选 | `sample-only` / `cc-by` / `inherit` |
| `bundle.demo.reel` | 可选 | string |
| `runtime` | 可选 | object |
| `runtime.providers` | 可选 | object[] |
| `runtime.providers[]` | 必填 | object |
| `runtime.providers[].capability` | 必填 | string |
| `runtime.providers[].prefer` | 可选 | string[] |
| `runtime.providers[].model` | 可选 | string |
| `runtime.providers[].params` | 可选 | { [键]: 任意 } |
| `runtime.providers[].endpoint` | 可选 | string |
| `runtime.providers[].reason` | 可选 | string |
| `runtime.endpoints` | 可选 | object[] |
| `runtime.endpoints[]` | 必填 | object |
| `runtime.endpoints[].id` | 必填 | string |
| `runtime.endpoints[].setup` | 可选 | object |
| `runtime.endpoints[].setup.summary` | 可选 | string |
| `runtime.endpoints[].setup.difficulty` | 可选 | `hosted` / `proxy` / `model` |
| `runtime.endpoints[].setup.options` | 可选 | object[] |
| `runtime.endpoints[].setup.options[]` | 必填 | object |
| `runtime.endpoints[].setup.options[].label` | 必填 | string |
| `runtime.endpoints[].setup.options[].note` | 可选 | string |
| `runtime.endpoints[].setup.options[].url` | 可选 | string |
| `runtime.endpoints[].label` | 可选 | string |
| `runtime.endpoints[].provider` | 可选 | string |
| `runtime.endpoints[].capability` | 可选 | string |
| `runtime.endpoints[].optional` | 可选 | boolean |
| `runtime.endpoints[].example` | 可选 | string |
| `runtime.endpoints[].description` | 可选 | string |
| `pluginSettings` | 可选 | { [键]: { [键]: 任意 } } |
| `metadata` | 可选 | { [键]: 任意 } |
