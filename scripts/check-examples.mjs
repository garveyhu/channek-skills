#!/usr/bin/env node
/**
 * 用 app 自己的判据（`channek check`）校验仓库里让人照抄的示例卡。
 *
 * 示例卡是这个仓库里被照抄得最多的东西，它不合法 = 每个照抄的人都踩同一个坑（发生过：
 * 建仓时的示例卡有 9 处不合 schema）。`channek` 命令随 Channek app 安装。
 *
 *   node scripts/check-examples.mjs
 */
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const here = resolve(import.meta.dirname, '..');
const EXAMPLES = ['channek-card-dev/references/card-template.jsonc'];

/** 只去掉整行注释与行尾注释；示例里的字符串不含 `//`，不需要完整的 JSONC 解析器。 */
function stripComments(text) {
  return text
    .split('\n')
    .filter(line => !/^\s*\/\//u.test(line))
    .map(line => line.replace(/\s+\/\/.*$/u, ''))
    .join('\n');
}

const probe = spawnSync('channek', ['--help'], { encoding: 'utf8' });
if (probe.error) {
  console.error('找不到 channek 命令：装好 Channek app 后它会出现在 PATH 上（~/.channek/bin）');
  process.exit(2);
}

let failed = 0;
for (const example of EXAMPLES) {
  const dir = await mkdtemp(join(tmpdir(), 'channek-example-'));
  const card = JSON.parse(stripComments(await readFile(resolve(here, example), 'utf8')));
  await writeFile(join(dir, 'card.json'), JSON.stringify(card, null, 2));
  const result = spawnSync('channek', ['check', dir], { encoding: 'utf8' });
  process.stdout.write(`${example}\n${result.stdout.split('\n').slice(1).join('\n')}`);
  if (result.status !== 0) process.stderr.write(result.stderr);
  if (result.status !== 0) failed += 1;
}
process.exit(failed === 0 ? 0 : 1);
