const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_DATETIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function hasTimePart(value?: string | null) {
  return Boolean(value && value.includes('T'));
}

export function parseCalendarDate(value?: string | number | Date | null) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  if (typeof value === 'number') {
    const parsedNumberDate = new Date(value);
    return Number.isNaN(parsedNumberDate.getTime()) ? null : parsedNumberDate;
  }

  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(value);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const localDateTimeMatch = LOCAL_DATETIME_PATTERN.exec(value);
  if (localDateTimeMatch) {
    const [, year, month, day, hour, minute, second = '0'] = localDateTimeMatch;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    );
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatCalendarDate(value?: string | number | Date | null) {
  const date = parseCalendarDate(value);
  if (!date) return '';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatCalendarDateTime(
  value?: string | number | Date | null,
  options?: { seconds?: boolean },
) {
  const date = parseCalendarDate(value);
  if (!date) return '';

  const base = `${formatCalendarDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (options?.seconds === false) {
    return base;
  }

  return `${base}:${pad(date.getSeconds())}`;
}

export function normalizeCalendarValue(
  value?: string | number | Date | null,
  options?: { allDay?: boolean; seconds?: boolean },
) {
  if (options?.allDay) {
    return formatCalendarDate(value);
  }

  return formatCalendarDateTime(value, options);
}

export function addDaysToCalendarDate(value: string | number | Date, amount: number) {
  const date = parseCalendarDate(value);
  if (!date) return '';

  date.setDate(date.getDate() + amount);
  return formatCalendarDate(date);
}

export function addHoursToCalendarDateTime(value: string | number | Date, amount: number) {
  const date = parseCalendarDate(value);
  if (!date) return '';

  date.setHours(date.getHours() + amount);
  return formatCalendarDateTime(date);
}

export function toDateInputValue(value?: string | null) {
  return formatCalendarDate(value);
}

export function toTimeInputValue(value?: string | null) {
  const date = parseCalendarDate(value);
  if (!date) return '';

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function combineDateAndTime(dateValue?: string | null, timeValue?: string | null) {
  const normalizedDate = formatCalendarDate(dateValue);
  if (!normalizedDate || !timeValue) return '';

  const [hour = '00', minute = '00'] = timeValue.split(':');
  return `${normalizedDate}T${hour}:${minute}:00`;
}

export function formatDisplayDate(value?: string | null) {
  const date = parseCalendarDate(value);
  if (!date) return '';

  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday})`;
}

export function formatCalendarTitle(value?: string | number | Date | null) {
  const date = parseCalendarDate(value);
  if (!date) return '';

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

export function formatKoreanWeekday(value?: string | number | Date | null) {
  const date = parseCalendarDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date);
}

export function formatEnglishHourLabel(value?: string | number | Date | null) {
  const date = parseCalendarDate(value);
  if (!date) return '';

  const hours = date.getHours();
  const meridiem = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 || 12;

  return `${hour12} ${meridiem}`;
}

export function isSameCalendarDate(
  a?: string | number | Date | null,
  b?: string | number | Date | null,
) {
  const left = parseCalendarDate(a);
  const right = parseCalendarDate(b);

  if (!left || !right) return false;

  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
