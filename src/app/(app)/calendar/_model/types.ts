/**
 * 캘린더 뷰 타입
 * - FullCalendar view와 매핑하기 쉬운 값으로 유지
 */
export type CalendarView = 'month' | 'week' | 'day';

/**
 * globals.css의 Tag palette 토큰과 1:1로 대응되는 ID
 * - 색상 값은 constants.ts에서 토큰으로 매핑해서 사용
 */
export type EventColorId =
  | 'tag-red'
  | 'tag-yellow'
  | 'tag-green'
  | 'tag-blue'
  | 'tag-purple'
  | 'tag-gray';

export interface CalendarSpace {
  id: string;
  name: string;
  colorId: EventColorId;
}

export type ReminderMinutes = 0 | 5 | 10 | 15 | 30 | 60 | 120 | 1440;

export interface CalendarEvent {
  id: string;

  // 표시
  title: string;
  memo?: string;

  start: string;
  end: string;
  allDay?: boolean;

  // 분류/색상
  spaceId?: CalendarSpace['id'];
  colorId?: EventColorId;

  // 옵션
  reminderMinutes?: ReminderMinutes;
  location?: string;

  // 확장 대비
  createdAt?: string;
  updatedAt?: string;
}

export type CalendarEventDraft = Omit<CalendarEvent, 'id'> & {
  id?: string;
};
export type CalendarSlot = {
  start: string; // ISO string or 'YYYY-MM-DD'
  end: string; // ISO string or 'YYYY-MM-DD'
  allDay?: boolean;
};
