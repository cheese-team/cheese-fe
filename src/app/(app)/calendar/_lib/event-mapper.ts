import {
  addDaysToCalendarDate,
  addHoursToCalendarDateTime,
  formatCalendarDate,
  formatCalendarDateTime,
  hasTimePart,
  parseCalendarDate,
} from './date';
import { DEFAULT_EVENT_COLOR } from '@/app/(app)/calendar/_model/constants';
import type { CalendarEvent, CalendarEventDraft } from '@/app/(app)/calendar/_model/types';

/**
 * 시간형 일정의 기준 슬롯을 만들기 위해 시/분/초를 정시로 맞춘다.
 */
export function startOfCalendarHour(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0);
}

/**
 * 시간 슬롯 비교용 키.
 * 예: 2026-04-09T00:00
 */
export function getTimedSlotKey(value?: string) {
  return formatCalendarDateTime(value, { seconds: false });
}

/**
 * 일정이 실제로 점유하는 모든 시간 슬롯 키를 반환한다.
 * 00:00 ~ 02:00 일정이라면 [00:00, 01:00] 슬롯이 반환된다.
 */
export function getOccupiedTimedSlotKeys(startValue?: string, endValue?: string) {
  const startDate = parseCalendarDate(startValue);
  if (!startDate) return [];

  const parsedEndDate = parseCalendarDate(endValue);
  const fallbackEndDate = parseCalendarDate(addHoursToCalendarDateTime(startValue ?? '', 1));
  const endDate =
    parsedEndDate && parsedEndDate > startDate
      ? parsedEndDate
      : fallbackEndDate && fallbackEndDate > startDate
        ? fallbackEndDate
        : null;

  if (!endDate) return [];

  const slotKeys: string[] = [];

  for (
    let cursor = startOfCalendarHour(startDate);
    cursor < endDate;
    cursor.setHours(cursor.getHours() + 1, 0, 0, 0)
  ) {
    const slotStart = new Date(cursor.getTime());
    const slotEnd = new Date(cursor.getTime());
    slotEnd.setHours(slotEnd.getHours() + 1, 0, 0, 0);

    if (slotEnd <= startDate) continue;

    const slotKey = getTimedSlotKey(formatCalendarDateTime(slotStart));
    if (!slotKey) continue;

    slotKeys.push(slotKey);
  }

  return slotKeys;
}

/**
 * 시간형 일정끼리 같은 슬롯을 점유하는지 확인한다.
 * 종일 일정은 시간 충돌 검사 대상에서 제외한다.
 */
export function hasTimedSlotConflict(
  events: CalendarEvent[],
  draft: CalendarEventDraft,
  excludeEventId?: string,
) {
  if (draft.allDay) return false;

  const occupiedSlotKeys = new Set(getOccupiedTimedSlotKeys(draft.start, draft.end));
  if (occupiedSlotKeys.size === 0) return false;

  return events.some((event) => {
    if (event.id === excludeEventId) return false;
    if (event.allDay) return false;

    return getOccupiedTimedSlotKeys(event.start, event.end).some((slotKey) => {
      return occupiedSlotKeys.has(slotKey);
    });
  });
}

/**
 * 저장 직전에 일정 draft를 정규화한다.
 * - 종일 일정은 YYYY-MM-DD
 * - 시간 일정은 YYYY-MM-DDTHH:mm:ss
 * - end가 비어 있거나 start보다 빠르면 기본 길이를 보정한다.
 */
export function normalizeDraftForSave(draft: CalendarEventDraft) {
  const isAllDay = draft.allDay ?? !hasTimePart(draft.start);

  if (isAllDay) {
    const normalizedStart = formatCalendarDate(draft.start);
    if (!normalizedStart) return null;

    const normalizedEndCandidate =
      formatCalendarDate(draft.end) || addDaysToCalendarDate(normalizedStart, 1);
    const startDate = parseCalendarDate(normalizedStart);
    const endDate = parseCalendarDate(normalizedEndCandidate);

    const normalizedEnd =
      startDate && endDate && endDate > startDate
        ? normalizedEndCandidate
        : addDaysToCalendarDate(normalizedStart, 1);

    return {
      ...draft,
      start: normalizedStart,
      end: normalizedEnd,
      allDay: true,
    } satisfies CalendarEventDraft;
  }

  const normalizedStart = formatCalendarDateTime(draft.start);
  if (!normalizedStart) return null;

  const normalizedEndCandidate =
    formatCalendarDateTime(draft.end) || addHoursToCalendarDateTime(normalizedStart, 1);
  const startDate = parseCalendarDate(normalizedStart);
  const endDate = parseCalendarDate(normalizedEndCandidate);
  const normalizedEnd =
    startDate && endDate && endDate > startDate
      ? normalizedEndCandidate
      : addHoursToCalendarDateTime(normalizedStart, 1);

  return {
    ...draft,
    start: normalizedStart,
    end: normalizedEnd,
    allDay: false,
  } satisfies CalendarEventDraft;
}

/**
 * 생성용 draft를 실제 CalendarEvent로 변환한다.
 */
export function createCalendarEventFromDraft(draft: CalendarEventDraft, eventId: string) {
  const normalizedDraft = normalizeDraftForSave(draft);
  if (!normalizedDraft) return null;

  return {
    id: eventId,
    title: normalizedDraft.title.trim(),
    start: normalizedDraft.start,
    end: normalizedDraft.end,
    allDay: normalizedDraft.allDay ?? true,
    memo: normalizedDraft.memo,
    spaceId: normalizedDraft.spaceId,
    colorId: normalizedDraft.colorId ?? DEFAULT_EVENT_COLOR,
    reminderMinutes: normalizedDraft.reminderMinutes,
    location: normalizedDraft.location,
  } satisfies CalendarEvent;
}

/**
 * 수정용 draft를 기존 이벤트에 병합한다.
 * 제목을 비우면 기존 제목을 유지한다.
 */
export function applyDraftToEvent(event: CalendarEvent, draft: CalendarEventDraft) {
  const normalizedDraft = normalizeDraftForSave(draft);
  if (!normalizedDraft) return null;

  return {
    ...event,
    title: normalizedDraft.title?.trim() || event.title,
    start: normalizedDraft.start ?? event.start,
    end: normalizedDraft.end ?? event.end,
    allDay: normalizedDraft.allDay ?? event.allDay,
    memo: normalizedDraft.memo,
    spaceId: normalizedDraft.spaceId,
    colorId: normalizedDraft.colorId ?? DEFAULT_EVENT_COLOR,
    reminderMinutes: normalizedDraft.reminderMinutes,
    location: normalizedDraft.location,
  } satisfies CalendarEvent;
}
