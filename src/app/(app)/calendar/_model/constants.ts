import type { EventColorId } from './types';

export type EventColorTokens = {
  defaultBg: string;
  hoverBg: string;
  selectedBg: string;
  defaultText: string;
  selectedText: string;
  defaultBorder: string;
  hoverBorder: string;
  selectedBorder: string;
};

const SURFACE_COLOR = 'var(--color-bg-white)';
const LIGHT_TEXT_COLOR = 'var(--color-gray-50)';
const DARK_TEXT_COLOR = 'var(--color-gray-950)';

export const UNASSIGNED_EVENT_COLOR_TOKENS: EventColorTokens = {
  defaultBg: SURFACE_COLOR,
  hoverBg: SURFACE_COLOR,
  selectedBg: 'var(--color-tag-gray-500)',
  defaultText: DARK_TEXT_COLOR,
  selectedText: DARK_TEXT_COLOR,
  defaultBorder: 'var(--color-tag-gray-100)',
  hoverBorder: 'var(--color-tag-gray-200)',
  selectedBorder: 'var(--color-tag-gray-500)',
};

export const EVENT_COLOR_TOKENS: Record<EventColorId, EventColorTokens> = {
  'tag-red': {
    defaultBg: 'var(--color-tag-red-100)',
    hoverBg: 'var(--color-tag-red-200)',
    selectedBg: 'var(--color-tag-red-500)',
    defaultText: DARK_TEXT_COLOR,
    selectedText: LIGHT_TEXT_COLOR,
    defaultBorder: 'var(--color-tag-red-100)',
    hoverBorder: 'var(--color-tag-red-200)',
    selectedBorder: 'var(--color-tag-red-500)',
  },
  'tag-yellow': {
    defaultBg: 'var(--color-tag-yellow-100)',
    hoverBg: 'var(--color-tag-yellow-200)',
    selectedBg: 'var(--color-tag-yellow-500)',
    defaultText: DARK_TEXT_COLOR,
    selectedText: DARK_TEXT_COLOR,
    defaultBorder: 'var(--color-tag-yellow-100)',
    hoverBorder: 'var(--color-tag-yellow-200)',
    selectedBorder: 'var(--color-tag-yellow-500)',
  },
  'tag-green': {
    defaultBg: 'var(--color-tag-green-100)',
    hoverBg: 'var(--color-tag-green-200)',
    selectedBg: 'var(--color-tag-green-500)',
    defaultText: DARK_TEXT_COLOR,
    selectedText: LIGHT_TEXT_COLOR,
    defaultBorder: 'var(--color-tag-green-100)',
    hoverBorder: 'var(--color-tag-green-200)',
    selectedBorder: 'var(--color-tag-green-500)',
  },
  'tag-blue': {
    defaultBg: 'var(--color-tag-blue-100)',
    hoverBg: 'var(--color-tag-blue-200)',
    selectedBg: 'var(--color-tag-blue-500)',
    defaultText: DARK_TEXT_COLOR,
    selectedText: LIGHT_TEXT_COLOR,
    defaultBorder: 'var(--color-tag-blue-100)',
    hoverBorder: 'var(--color-tag-blue-200)',
    selectedBorder: 'var(--color-tag-blue-500)',
  },
  'tag-purple': {
    defaultBg: 'var(--color-tag-purple-100)',
    hoverBg: 'var(--color-tag-purple-200)',
    selectedBg: 'var(--color-tag-purple-500)',
    defaultText: DARK_TEXT_COLOR,
    selectedText: LIGHT_TEXT_COLOR,
    defaultBorder: 'var(--color-tag-purple-100)',
    hoverBorder: 'var(--color-tag-purple-200)',
    selectedBorder: 'var(--color-tag-purple-500)',
  },
  'tag-gray': {
    defaultBg: 'var(--color-tag-gray-100)',
    hoverBg: 'var(--color-tag-gray-200)',
    selectedBg: 'var(--color-tag-gray-500)',
    defaultText: DARK_TEXT_COLOR,
    selectedText: LIGHT_TEXT_COLOR,
    defaultBorder: 'var(--color-tag-gray-100)',
    hoverBorder: 'var(--color-tag-gray-200)',
    selectedBorder: 'var(--color-tag-gray-500)',
  },
};

export const DEFAULT_EVENT_COLOR: EventColorId = 'tag-gray';

export function getEventColorTokens(colorId?: EventColorId): EventColorTokens {
  return EVENT_COLOR_TOKENS[colorId ?? DEFAULT_EVENT_COLOR] ?? UNASSIGNED_EVENT_COLOR_TOKENS;
}
