'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { ChevronIcon } from '@/assets/icons/calendar/ChevronIcon';
import { cn } from '@/lib/cn';
import { formatCalendarDate, formatDisplayDate, parseCalendarDate } from '../../_lib/date';
import { CalendarFieldPopover } from './CalendarFieldPopover';
import { getMonthDays, moveMonth } from './calendar-picker.utils';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function DatePanel({ value, onSelect }: { value?: string; onSelect: (date: string) => void }) {
  const [focusedDate, setFocusedDate] = useState(() => parseCalendarDate(value) ?? new Date());
  const gridRef = useRef<HTMLDivElement>(null);
  const focusGrid = useRef(false);
  const selectedValue = formatCalendarDate(value);
  const focusedValue = formatCalendarDate(focusedDate);
  const today = formatCalendarDate(new Date());
  const days = getMonthDays(focusedDate);

  useLayoutEffect(() => {
    if (!focusGrid.current) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusedValue}"]`)?.focus();
    focusGrid.current = false;
  }, [focusedValue]);

  const handleDateKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const next = new Date(date);
    switch (event.key) {
      case 'ArrowLeft':
        next.setDate(date.getDate() - 1);
        break;
      case 'ArrowRight':
        next.setDate(date.getDate() + 1);
        break;
      case 'ArrowUp':
        next.setDate(date.getDate() - 7);
        break;
      case 'ArrowDown':
        next.setDate(date.getDate() + 7);
        break;
      case 'Home':
        next.setDate(date.getDate() - date.getDay());
        break;
      case 'End':
        next.setDate(date.getDate() + 6 - date.getDay());
        break;
      case 'PageUp':
        next.setTime(moveMonth(date, -1).getTime());
        break;
      case 'PageDown':
        next.setTime(moveMonth(date, 1).getTime());
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    focusGrid.current = true;
    setFocusedDate(next);
  };

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <span aria-live="polite" className="text-[14px] font-semibold text-gray-900">
          {focusedDate.getFullYear()}년 {focusedDate.getMonth() + 1}월
        </span>
        <div className="flex gap-1">
          {([-1, 1] as const).map((amount) => (
            <button
              key={amount}
              type="button"
              aria-label={amount < 0 ? '이전 달' : '다음 달'}
              onClick={() => setFocusedDate(moveMonth(focusedDate, amount))}
              className="flex h-7 w-7 items-center justify-center rounded-[5px] outline-none hover:bg-gray-200 focus-visible:bg-gray-200"
            >
              <ChevronIcon direction={amount < 0 ? 'left' : 'right'} className="h-3 w-2" />
            </button>
          ))}
        </div>
      </div>
      <div
        ref={gridRef}
        role="grid"
        aria-label={`${focusedDate.getFullYear()}년 ${focusedDate.getMonth() + 1}월 날짜`}
      >
        <div role="row" className="mb-1 grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              role="columnheader"
              className="text-center text-[11px] leading-7 text-gray-500"
            >
              {day}
            </span>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, week) => (
          <div key={week} role="row" className="grid grid-cols-7 gap-y-1">
            {days.slice(week * 7, week * 7 + 7).map((date) => {
              const dateValue = formatCalendarDate(date);
              const selected = dateValue === selectedValue;
              return (
                <div
                  key={dateValue}
                  role="gridcell"
                  aria-selected={selected}
                  className="flex justify-center"
                >
                  <button
                    type="button"
                    data-date={dateValue}
                    data-picker-autofocus={dateValue === focusedValue ? '' : undefined}
                    tabIndex={dateValue === focusedValue ? 0 : -1}
                    aria-label={`${date.getFullYear()}년 ${formatDisplayDate(dateValue)}`}
                    aria-current={dateValue === today ? 'date' : undefined}
                    onKeyDown={(event) => handleDateKeyDown(event, date)}
                    onClick={() => onSelect(dateValue)}
                    className={cn(
                      'focus-visible:ring-secondary-600 h-8 w-8 rounded-[5px] text-[12px] font-medium transition-colors outline-none hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-inset',
                      date.getMonth() !== focusedDate.getMonth() && 'text-gray-400',
                      dateValue === today && 'text-secondary-700',
                      selected && 'bg-gray-200 font-semibold text-gray-950',
                    )}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-2">
        <span className="text-[11px] text-gray-500">날짜를 선택해 주세요</span>
        <button
          type="button"
          onClick={() => onSelect(today)}
          className="text-secondary-700 rounded-[5px] px-2 py-1 text-[12px] font-medium outline-none hover:bg-gray-200 focus-visible:bg-gray-200"
        >
          오늘
        </button>
      </div>
    </>
  );
}

export function CalendarDateField({
  value,
  label,
  onChange,
}: {
  value?: string;
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <CalendarFieldPopover
      label={label}
      displayValue={formatDisplayDate(value) || '날짜 선택'}
      width={260}
    >
      {(close) => (
        <DatePanel
          value={value}
          onSelect={(date) => {
            onChange(date);
            close();
          }}
        />
      )}
    </CalendarFieldPopover>
  );
}
