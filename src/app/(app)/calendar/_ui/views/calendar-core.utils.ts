import type { CSSProperties } from 'react';

import type { EventApi, EventInput } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';

import {
  addDaysToCalendarDate,
  addHoursToCalendarDateTime,
  normalizeCalendarValue,
  parseCalendarDate,
} from '../../_lib/date';
import type { CalendarEvent, CalendarView } from '../../_model/types';
import {
  ALL_DAY_CHIP_GAP,
  MONTH_CHIP_GAP,
  MONTH_LAYOUT_EPSILON,
  MONTH_MIN_ROW_HEIGHT,
  TIMEGRID_SLOT_HEIGHT,
} from './calendar-core.constants';
import type {
  CalendarRenderEventExtendedProps,
  MonthLayoutState,
  VisibleDateRange,
} from './calendar-core.types';

function startOfCalendarDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfCalendarHour(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0);
}

export function getAllDayEventEndDate(event: Pick<CalendarEvent, 'start' | 'end'>) {
  const startDate = parseCalendarDate(event.start);
  if (!startDate) return null;

  const endDate = parseCalendarDate(event.end);
  if (endDate && endDate > startDate) {
    return startOfCalendarDay(endDate);
  }

  const fallbackEnd = parseCalendarDate(addDaysToCalendarDate(event.start, 1));
  return fallbackEnd ? startOfCalendarDay(fallbackEnd) : null;
}

/**
 * 현재 보이는 범위에서 종일 일정이 최대 몇 줄까지 필요한지 계산한다.
 */
export function countVisibleAllDayRows(events: CalendarEvent[], range: VisibleDateRange | null) {
  const counts = new Map<string, number>();
  let maxRows = 0;

  const visibleStart = range ? startOfCalendarDay(range.start) : null;
  const visibleEnd = range ? startOfCalendarDay(range.end) : null;

  events.forEach((event) => {
    if (!event.allDay) return;

    const startDate = parseCalendarDate(event.start);
    const endDate = getAllDayEventEndDate(event);

    if (!startDate || !endDate) return;

    const eventStart = startOfCalendarDay(startDate);
    const renderStart = visibleStart && eventStart < visibleStart ? visibleStart : eventStart;
    const renderEnd = visibleEnd && endDate > visibleEnd ? visibleEnd : endDate;

    if (renderEnd <= renderStart) return;

    for (
      let cursor = new Date(renderStart.getTime());
      cursor < renderEnd;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const dateKey = normalizeCalendarValue(cursor, { allDay: true });
      if (!dateKey) continue;

      const nextCount = (counts.get(dateKey) ?? 0) + 1;
      counts.set(dateKey, nextCount);
      maxRows = Math.max(maxRows, nextCount);
    }
  });

  return Math.max(maxRows, 1);
}

function createCalendarEventInput(
  event: CalendarEvent,
  overrides?: {
    id?: string;
    start?: string;
    end?: string;
    allDay?: boolean;
  },
): EventInput {
  return {
    id: overrides?.id ?? event.id,
    title: event.title,
    start: overrides?.start ?? event.start,
    end: overrides?.end ?? event.end,
    allDay: overrides?.allDay ?? event.allDay,
    extendedProps: {
      memo: event.memo,
      spaceId: event.spaceId,
      colorId: event.colorId,
      reminderMinutes: event.reminderMinutes,
      location: event.location,
      sourceEventId: event.id,
      sourceStart: event.start,
      sourceEnd: event.end,
      sourceAllDay: Boolean(event.allDay),
    } satisfies CalendarRenderEventExtendedProps,
  };
}

function splitAllDayEventByDay(event: CalendarEvent, range: VisibleDateRange | null) {
  if (!event.allDay) {
    return [createCalendarEventInput(event)];
  }

  const startDate = parseCalendarDate(event.start);
  const endDate = getAllDayEventEndDate(event);

  if (!startDate || !endDate) {
    return [createCalendarEventInput(event)];
  }

  const visibleStart = range ? startOfCalendarDay(range.start) : startOfCalendarDay(startDate);
  const visibleEnd = range ? startOfCalendarDay(range.end) : endDate;
  const renderStart =
    startOfCalendarDay(startDate) > visibleStart ? startOfCalendarDay(startDate) : visibleStart;
  const renderEnd = endDate < visibleEnd ? endDate : visibleEnd;

  if (renderEnd <= renderStart) {
    return [];
  }

  const renderedEvents: EventInput[] = [];

  for (
    let cursor = new Date(renderStart.getTime());
    cursor < renderEnd;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const dateKey = normalizeCalendarValue(cursor, { allDay: true });
    if (!dateKey) continue;

    renderedEvents.push(
      createCalendarEventInput(event, {
        id: `${event.id}__allday__${dateKey}`,
        start: dateKey,
        end: addDaysToCalendarDate(dateKey, 1),
        allDay: true,
      }),
    );
  }

  return renderedEvents;
}

function getTimedEventEndDate(event: Pick<CalendarEvent, 'start' | 'end'>) {
  const startDate = parseCalendarDate(event.start);
  if (!startDate) return null;

  const endDate = parseCalendarDate(event.end);
  if (endDate && endDate > startDate) {
    return endDate;
  }

  const fallbackEnd = parseCalendarDate(addHoursToCalendarDateTime(event.start, 1));
  return fallbackEnd && fallbackEnd > startDate ? fallbackEnd : null;
}

/**
 * 시간형 일정을 1시간 단위 칩으로 분해한다.
 * 이렇게 분해하면 주간/일간 화면에서 점유하는 모든 슬롯에 칩이 표시된다.
 */
function splitTimedEventByHour(event: CalendarEvent, range: VisibleDateRange | null) {
  if (event.allDay) {
    return [createCalendarEventInput(event)];
  }

  const startDate = parseCalendarDate(event.start);
  const endDate = getTimedEventEndDate(event);

  if (!startDate || !endDate) {
    return [createCalendarEventInput(event)];
  }

  const visibleStart = range ? range.start : startDate;
  const visibleEnd = range ? range.end : endDate;
  const renderStart = startDate > visibleStart ? startDate : visibleStart;
  const renderEnd = endDate < visibleEnd ? endDate : visibleEnd;

  if (renderEnd <= renderStart) {
    return [];
  }

  const renderedEvents: EventInput[] = [];

  for (
    let cursor = startOfCalendarHour(renderStart);
    cursor < renderEnd;
    cursor.setHours(cursor.getHours() + 1, 0, 0, 0)
  ) {
    const slotStart = new Date(cursor.getTime());
    const slotEnd = new Date(cursor.getTime());
    slotEnd.setHours(slotEnd.getHours() + 1, 0, 0, 0);

    if (slotEnd <= renderStart) continue;

    const slotKey = normalizeCalendarValue(slotStart, { seconds: false });
    const normalizedStart = normalizeCalendarValue(slotStart);
    const normalizedEnd = normalizeCalendarValue(slotEnd);

    if (!slotKey || !normalizedStart || !normalizedEnd) continue;

    renderedEvents.push(
      createCalendarEventInput(event, {
        id: `${event.id}__timed__${slotKey}`,
        start: normalizedStart,
        end: normalizedEnd,
        allDay: false,
      }),
    );
  }

  return renderedEvents.length > 0 ? renderedEvents : [createCalendarEventInput(event)];
}

/**
 * 현재 화면(view)에 맞게 원본 이벤트를 FullCalendar 렌더링 데이터로 변환한다.
 */
export function buildFullCalendarEvents(
  events: CalendarEvent[],
  view: CalendarView,
  visibleRange: VisibleDateRange | null,
) {
  return events.flatMap((event) => {
    if (event.allDay) {
      return splitAllDayEventByDay(event, visibleRange);
    }

    if (view === 'month') {
      return [createCalendarEventInput(event)];
    }

    return splitTimedEventByHour(event, visibleRange);
  });
}

/**
 * 쪼개진 렌더링 이벤트를 다시 원본 일정 기준 정보로 복원한다.
 */
export function getRenderedEventSource(event: EventApi) {
  const ext = event.extendedProps as CalendarRenderEventExtendedProps;
  const sourceAllDay = ext.sourceAllDay ?? event.allDay;

  return {
    sourceId: ext.sourceEventId ?? event.id,
    sourceStart: ext.sourceStart ?? normalizeCalendarValue(event.start, { allDay: sourceAllDay }),
    sourceEnd:
      ext.sourceEnd ?? normalizeCalendarValue(event.end ?? event.start, { allDay: sourceAllDay }),
    sourceAllDay,
  };
}

/**
 * 날짜 클릭 시 가능한 한 실제 클릭한 셀의 사각형을 찾아 팝오버 위치 계산에 사용한다.
 */
export function resolveDateClickRect(arg: DateClickArg) {
  const target = arg.jsEvent.target as HTMLElement | null;

  if (target) {
    const slotLane = target.closest('.fc-timegrid-slot-lane');
    if (slotLane instanceof HTMLElement) {
      return slotLane.getBoundingClientRect();
    }

    const tableCell = target.closest('td');
    if (tableCell instanceof HTMLElement) {
      return tableCell.getBoundingClientRect();
    }
  }

  return arg.dayEl.getBoundingClientRect();
}

export function isCalendarDateWithinRange(date: Date, start: Date, end: Date) {
  const time = date.getTime();
  return time >= start.getTime() && time < end.getTime();
}

export function isSameMonthLayout(left: MonthLayoutState, right: MonthLayoutState) {
  const hasSameDensity = left.density === right.density;
  const hasSameRowHeight = Math.abs(left.rowHeight - right.rowHeight) < MONTH_LAYOUT_EPSILON;
  const hasSameScrollbarWidth = left.scrollbarWidth === right.scrollbarWidth;
  const hasSameWeekCount = left.weekCount === right.weekCount;

  return hasSameDensity && hasSameRowHeight && hasSameScrollbarWidth && hasSameWeekCount;
}

/**
 * 월간 뷰의 실제 DOM 크기를 읽어 행 높이와 스크롤바 너비를 계산한다.
 */
export function measureMonthLayout(containerEl: HTMLElement) {
  const monthViewEl = containerEl.querySelector('.fc-dayGridMonth-view');
  const monthScrollGrid = monthViewEl?.querySelector('.fc-scrollgrid');
  const monthHeader = monthViewEl?.querySelector('.fc-col-header');
  const monthBody = monthViewEl?.querySelector('.fc-daygrid-body');
  const monthBodyScroller =
    monthBody instanceof HTMLElement ? monthBody.closest('.fc-scroller') : null;
  const weekRows = monthViewEl?.querySelectorAll('.fc-daygrid-body tbody tr');

  if (
    !(monthViewEl instanceof HTMLElement) ||
    !(monthBody instanceof HTMLElement) ||
    !(monthBodyScroller instanceof HTMLElement) ||
    !weekRows ||
    weekRows.length === 0
  ) {
    return null;
  }

  const currentMonthCell = monthViewEl.querySelector(
    '.fc-daygrid-day:not(.fc-day-other)[data-date]',
  );
  const currentMonthDate =
    currentMonthCell instanceof HTMLElement
      ? parseCalendarDate(currentMonthCell.dataset.date)
      : null;

  const naturalWeekCount = currentMonthDate
    ? Math.ceil(
        (new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay() +
          new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate()) /
          7,
      )
    : weekRows.length;
  const weekCount = Math.max(Math.min(naturalWeekCount, 6), 5);
  const monthViewHeight = monthViewEl.getBoundingClientRect().height;
  const scrollGridHeight =
    monthScrollGrid instanceof HTMLElement ? monthScrollGrid.getBoundingClientRect().height : 0;
  const headerHeight =
    monthHeader instanceof HTMLElement ? monthHeader.getBoundingClientRect().height : 0;
  const bodyViewportHeight = Math.max(monthViewHeight, scrollGridHeight) - headerHeight;

  if (bodyViewportHeight <= 0) return null;

  const rowHeight = Math.round((bodyViewportHeight / weekCount) * 100) / 100;
  const density = rowHeight >= MONTH_MIN_ROW_HEIGHT.comfortable ? 'comfortable' : 'compact';
  const scrollbarWidth = Math.max(monthBodyScroller.offsetWidth - monthBodyScroller.clientWidth, 0);

  return {
    density,
    rowHeight,
    scrollbarWidth,
    weekCount,
  } satisfies MonthLayoutState;
}

export function measureTimeGridScrollbarWidth(containerEl: HTMLElement, view: CalendarView) {
  if (view === 'month') return 0;

  const timeGridViewEl = containerEl.querySelector(
    view === 'week' ? '.fc-timeGridWeek-view' : '.fc-timeGridDay-view',
  );
  const timeGridBody = timeGridViewEl?.querySelector('.fc-timegrid-body');
  const bodyScroller =
    timeGridBody instanceof HTMLElement ? timeGridBody.closest('.fc-scroller') : null;

  if (!(bodyScroller instanceof HTMLElement)) return null;

  return Math.max(bodyScroller.offsetWidth - bodyScroller.clientWidth, 0);
}

/**
 * CSS custom property를 한 곳에서 만들어 뷰 컴포넌트에 전달한다.
 */
export function buildCalendarStyleVariables(options: {
  monthLayout: MonthLayoutState;
  allDaySectionHeight: number;
  timeGridScrollbarWidth: number;
}) {
  const { monthLayout, allDaySectionHeight, timeGridScrollbarWidth } = options;

  return {
    '--calendar-month-day-height': `${monthLayout.rowHeight}px`,
    '--calendar-month-week-count': `${monthLayout.weekCount}`,
    '--calendar-scrollbar-width': `${monthLayout.scrollbarWidth}px`,
    '--calendar-month-chip-gap': `${MONTH_CHIP_GAP}px`,
    '--calendar-allday-chip-gap': `${ALL_DAY_CHIP_GAP}px`,
    '--calendar-time-slot-height': `${TIMEGRID_SLOT_HEIGHT}px`,
    '--calendar-timegrid-scrollbar-width': `${timeGridScrollbarWidth}px`,
    '--calendar-allday-section-height': `${allDaySectionHeight}px`,
  } as CSSProperties;
}
