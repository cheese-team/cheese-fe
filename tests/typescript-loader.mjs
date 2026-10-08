import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Node의 테스트 러너에서 프로젝트의 TypeScript와 @/ 경로를 그대로 실행한다.
export async function resolve(specifier, context, nextResolve) {
  const url = specifier.startsWith('@/')
    ? new URL(`../src/${specifier.slice(2)}`, import.meta.url)
    : specifier.startsWith('.')
      ? new URL(specifier, context.parentURL)
      : null;
  const nextSpecifier = specifier.startsWith('@/') ? url.href : specifier;

  if (url) {
    const requestedPathExists = await access(url).then(
      () => true,
      () => false,
    );
    // 기존 파일은 확장자와 관계없이 기본 resolver가 처리하도록 한다.
    if (requestedPathExists) {
      return nextResolve(nextSpecifier, context);
    }
  }

  // problem.api처럼 이름에 점이 있어도 실제 확장자가 없으면 .ts/.tsx를 찾는다.
  if (url && !/\.(?:ts|tsx|js|jsx|mjs|cjs|json)$/i.test(url.pathname)) {
    for (const extension of ['.ts', '.tsx']) {
      const candidate = new URL(`${url.href}${extension}`);
      try {
        await access(candidate);
        return { url: candidate.href, shortCircuit: true };
      } catch {
        // 다음 확장자 또는 Node의 기본 resolver로 이어간다.
      }
    }
  }
  return nextResolve(nextSpecifier, context);
}

export async function load(url, context, nextLoad) {
  if (/\.tsx?$/.test(url)) {
    const source = await readFile(new URL(url), 'utf8');
    return {
      format: 'module',
      shortCircuit: true,
      source: ts.transpileModule(source, {
        fileName: fileURLToPath(url),
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText,
    };
  }
  return nextLoad(url, context);
}
