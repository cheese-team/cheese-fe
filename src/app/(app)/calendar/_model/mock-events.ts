import type { CalendarEvent } from './types';

export const mockEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: '한칸에 하나의 일정만 세울 수 있음',
    start: '2026-02-01T01:00:00',
    end: '2026-02-01T02:00:00',
    colorId: 'tag-yellow',
    reminderMinutes: 10,
    memo: '일간/주간 타임 슬롯 샘플',
  },
  {
    id: 'evt-2',
    title: '한칸에 하나의 일정만 세울 수 있음',
    start: '2026-02-02T09:00:00',
    end: '2026-02-02T10:00:00',
    colorId: 'tag-blue',
    reminderMinutes: 10,
    memo: '월간과 동일하게 팝오버에서 수정 가능',
  },
  {
    id: 'evt-3',
    title: '기본 배경',
    start: '2026-02-02T10:00:00',
    end: '2026-02-02T11:00:00',
    colorId: 'tag-gray',
    reminderMinutes: 30,
  },
  {
    id: 'evt-4',
    title: '휴가',
    start: '2026-02-10',
    end: '2026-02-11',
    allDay: true,
    colorId: 'tag-gray',
    memo: '연락 어려움',
  },
];
