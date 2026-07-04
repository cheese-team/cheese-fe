import { getTagColor, type TagColorId } from '@/lib/tagPalette';

import type { MemoColor } from '../_types/memo';

export const MEMO_COLOR_TO_TAG_COLOR: Record<MemoColor, TagColorId> = {
  gray: 'tag-gray',
  pink: 'tag-red',
  orange: 'tag-yellow',
  green: 'tag-green',
  blue: 'tag-blue',
  purple: 'tag-purple',
};

export const MEMO_COLOR_OPTIONS: Array<{
  color: MemoColor;
  tagColorId: TagColorId;
  label: string;
}> = [
  { color: 'gray', tagColorId: 'tag-gray', label: '회색' },
  { color: 'pink', tagColorId: 'tag-red', label: '분홍' },
  { color: 'orange', tagColorId: 'tag-yellow', label: '노랑' },
  { color: 'green', tagColorId: 'tag-green', label: '초록' },
  { color: 'blue', tagColorId: 'tag-blue', label: '파랑' },
  { color: 'purple', tagColorId: 'tag-purple', label: '보라' },
];

export function getMemoTagColor(color?: MemoColor) {
  if (!color) return null;

  return getTagColor(MEMO_COLOR_TO_TAG_COLOR[color]);
}
