import { hasTimePart, parseCalendarDate, toTimeInputValue } from '../../calendar/_lib/date';
import type { CalendarEvent } from '../../calendar/_model/types';

function getStartOfToday() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getDayDiff(from: Date, to: Date) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round((to.getTime() - from.getTime()) / millisecondsPerDay);
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function getUpcomingEvents(events: CalendarEvent[], limit?: number) {
  const now = new Date();
  const todayStart = getStartOfToday();

  const upcomingEvents = events
    .filter((event) => {
      const start = parseCalendarDate(event.start);

      if (!start) {
        return false;
      }

      if (event.allDay || !hasTimePart(event.start)) {
        const eventDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

        return eventDay >= todayStart;
      }

      return start >= now;
    })
    .sort((left, right) => {
      const leftStart = parseCalendarDate(left.start)?.getTime() ?? 0;
      const rightStart = parseCalendarDate(right.start)?.getTime() ?? 0;

      return leftStart - rightStart;
    });

  if (typeof limit === 'number') {
    return upcomingEvents.slice(0, limit);
  }

  return upcomingEvents;
}

export function getThisWeekRemainingEvents(events: CalendarEvent[]) {
  const now = new Date();
  const todayStart = getStartOfToday();
  const dayOfWeek = todayStart.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + daysUntilSunday);
  weekEnd.setHours(23, 59, 59, 999);

  return getUpcomingEvents(events).filter((event) => {
    const start = parseCalendarDate(event.start);

    if (!start) {
      return false;
    }

    if (event.allDay || !hasTimePart(event.start)) {
      const eventDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      return eventDay >= todayStart && eventDay <= weekEnd;
    }

    return start >= now && start <= weekEnd;
  });
}

export function getThisWeekEvents(events: CalendarEvent[]) {
  const todayStart = getStartOfToday();
  const dayOfWeek = todayStart.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - daysFromMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return events.filter((event) => {
    const start = parseCalendarDate(event.start);

    if (!start) {
      return false;
    }

    return start >= weekStart && start <= weekEnd;
  });
}

export function getBusiestWeekdayLabel(events: CalendarEvent[]) {
  const weekEvents = getThisWeekEvents(events);

  if (weekEvents.length === 0) {
    return null;
  }

  const counts = new Map<number, number>();

  for (const event of weekEvents) {
    const start = parseCalendarDate(event.start);

    if (!start) {
      continue;
    }

    const weekday = start.getDay();
    counts.set(weekday, (counts.get(weekday) ?? 0) + 1);
  }

  let busiestWeekday = -1;
  let maxCount = 0;

  for (const [weekday, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      busiestWeekday = weekday;
    }
  }

  if (busiestWeekday < 0) {
    return null;
  }

  const sampleDate = new Date();
  const currentWeekday = sampleDate.getDay();
  sampleDate.setDate(sampleDate.getDate() + (busiestWeekday - currentWeekday));

  return new Intl.DateTimeFormat('ko-KR', { weekday: 'long' }).format(sampleDate);
}

export function formatDashboardDeadlineLabel(event: CalendarEvent) {
  const start = parseCalendarDate(event.start);

  if (!start) {
    return '';
  }

  const todayStart = getStartOfToday();
  const eventDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const dayDiff = getDayDiff(todayStart, eventDay);

  if (dayDiff === 0 && hasTimePart(event.start)) {
    return `오늘 ${toTimeInputValue(event.start)}`;
  }

  if (dayDiff === 0) {
    return '오늘';
  }

  if (dayDiff > 0) {
    return `D-${dayDiff}`;
  }

  return '지난 일정';
}

export function formatDashboardTimeRange(event: CalendarEvent) {
  const start = parseCalendarDate(event.start);

  if (!start) {
    return '';
  }

  if (event.allDay || !hasTimePart(event.start)) {
    const month = MONTH_LABELS[start.getMonth()];

    return `${month} ${String(start.getDate()).padStart(2, '0')}, 00:00`;
  }

  const endLabel = toTimeInputValue(event.end) || toTimeInputValue(event.start);

  return `${toTimeInputValue(event.start)} - ${endLabel}`;
}

export function getDashboardEventLocation(event: CalendarEvent) {
  return event.location?.trim() || event.url?.trim() || '';
}
