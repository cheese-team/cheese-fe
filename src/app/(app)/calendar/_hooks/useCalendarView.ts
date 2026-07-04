'use client';

import { useCallback, useState } from 'react';

import type { CalendarView } from '@/app/(app)/calendar/_model/types';

type UseCalendarViewOptions = {
  initialView?: CalendarView;
  initialTitle?: string;
};

type CalendarNavigationEventName = 'calendar:today' | 'calendar:prev' | 'calendar:next';

function dispatchCalendarNavigationEvent(name: CalendarNavigationEventName) {
  window.dispatchEvent(new CustomEvent(name));
}

/**
 * 상단 툴바에 필요한 캘린더 뷰 상태를 한 곳에 모아 둔 훅.
 * 화면 컴포넌트에서는 이 훅이 반환하는 값만 연결하면 된다.
 */
export function useCalendarView(options?: UseCalendarViewOptions) {
  const [view, setView] = useState<CalendarView>(options?.initialView ?? 'month');
  const [title, setTitle] = useState(options?.initialTitle ?? '');

  const moveToToday = useCallback(() => {
    dispatchCalendarNavigationEvent('calendar:today');
  }, []);

  const moveToPrev = useCallback(() => {
    dispatchCalendarNavigationEvent('calendar:prev');
  }, []);

  const moveToNext = useCallback(() => {
    dispatchCalendarNavigationEvent('calendar:next');
  }, []);

  return {
    view,
    setView,
    title,
    setTitle,
    moveToToday,
    moveToPrev,
    moveToNext,
  };
}
