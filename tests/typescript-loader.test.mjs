import assert from 'node:assert/strict';
import { mkdtemp, rmdir, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

import { resolve } from './typescript-loader.mjs';

async function createFixture(t, names) {
  const directory = await mkdtemp(join(tmpdir(), 'cheese-typescript-loader-'));
  const files = names.map((name) => join(directory, name));
  await Promise.all(files.map((file) => writeFile(file, 'export default 1;')));
  t.after(async () => {
    await Promise.all(files.map((file) => unlink(file)));
    await rmdir(directory);
  });
  return {
    context: { parentURL: pathToFileURL(join(directory, 'entry.mjs')).href },
    fileURL: (name) => pathToFileURL(join(directory, name)).href,
  };
}

for (const name of ['theme.css', 'problem.api']) {
  test(`로더: ${name}가 존재하면 같은 이름의 TypeScript 후보보다 우선한다`, async (t) => {
    const { context, fileURL } = await createFixture(t, [name, `${name}.ts`, `${name}.tsx`]);
    const expected = { url: fileURL(name) };
    const nextResolve = t.mock.fn(async () => expected);

    assert.deepEqual(await resolve(`./${name}`, context, nextResolve), expected);
    assert.equal(nextResolve.mock.callCount(), 1);
    assert.deepEqual(nextResolve.mock.calls[0].arguments, [`./${name}`, context]);
  });
}

test('로더: 기존 파일의 기본 resolver 오류를 TypeScript 후보로 우회하지 않는다', async (t) => {
  const { context } = await createFixture(t, ['theme.css', 'theme.css.ts']);
  const error = new Error('다음 resolver에서 발생한 오류');

  await assert.rejects(
    resolve('./theme.css', context, async () => {
      throw error;
    }),
    (actual) => actual === error,
  );
});

for (const extension of ['.ts', '.tsx']) {
  test(`로더: 원본 경로가 없으면 problem.api${extension}를 찾는다`, async (t) => {
    const name = `problem.api${extension}`;
    const { context, fileURL } = await createFixture(t, [name]);
    const nextResolve = t.mock.fn();

    assert.deepEqual(await resolve('./problem.api', context, nextResolve), {
      url: fileURL(name),
      shortCircuit: true,
    });
    assert.equal(nextResolve.mock.callCount(), 0);
  });
}

test('로더: 명시적인 별칭 파일 경로는 실제 URL로 기본 resolver에 전달한다', async (t) => {
  const expectedURL = new URL('../src/api/problem.api.ts', import.meta.url).href;
  const context = { parentURL: import.meta.url };
  const expected = { url: expectedURL };
  const nextResolve = t.mock.fn(async () => expected);

  assert.deepEqual(await resolve('@/api/problem.api.ts', context, nextResolve), expected);
  assert.deepEqual(nextResolve.mock.calls[0].arguments, [expectedURL, context]);
});

test('로더: 원본과 TypeScript 후보가 모두 없으면 기본 resolver에 위임한다', async (t) => {
  const { context } = await createFixture(t, []);
  const error = new Error('모듈을 찾을 수 없습니다.');
  const nextResolve = t.mock.fn(async () => {
    throw error;
  });

  await assert.rejects(
    resolve('./missing.api', context, nextResolve),
    (actual) => actual === error,
  );
  assert.deepEqual(nextResolve.mock.calls[0].arguments, ['./missing.api', context]);
});
