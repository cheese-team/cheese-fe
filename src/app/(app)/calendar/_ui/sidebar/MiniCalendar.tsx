'use client';

import { useEffect, useMemo, useState } from 'react';

import { isSameCalendarDate, parseCalendarDate } from '../../_lib/date';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const GRID_DAYS = 42;

type FocusDateDetail = {
  date?: string;
};

function getMonthGridStart(date: Date) {
  const firstDateOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(firstDateOfMonth);
  start.setDate(firstDateOfMonth.getDate() - firstDateOfMonth.getDay());
  return start;
}

function buildMonthGrid(date: Date) {
  const start = getMonthGridStart(date);

  return Array.from({ length: GRID_DAYS }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return current;
  });
}

export function MiniCalendar() {
  const [focusedDate, setFocusedDate] = useState<Date>(() => new Date());
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const handleFocusDate = (event: Event) => {
      const nextDate = parseCalendarDate((event as CustomEvent<FocusDateDetail>).detail?.date);
      if (!nextDate) return;

      setFocusedDate(nextDate);
    };

    window.addEventListener('calendar:focus-date', handleFocusDate as EventListener);

    return () => {
      window.removeEventListener('calendar:focus-date', handleFocusDate as EventListener);
    };
  }, []);

  const days = useMemo(() => buildMonthGrid(focusedDate), [focusedDate]);

  return (
    <section aria-label="미니 캘린더" className="w-full">
      <div className="mb-3 text-sm font-semibold text-gray-800">
        {focusedDate.getFullYear()}년 {focusedDate.getMonth() + 1}월
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center text-[11px] leading-none text-gray-500">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-y-2 text-center">
        {days.map((date) => {
          const isCurrentMonth = date.getMonth() === focusedDate.getMonth();
          const isToday = isCurrentMonth && isSameCalendarDate(date, today);

          return (
            <div key={date.toISOString()} className="flex h-6 items-center justify-center">
              <span
                className={[
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-[6px] px-[5px] text-[13px] leading-none font-medium',
                  isToday
                    ? 'bg-secondary-500 text-bg-white'
                    : isCurrentMonth
                      ? 'text-gray-700'
                      : 'text-gray-400',
                ].join(' ')}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
