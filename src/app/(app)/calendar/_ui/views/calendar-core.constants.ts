import type { CalendarView } from '../../_model/types';
import type { MonthDensity, MonthLayoutState } from './calendar-core.types';

export const VIEW_MAP: Record<CalendarView, string> = {
  month: 'dayGridMonth',
  week: 'timeGridWeek',
  day: 'timeGridDay',
};

export const MONTH_MIN_ROW_HEIGHT: Record<MonthDensity, number> = {
  comfortable: 142,
  compact: 120,
};

export const DEFAULT_MONTH_LAYOUT: MonthLayoutState = {
  density: 'comfortable',
  rowHeight: MONTH_MIN_ROW_HEIGHT.comfortable,
  scrollbarWidth: 0,
  weekCount: 5,
};

export const MONTH_LAYOUT_EPSILON = 0.5;
export const TIMEGRID_SLOT_HEIGHT = 48;
export const TIMEGRID_SLOT_COUNT = 24;
export const CALENDAR_CHIP_STACK_HEIGHT = 22;
export const MONTH_CHIP_GAP = 8;
export const ALL_DAY_CHIP_GAP = 4;
export const ALL_DAY_SECTION_VERTICAL_PADDING = 8;
export const ALL_DAY_SECTION_MIN_ROWS = 1;
export const ALL_DAY_SECTION_MAX_ROWS = 3;
export const MONTH_MAX_VISIBLE_EVENT_ROWS = 5;

/**
 * 칩 스택 영역의 실제 높이를 계산한다.
 * 월간 칩 간격과 종일 영역 높이 계산에서 함께 사용한다.
 */
export function getVisibleChipStackHeight(rowCount: number, gap: number) {
  const visibleRows = Math.max(Math.ceil(rowCount), 1);
  const gapCount = Math.max(visibleRows - 1, 0);

  return visibleRows * CALENDAR_CHIP_STACK_HEIGHT + gapCount * gap;
}

export function getAllDaySectionHeight(rowCount: number) {
  const visibleRows = Math.min(
    Math.max(rowCount, ALL_DAY_SECTION_MIN_ROWS),
    ALL_DAY_SECTION_MAX_ROWS,
  );

  return (
    ALL_DAY_SECTION_VERTICAL_PADDING + getVisibleChipStackHeight(visibleRows, ALL_DAY_CHIP_GAP)
  );
}

export const ALL_DAY_SECTION_HEIGHT = getAllDaySectionHeight(ALL_DAY_SECTION_MIN_ROWS);
