import type {
  CalendarEvent,
  CalendarEventDraft,
  CalendarSlot,
  CalendarView,
} from '../../_model/types';

export type DateCellPopoverPayload = {
  draft: CalendarEventDraft;
  rect: DOMRect;
  placement?: 'auto' | 'cell-center';
};

export type CalendarCoreProps = {
  view: CalendarView;
  events: CalendarEvent[];
  selectedEventId?: string;
  selectedCreateDraft?: CalendarEventDraft;
  interactionLocked?: boolean;
  onTitleChange?: (title: string) => void;
  onSelectSlot?: (slot: CalendarSlot) => void;
  onClickEvent?: (payload: { event: Partial<CalendarEventDraft>; rect: DOMRect }) => void;
  onDeleteEvent?: (eventId: string) => void;
  onClickDateCell?: (payload: DateCellPopoverPayload) => void;
};

export type MonthDensity = 'comfortable' | 'compact';

export type MonthLayoutState = {
  density: MonthDensity;
  rowHeight: number;
  scrollbarWidth: number;
  weekCount: number;
};

export type VisibleDateRange = {
  start: Date;
  end: Date;
};

/**
 * FullCalendar에 렌더링용으로 쪼갠 이벤트가,
 * 원본 이벤트를 다시 찾을 수 있도록 유지하는 메타 정보이다.
 */
export type CalendarRenderEventExtendedProps = Partial<CalendarEventDraft> & {
  sourceEventId?: string;
  sourceStart?: string;
  sourceEnd?: string;
  sourceAllDay?: boolean;
};
