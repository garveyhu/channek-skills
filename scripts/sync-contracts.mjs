#!/usr/bin/env node
/**
 * 把 Channek 仓库里**由代码生成**的契约表同步进各 skill 的 `references/generated/`。
 *
 * 为什么不手写：贡献键、桥 op、清单规则、卡字段这几张表每次内核改契约就变。手抄进 skill 的
 * 版本从建仓那天起就在漂——op 数写成 34（实为 37），示例卡照抄的字段表有 9 处不合 schema。
 * 生成表在 Channek 仓库里由 `pnpm gen:plugin-ref` / `pnpm gen:card-ref` 从源码产出，这里只做
 * 原样搬运，skill 正文引用这些文件，不再自己写数字。
 *
 *   node scripts/sync-contracts.mjs --from <Channek 仓库路径>      同步
 *   node scripts/sync-contracts.mjs --from <路径> --check          只检查，过期退出码 1
 *   CHANNEK_REPO=<路径> node scripts/sync-contracts.mjs            也可以用环境变量给路径
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const here = resolve(import.meta.dirname, '..');
const SOURCE_DIR = 'docs/plugin/reference';

/** 生成表 → 放进哪个 skill。skill 要能被单独安装，所以各自带一份，不共享目录。 */
const TARGETS = [
  ['card-schema.md', 'channek-card-dev'],
  ['contribution-keys.md', 'channek-plugin-dev'],
  ['suite-bridge-ops.md', 'channek-plugin-dev'],
  ['manifest-rules.md', 'channek-plugin-dev'],
  ['theme-tokens.md', 'channek-plugin-dev'],
];

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const from = argValue('--from') ?? process.env.CHANNEK_REPO;
if (!from) {
  console.error('要告诉我 Channek 仓库在哪：--from <路径>，或设环境变量 CHANNEK_REPO');
  process.exit(2);
}
const checkOnly = process.argv.includes('--check');

const banner = name =>
  `<!-- 同步自 Channek 仓库 ${SOURCE_DIR}/${name}（由源码生成）。勿手改：跑 scripts/sync-contracts.mjs -->\n`;

let stale = 0;
for (const [name, skill] of TARGETS) {
  const source = await readFile(resolve(from, SOURCE_DIR, name), 'utf8').catch(() => null);
  if (source === null) {
    console.error(`读不到 ${SOURCE_DIR}/${name}——Channek 仓库路径对吗？生成表跑过了吗（pnpm gen:plugin-ref / gen:card-ref）？`);
    process.exit(2);
  }
  const target = resolve(here, skill, 'references', 'generated', name);
  const expected = banner(name) + source;
  const current = await readFile(target, 'utf8').catch(() => null);
  if (current === expected) continue;
  stale += 1;
  if (checkOnly) {
    console.error(`过期：${skill}/references/generated/${name}`);
  } else {
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, expected);
    console.log(`已同步：${skill}/references/generated/${name}`);
  }
}
if (checkOnly && stale > 0) process.exit(1);
if (stale === 0) console.log('契约表都是最新的');
