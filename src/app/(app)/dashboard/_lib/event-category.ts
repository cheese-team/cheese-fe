import type { CalendarEvent, CalendarEventCategory } from '../../calendar/_model/types';

type DashboardChipVariant = 'interview' | 'document' | 'personal';

const CATEGORY_META: Record<
  CalendarEventCategory,
  { label: string; chipVariant: DashboardChipVariant }
> = {
  interview: { label: '면접일정', chipVariant: 'interview' },
  document: { label: '서류접수', chipVariant: 'document' },
  personal: { label: '개인일정', chipVariant: 'personal' },
  assignment: { label: '서류접수', chipVariant: 'document' },
  meeting: { label: '미팅', chipVariant: 'personal' },
  etc: { label: '개인일정', chipVariant: 'personal' },
};

const DEFAULT_CATEGORY_META = {
  label: '개인일정',
  chipVariant: 'personal' as const,
};

export function getDashboardCategoryMeta(event: CalendarEvent) {
  if (!event.category) {
    return DEFAULT_CATEGORY_META;
  }

  return CATEGORY_META[event.category] ?? DEFAULT_CATEGORY_META;
}
