'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import dayGridPlugin from '@fullcalendar/daygrid';
import type {
  CalendarApi,
  DateSelectArg,
  DatesSetArg,
  DayCellContentArg,
  EventClickArg,
  EventContentArg,
} from '@fullcalendar/core';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

import {
  addDaysToCalendarDate,
  addHoursToCalendarDateTime,
  combineDateAndTime,
  formatCalendarTitle,
  formatEnglishHourLabel,
  formatKoreanWeekday,
  isSameCalendarDate,
  normalizeCalendarValue,
} from '../../_lib/date';
import type { CalendarEvent } from '../../_model/types';
import { MonthEventChip } from '../event/MonthEventChip';
import { TimeGridEventChip } from '../event/TimeGridEventChip';
import {
  ALL_DAY_SECTION_HEIGHT,
  DEFAULT_MONTH_LAYOUT,
  VIEW_MAP,
  getAllDaySectionHeight,
} from './calendar-core.constants';
import type {
  CalendarCoreProps,
  CalendarRenderEventExtendedProps,
  VisibleDateRange,
} from './calendar-core.types';
import {
  buildCalendarStyleVariables,
  buildFullCalendarEvents,
  countVisibleAllDayRows,
  getRenderedEventSource,
  isCalendarDateWithinRange,
  isSameMonthLayout,
  measureMonthLayout,
  measureTimeGridScrollbarWidth,
  resolveDateClickRect,
} from './calendar-core.utils';
import { CalendarTimeGridSlotOverlay } from './CalendarTimeGridSlotOverlay';
import './calendar.css';

/**
 * CalendarCore
 * - FullCalendar와 프로젝트 UI를 연결하는 실제 캘린더 렌더링 레이어
 * - 화면별 이벤트 변환, 날짜/이벤트 클릭 처리, DOM 기반 레이아웃 보정을 담당한다.
 */
export function CalendarCore({
  view,
  events,
  selectedEventId,
  selectedCreateDraft,
  interactionLocked = false,
  onTitleChange,
  onSelectSlot,
  onClickEvent,
  onDeleteEvent,
  onClickDateCell,
}: CalendarCoreProps) {
  // FullCalendar API와 DOM 측정에 필요한 레퍼런스
  const containerRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<FullCalendar | null>(null);
  const rafRef = useRef<number | null>(null);
  const viewSyncRafRef = useRef<number | null>(null);

  // 화면 표시용 상태
  const [now, setNow] = useState(() => new Date());
  const [monthLayout, setMonthLayout] = useState(DEFAULT_MONTH_LAYOUT);
  const [timeGridScrollbarWidth, setTimeGridScrollbarWidth] = useState(0);
  const [visibleRange, setVisibleRange] = useState<VisibleDateRange | null>(null);
  const today = now;
  const selectedCreateDate = useMemo(() => {
    return normalizeCalendarValue(selectedCreateDraft?.start, { allDay: true });
  }, [selectedCreateDraft?.start]);
  const selectedTimedStart = useMemo(() => {
    if (selectedCreateDraft?.allDay) return '';
    return normalizeCalendarValue(selectedCreateDraft?.start);
  }, [selectedCreateDraft?.allDay, selectedCreateDraft?.start]);

  // FullCalendar에 전달할 이벤트 배열을 현재 뷰 기준으로 변환한다.
  const fcEvents = useMemo(() => {
    return buildFullCalendarEvents(events, view, visibleRange);
  }, [events, view, visibleRange]);
  const showsAllDaySection = view !== 'month';

  // 주간/일간의 종일 영역 높이는 실제 보이는 일정 개수에 따라 달라진다.
  const allDaySectionHeight = useMemo(() => {
    if (view === 'month') {
      return ALL_DAY_SECTION_HEIGHT;
    }

    return getAllDaySectionHeight(countVisibleAllDayRows(events, visibleRange));
  }, [events, visibleRange, view]);

  const initialView = VIEW_MAP[view];

  const getApi = useCallback(() => {
    return calendarRef.current?.getApi();
  }, []);

  /**
   * React state의 view와 FullCalendar 내부 view를 맞춘다.
   */
  const syncView = useCallback(
    (api: CalendarApi) => {
      const nextView = VIEW_MAP[view];

      if (api.view.type === nextView) return;

      if (viewSyncRafRef.current !== null) {
        cancelAnimationFrame(viewSyncRafRef.current);
      }

      viewSyncRafRef.current = requestAnimationFrame(() => {
        viewSyncRafRef.current = null;

        const latestApi = getApi();
        if (!latestApi) return;
        if (latestApi.view.type === nextView) return;

        latestApi.changeView(nextView);
      });
    },
    [getApi, view],
  );

  /**
   * 월간 화면의 행 높이, 스크롤바 너비 등을 측정해 CSS 변수로 반영한다.
   */
  const syncMonthLayout = useCallback(() => {
    if (view !== 'month') {
      setMonthLayout((prev) => {
        return isSameMonthLayout(prev, DEFAULT_MONTH_LAYOUT) ? prev : DEFAULT_MONTH_LAYOUT;
      });
      return;
    }

    const containerEl = containerRef.current;
    if (!containerEl) return;

    const nextLayout = measureMonthLayout(containerEl);
    if (!nextLayout) return;

    setMonthLayout((prev) => {
      return isSameMonthLayout(prev, nextLayout) ? prev : nextLayout;
    });
  }, [view]);

  /**
   * 주간/일간 화면에서 스크롤바 너비를 읽어 헤더와 본문 정렬이 어긋나지 않게 맞춘다.
   */
  const syncTimeGridLayout = useCallback(() => {
    if (view === 'month') {
      setTimeGridScrollbarWidth((prev) => (prev === 0 ? prev : 0));
      return;
    }

    const containerEl = containerRef.current;
    if (!containerEl) return;

    const scrollbarWidth = measureTimeGridScrollbarWidth(containerEl, view);
    if (scrollbarWidth === null) return;

    setTimeGridScrollbarWidth((prev) => (prev === scrollbarWidth ? prev : scrollbarWidth));
  }, [view]);

  /**
   * DOM reflow가 잦은 구간은 requestAnimationFrame으로 묶어서 한 프레임 뒤에 측정한다.
   */
  const scheduleLayoutSync = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      syncMonthLayout();
      syncTimeGridLayout();
    });
  }, [syncMonthLayout, syncTimeGridLayout]);

  const handleSelect = useCallback(
    (arg: DateSelectArg) => {
      if (interactionLocked) return;

      onSelectSlot?.({
        start: arg.startStr,
        end: arg.endStr,
        allDay: arg.allDay,
      });

      arg.view.calendar.unselect();
    },
    [interactionLocked, onSelectSlot],
  );

  /**
   * 렌더링용으로 분해된 이벤트를 눌러도, 외부에는 항상 원본 일정 정보를 전달한다.
   */
  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      if (interactionLocked) return;

      const clickTarget = arg.jsEvent.target as HTMLElement | null;
      if (clickTarget?.closest('[data-calendar-event-delete]')) return;

      const ext = arg.event.extendedProps as CalendarRenderEventExtendedProps;
      const sourceEvent = getRenderedEventSource(arg.event);

      onClickEvent?.({
        rect: arg.el.getBoundingClientRect(),
        event: {
          id: sourceEvent.sourceId,
          title: arg.event.title ?? '',
          start: sourceEvent.sourceStart,
          end: sourceEvent.sourceEnd,
          allDay: sourceEvent.sourceAllDay,
          memo: ext.memo,
          spaceId: ext.spaceId,
          colorId: ext.colorId,
          reminderMinutes: ext.reminderMinutes,
          location: ext.location,
        },
      });
    },
    [interactionLocked, onClickEvent],
  );

  /**
   * 월간/종일 영역 날짜 클릭은 종일 draft 생성으로 연결한다.
   */
  const handleDateClick = useCallback(
    (arg: DateClickArg) => {
      if (interactionLocked) return;

      const rect = resolveDateClickRect(arg);
      const dateKey = normalizeCalendarValue(arg.date, { allDay: true });

      if (!dateKey) return;
      if (view !== 'month' && !arg.allDay) return;

      if (view !== 'month') {
        onClickDateCell?.({
          rect,
          draft: {
            title: '',
            start: dateKey,
            end: addDaysToCalendarDate(dateKey, 1),
            allDay: true,
          },
        });
        return;
      }

      const start = combineDateAndTime(dateKey, '22:00');
      const end = combineDateAndTime(dateKey, '23:30');

      if (!start || !end) return;

      onClickDateCell?.({
        rect,
        draft: {
          title: '',
          start,
          end,
          allDay: false,
        },
      });
    },
    [interactionLocked, onClickDateCell, view],
  );

  /**
   * 시간 셀 오버레이 클릭은 1시간짜리 시간형 draft 생성으로 연결한다.
   */
  const openTimedSlotPopover = useCallback(
    (date: Date, slotEl: HTMLElement) => {
      if (interactionLocked) return;

      const start = normalizeCalendarValue(date);
      const end = addHoursToCalendarDateTime(start, 1);

      onClickDateCell?.({
        rect: slotEl.getBoundingClientRect(),
        placement: view === 'day' ? 'cell-center' : 'auto',
        draft: {
          title: '',
          start,
          end,
          allDay: false,
        },
      });
    },
    [interactionLocked, onClickDateCell, view],
  );

  const renderTimeGridSlotOverlay = useCallback(
    (arg: DayCellContentArg) => {
      return (
        <CalendarTimeGridSlotOverlay
          date={arg.date}
          selectedStart={selectedTimedStart}
          disabled={interactionLocked}
          onClickSlot={openTimedSlotPopover}
        />
      );
    },
    [interactionLocked, openTimedSlotPopover, selectedTimedStart],
  );

  const getDayCellClassNames = useCallback(
    (date: Date) => {
      if (!selectedCreateDate) return [];

      const dateKey = normalizeCalendarValue(date, { allDay: true });
      if (dateKey !== selectedCreateDate) return [];

      if (view === 'month') {
        return ['calendar-month-cell--selected'];
      }

      return selectedCreateDraft?.allDay ? ['calendar-allday-cell--selected'] : [];
    },
    [selectedCreateDate, selectedCreateDraft?.allDay, view],
  );

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      const focusedDate = arg.view.calendar.getDate();

      setVisibleRange({
        start: new Date(arg.start.getTime()),
        end: new Date(arg.end.getTime()),
      });

      onTitleChange?.(formatCalendarTitle(focusedDate));

      window.dispatchEvent(
        new CustomEvent('calendar:focus-date', {
          detail: {
            date: focusedDate.toISOString(),
          },
        }),
      );

      scheduleLayoutSync();
    },
    [onTitleChange, scheduleLayoutSync],
  );

  const renderMonthDayContent = useCallback(
    (date: Date) => {
      const viewDate = getApi()?.getDate() ?? today;
      const isVisibleMonth =
        date.getFullYear() === viewDate.getFullYear() && date.getMonth() === viewDate.getMonth();
      const isActive = isVisibleMonth && isSameCalendarDate(date, today);

      return (
        <span
          aria-label={isActive ? `${date.getDate()}일, 오늘` : `${date.getDate()}일`}
          title={isActive ? '오늘' : undefined}
          className={
            isActive
              ? 'calendar-month-day-number calendar-month-day-number--active'
              : 'calendar-month-day-number'
          }
        >
          {date.getDate()}
        </span>
      );
    },
    [getApi, today],
  );

  const renderMonthEventContent = useCallback(
    (arg: EventContentArg) => {
      const ext = arg.event.extendedProps as CalendarRenderEventExtendedProps;
      const sourceEvent = getRenderedEventSource(arg.event);

      const monthEvent: CalendarEvent = {
        id: sourceEvent.sourceId,
        title: arg.event.title,
        start: sourceEvent.sourceStart,
        end: sourceEvent.sourceEnd,
        allDay: sourceEvent.sourceAllDay,
        memo: ext.memo,
        spaceId: ext.spaceId,
        colorId: ext.colorId,
        reminderMinutes: ext.reminderMinutes,
        location: ext.location,
      };

      return (
        <MonthEventChip
          event={monthEvent}
          onDelete={
            onDeleteEvent
              ? () => {
                  onDeleteEvent(sourceEvent.sourceId);
                }
              : undefined
          }
        />
      );
    },
    [onDeleteEvent],
  );

  const renderTimeGridEventContent = useCallback(
    (arg: EventContentArg) => {
      const ext = arg.event.extendedProps as CalendarRenderEventExtendedProps;
      const sourceEvent = getRenderedEventSource(arg.event);

      return (
        <TimeGridEventChip
          title={arg.event.title}
          colorId={ext.colorId}
          onDelete={() => {
            onDeleteEvent?.(sourceEvent.sourceId);
          }}
        />
      );
    },
    [onDeleteEvent],
  );

  const renderTimeGridHeader = useCallback(
    (date: Date) => {
      const isActive = isSameCalendarDate(date, today);

      return (
        <div className="calendar-timegrid-header-label">
          <span className="calendar-timegrid-header-label__weekday">
            {formatKoreanWeekday(date)}
          </span>
          <span
            className={
              isActive
                ? 'calendar-timegrid-header-label__date calendar-timegrid-header-label__date--active'
                : 'calendar-timegrid-header-label__date'
            }
          >
            {date.getDate()}
          </span>
        </div>
      );
    },
    [today],
  );

  const renderMonthHeader = useCallback((date: Date) => {
    return <span className="calendar-month-header-label">{formatKoreanWeekday(date)}</span>;
  }, []);

  const handleAllDayDidMount = useCallback((arg: { el: HTMLElement }) => {
    arg.el.setAttribute('data-calendar-all-day-axis', 'true');

    const section = arg.el.closest('.fc-scrollgrid-section');
    if (!(section instanceof HTMLElement)) return;

    section.setAttribute('data-calendar-all-day-section', 'true');
  }, []);

  const getEventClassNames = useCallback(
    (arg: EventContentArg) => {
      const isAllDayEvent = view === 'month' || arg.event.allDay;
      const sourceEvent = getRenderedEventSource(arg.event);

      return [
        'calendar-event',
        isAllDayEvent ? 'calendar-event--month' : 'calendar-event--timegrid',
        sourceEvent.sourceId === selectedEventId ? 'calendar-event--selected' : '',
      ].filter(Boolean);
    },
    [selectedEventId, view],
  );

  const calendarStyle = useMemo(() => {
    return buildCalendarStyleVariables({
      monthLayout,
      allDaySectionHeight,
      timeGridScrollbarWidth,
    });
  }, [allDaySectionHeight, monthLayout, timeGridScrollbarWidth]);

  // 현재 시각 강조선과 시간 라벨을 갱신하기 위한 주기적 업데이트
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 15_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // 상단 툴바에서 보내는 이동 이벤트를 FullCalendar API에 연결한다.
  useEffect(() => {
    const api = getApi();
    if (!api) return;

    const handleToday = () => api.today();
    const handlePrev = () => api.prev();
    const handleNext = () => api.next();

    window.addEventListener('calendar:today', handleToday);
    window.addEventListener('calendar:prev', handlePrev);
    window.addEventListener('calendar:next', handleNext);

    return () => {
      window.removeEventListener('calendar:today', handleToday);
      window.removeEventListener('calendar:prev', handlePrev);
      window.removeEventListener('calendar:next', handleNext);
    };
  }, [getApi]);

  useEffect(() => {
    const api = getApi();
    if (!api) return;

    syncView(api);
  }, [getApi, syncView]);

  useEffect(() => {
    const api = getApi();
    if (!api) return;

    onTitleChange?.(formatCalendarTitle(api.getDate()));
    scheduleLayoutSync();
  }, [getApi, onTitleChange, scheduleLayoutSync, view]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      scheduleLayoutSync();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [scheduleLayoutSync]);

  useEffect(() => {
    if (view !== 'month') return;
    scheduleLayoutSync();
  }, [monthLayout.rowHeight, scheduleLayoutSync, view]);

  useEffect(() => {
    if (view === 'month') return;
    scheduleLayoutSync();
  }, [allDaySectionHeight, scheduleLayoutSync, view]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      if (viewSyncRafRef.current !== null) {
        cancelAnimationFrame(viewSyncRafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-0 w-full overflow-hidden"
      data-calendar-view={view}
      data-month-density={monthLayout.density}
      data-month-week-count={monthLayout.weekCount}
      style={calendarStyle}
    >
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={false}
        height="100%"
        contentHeight="100%"
        now={now}
        expandRows={view !== 'month'}
        fixedWeekCount={true}
        nowIndicator={view !== 'month'}
        nowIndicatorSnap={false}
        selectable={Boolean(onSelectSlot)}
        selectMirror={Boolean(onSelectSlot)}
        unselectAuto
        select={handleSelect}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventContent={(arg) => {
          return view === 'month' || arg.event.allDay
            ? renderMonthEventContent(arg)
            : renderTimeGridEventContent(arg);
        }}
        eventClassNames={getEventClassNames}
        eventDisplay="block"
        displayEventTime={false}
        events={fcEvents}
        dayCellClassNames={(arg) => getDayCellClassNames(arg.date)}
        dayCellContent={
          view === 'month'
            ? (arg) => {
                return renderMonthDayContent(arg.date);
              }
            : (arg) => {
                return renderTimeGridSlotOverlay(arg);
              }
        }
        dayHeaderContent={
          view === 'month'
            ? (arg) => {
                return renderMonthHeader(arg.date);
              }
            : (arg) => {
                return renderTimeGridHeader(arg.date);
              }
        }
        datesSet={handleDatesSet}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        scrollTime="00:00:00"
        scrollTimeReset={false}
        slotDuration="01:00:00"
        slotLabelInterval="01:00:00"
        slotLabelContent={
          view === 'month'
            ? undefined
            : (arg) => {
                if (arg.date.getHours() === 0) return null;

                const isActiveHour =
                  isCalendarDateWithinRange(now, arg.view.activeStart, arg.view.activeEnd) &&
                  arg.date.getHours() === now.getHours();

                return (
                  <span
                    className={
                      isActiveHour
                        ? 'calendar-timegrid-axis-label calendar-timegrid-axis-label--active'
                        : 'calendar-timegrid-axis-label'
                    }
                  >
                    {formatEnglishHourLabel(arg.date)}
                  </span>
                );
              }
        }
        allDaySlot={showsAllDaySection}
        allDayText="종일 일정"
        allDayClassNames={
          !showsAllDaySection
            ? undefined
            : () => {
                return ['calendar-timegrid-allday-axis-cell'];
              }
        }
        allDayContent={
          !showsAllDaySection
            ? undefined
            : (arg) => {
                return <span className="calendar-timegrid-allday-label">{arg.text}</span>;
              }
        }
        allDayDidMount={showsAllDaySection ? handleAllDayDidMount : undefined}
        dayMaxEvents={false}
        dayMaxEventRows={false}
        slotEventOverlap={false}
        locale="ko"
      />
    </div>
  );
}
