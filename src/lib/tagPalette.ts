export type TagColorId =
  | 'tag-gray'
  | 'tag-red'
  | 'tag-yellow'
  | 'tag-green'
  | 'tag-blue'
  | 'tag-purple';

export type TagColorToken = {
  id: TagColorId;
  label: string;
  bgClassName: string;
  hoverClassName: string;
  chipClassName: string;
  textClassName: string;
  borderClassName: string;
};

export const TAG_COLOR_OPTIONS: TagColorToken[] = [
  {
    id: 'tag-gray',
    label: '회색',
    bgClassName: 'bg-tag-gray-100',
    hoverClassName: 'hover:bg-tag-gray-200',
    chipClassName: 'bg-tag-gray-500',
    textClassName: 'text-tag-gray-500',
    borderClassName: 'border-tag-gray-500',
  },
  {
    id: 'tag-red',
    label: '빨강',
    bgClassName: 'bg-tag-red-100',
    hoverClassName: 'hover:bg-tag-red-200',
    chipClassName: 'bg-tag-red-500',
    textClassName: 'text-tag-red-500',
    borderClassName: 'border-tag-red-500',
  },
  {
    id: 'tag-yellow',
    label: '노랑',
    bgClassName: 'bg-tag-yellow-100',
    hoverClassName: 'hover:bg-tag-yellow-200',
    chipClassName: 'bg-tag-yellow-500',
    textClassName: 'text-tag-yellow-500',
    borderClassName: 'border-tag-yellow-500',
  },
  {
    id: 'tag-green',
    label: '초록',
    bgClassName: 'bg-tag-green-100',
    hoverClassName: 'hover:bg-tag-green-200',
    chipClassName: 'bg-tag-green-500',
    textClassName: 'text-tag-green-500',
    borderClassName: 'border-tag-green-500',
  },
  {
    id: 'tag-blue',
    label: '파랑',
    bgClassName: 'bg-tag-blue-100',
    hoverClassName: 'hover:bg-tag-blue-200',
    chipClassName: 'bg-tag-blue-500',
    textClassName: 'text-tag-blue-500',
    borderClassName: 'border-tag-blue-500',
  },
  {
    id: 'tag-purple',
    label: '보라',
    bgClassName: 'bg-tag-purple-100',
    hoverClassName: 'hover:bg-tag-purple-200',
    chipClassName: 'bg-tag-purple-500',
    textClassName: 'text-tag-purple-500',
    borderClassName: 'border-tag-purple-500',
  },
];

export const TAG_COLOR_MAP = TAG_COLOR_OPTIONS.reduce(
  (acc, color) => {
    acc[color.id] = color;
    return acc;
  },
  {} as Record<TagColorId, TagColorToken>,
);

export function getTagColor(id?: TagColorId) {
  return TAG_COLOR_MAP[id ?? 'tag-gray'] ?? TAG_COLOR_MAP['tag-gray'];
}
