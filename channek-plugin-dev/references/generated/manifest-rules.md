<!-- 同步自 Channek 仓库 docs/plugin/reference/manifest-rules.md（由源码生成）。勿手改：跑 scripts/sync-contracts.mjs -->
<!-- 此文件由 pnpm gen:plugin-ref 生成，请勿手改。 -->
# 清单校验规则

`validateManifest` 的规则编号与它会说的话（每条只摘前几句）。清单被拒时报的就是这些编号。

| 规则 | 报文（节选） |
|---|---|
| `V1` | `manifest must be an object`<br>`manifestVersion must equal 1`<br>`… must be a non-empty string` |
| `V2` | `invalid plugin id: …`<br>`plugin id must match directory name: …`<br>`official namespace is reserved for builtin plugins` |
| `V3` | `invalid version: …`<br>`invalid minAppVersion: …` |
| `V5` | `… is forbidden for declarative plugins` |
| `V6` | `code plugins require apiVersion 1`<br>`sandboxed plugins require a sandbox entry`<br>`privileged plugins require apiVersion` |
| `V7` | `workspace plugins must be declarative` |
| `V9` | `permissions must be an array`<br>`unknown permission: …`<br>`invalid network permission` |
| `V11` | `contributes must be an object`<br>`… contributions must be an array` |
| `V12` | `extensionPoints must be an array`<br>`custom extension point must use the …. namespace`<br>`declSchema for … must be an array` |
| `V13` | `command id must use the …. namespace: …`<br>`activation command must use the …. namespace: …`<br>`command reference must use the …. namespace: …` |
| `V14` | `… must be an object`<br>`plugins cannot depend on themselves`<br>`invalid dependency range for …: …` |
