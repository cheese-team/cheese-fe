import DOMPurify from 'isomorphic-dompurify';

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

/**
 * 커뮤니티 TipTap HTML에 적용할 추가 정제 규칙입니다.
 * addHook으로 등록한 규칙은 동일한 DOMPurify 인스턴스의 다른 sanitize 호출에도 적용됩니다.
 */
DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
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
    const match = /^color:\s*(rgb\(\d+,\s*\d+,\s*\d+\))\s*;?$/.exec(style);

    if (match && ALLOWED_COLORS.has(match[1])) {
      data.attrValue = `color: ${match[1]};`;
      return;
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
});

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.nodeType !== 1 || node.nodeName.toLowerCase() !== 'a') return;

  const link = node as Element;

  if (link.getAttribute('target') !== '_blank') return;
  if (!link.hasAttribute('href')) return;

  const rel = new Set((link.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));

  rel.add('noopener');
  rel.add('noreferrer');

  link.setAttribute('rel', [...rel].join(' '));
});

/**
 * 커뮤니티 TipTap 에디터에서 생성한 HTML을 정제합니다.
 * 허용된 태그와 속성을 기준으로 위험한 요소를 제거하고,
 * 글자 색상, 정렬 스타일 및 이미지 URL은 별도 검증합니다.
 * 에디터 기능 변경 시 허용 규칙도 함께 검토해야 합니다.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
