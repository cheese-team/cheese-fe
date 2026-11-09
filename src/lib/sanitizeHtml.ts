import DOMPurify from 'isomorphic-dompurify';
import type { ElementHook, UponSanitizeAttributeHook } from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  's',
  'u',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'hr',
  'a',
  'img',
  'span',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'title', 'src', 'alt', 'width', 'height', 'style'];

const ALLOWED_COLORS = new Set([
  'rgb(17, 17, 17)',
  'rgb(107, 114, 128)',
  'rgb(235, 91, 73)',
  'rgb(244, 195, 64)',
  'rgb(156, 192, 75)',
  'rgb(91, 158, 247)',
  'rgb(155, 89, 208)',
]);

const ALLOWED_ALIGNMENTS = new Set(['left', 'center', 'right', 'justify']);

function parseColorComponent(value: string, maximum: number): number | null {
  if (!/^[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?%?$/.test(value)) return null;

  const limit = value.endsWith('%') ? 100 : maximum;
  const number = Number(value.replace(/%$/, ''));

  return Number.isFinite(number) && number >= 0 && number <= limit ? number / limit : null;
}

// DOM의 CSS 직렬화에 의존하지 않아 서버와 브라우저에서 동일한 RGB 값으로 비교합니다.
function normalizeColor(value: string): string | null {
  if (/[^\t\n\f\r\x20-\x7e]/.test(value)) return null;
  value = value.trim();

  const hexMatch = /^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/.exec(value);

  if (hexMatch) {
    const hex =
      hexMatch[1].length <= 4
        ? [...hexMatch[1]].map((digit) => digit.repeat(2)).join('')
        : hexMatch[1];

    if (hex.length === 8 && hex.slice(6) !== 'ff') return null;

    return `rgb(${[0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).join(', ')})`;
  }

  const match = /^(rgba?|color)\(([^()]*)\)$/.exec(value);
  if (!match) return null;

  const isSrgb = match[1] === 'color';
  let components = match[2].trim();

  if (isSrgb) {
    if (!/^srgb\s+/.test(components)) return null;
    components = components.replace(/^srgb\s+/, '');
  }

  let channels: string[];
  let alpha: string | undefined;

  if (components.includes(',')) {
    if (isSrgb || components.includes('/')) return null;
    const parts = components.split(',').map((part) => part.trim());
    if (parts.length !== 3 && parts.length !== 4) return null;
    channels = parts.slice(0, 3);
    alpha = parts[3];

    // 쉼표 구분 RGB 문법에서는 숫자와 백분율을 혼합할 수 없습니다.
    if (channels.some((channel) => channel.endsWith('%') !== channels[0].endsWith('%'))) {
      return null;
    }
  } else {
    const parts = components.split('/');
    if (parts.length > 2) return null;
    channels = parts[0].trim().split(/\s+/);
    alpha = parts[1]?.trim();
  }

  if (channels.length !== 3 || (alpha !== undefined && parseColorComponent(alpha, 1) !== 1)) {
    return null;
  }

  const rgb = channels.map((channel) => parseColorComponent(channel, isSrgb ? 1 : 255));
  if (!rgb.every((channel) => channel !== null)) return null;

  // sRGB 소수 표기의 직렬화 오차를 8비트 RGB로 정규화합니다.
  return `rgb(${rgb.map((channel) => Math.round(channel * 255)).join(', ')})`;
}

const sanitizeAttribute: UponSanitizeAttributeHook = (node, data) => {
  const tagName = node.nodeName.toLowerCase();

  if (tagName === 'img' && data.attrName === 'src') {
    const src = data.attrValue.trim();

    const isHttpUrl = /^https?:\/\//i.test(src);
    const isRelativePath = src.startsWith('/') && !src.startsWith('//');

    if (!isHttpUrl && !isRelativePath) {
      data.keepAttr = false;
    }

    return;
  }

  if (data.attrName !== 'style') return;

  const style = data.attrValue.trim().toLowerCase();

  if (tagName === 'span') {
    const declarations = style.split(';').map((declaration) => declaration.trim());

    const hasInvalidDeclaration = declarations.some(
      (declaration) => declaration && !declaration.includes(':'),
    );

    if (!hasInvalidDeclaration) {
      const colorDeclaration = declarations.find((declaration) => /^color\s*:/.test(declaration));

      if (colorDeclaration) {
        const colorValue = colorDeclaration
          .slice(colorDeclaration.indexOf(':') + 1)
          .replace(/\s*!important\s*$/, '')
          .trim();

        const color = normalizeColor(colorValue);

        if (color && ALLOWED_COLORS.has(color)) {
          data.attrValue = `color: ${color};`;
          return;
        }
      }
    }
  }

  if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
    const match = /^text-align:\s*(left|center|right|justify)\s*;?$/.exec(style);

    if (match && ALLOWED_ALIGNMENTS.has(match[1])) {
      data.attrValue = `text-align: ${match[1]};`;
      return;
    }
  }

  data.keepAttr = false;
};

const secureLink: ElementHook = (node) => {
  if (node.nodeType !== 1 || node.nodeName.toLowerCase() !== 'a') return;

  const link = node as Element;
  const target = link.getAttribute('target');

  // 허용되지 않은 target은 제거합니다.
  if (target && target !== '_blank' && target !== '_self') {
    link.removeAttribute('target');
    return;
  }

  if (target !== '_blank' || !link.hasAttribute('href')) return;

  const rel = new Set((link.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));

  rel.add('noopener');
  rel.add('noreferrer');

  link.setAttribute('rel', [...rel].join(' '));
};

/**
 * 커뮤니티 TipTap 에디터에서 생성한 HTML을 정제합니다.
 * 허용된 태그와 속성을 기준으로 위험한 요소를 제거하고,
 * 글자 색상, 정렬 스타일 및 이미지 URL은 별도 검증합니다.
 * 에디터 기능 변경 시 허용 규칙도 함께 검토해야 합니다.
 */
export function sanitizeHtml(html: string): string {
  DOMPurify.addHook('uponSanitizeAttribute', sanitizeAttribute);
  DOMPurify.addHook('afterSanitizeAttributes', secureLink);

  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    });
  } finally {
    // Fast Refresh 시 훅이 누적되지 않도록 현재 등록한 콜백만 제거합니다.
    DOMPurify.removeHook('uponSanitizeAttribute', sanitizeAttribute);
    DOMPurify.removeHook('afterSanitizeAttributes', secureLink);
  }
}
