'use client';

import { useState } from 'react';

import {
  dropdownOptionStyle,
  dropdownOptionInteractiveStyle,
} from '@/components/common/styles/dropdown';
import { cn } from '@/lib/cn';
import { toTimeInputValue } from '../../_lib/date';
import { CalendarFieldPopover } from './CalendarFieldPopover';
import { getTimeLabel, getTimeParts, to24HourTime } from './calendar-picker.utils';

const PERIODS = ['오전', '오후'];
const HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

function TimeColumn({
  label,
  options,
  value,
  onChange,
  autoFocus = false,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-2 text-center text-[11px] text-gray-500">{label}</p>
      <div
        role="listbox"
        aria-label={label}
        className="h-[180px] overflow-y-auto overscroll-contain [scrollbar-width:thin]"
      >
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={option === value}
            tabIndex={option === value ? 0 : -1}
            data-picker-autofocus={autoFocus && option === value ? '' : undefined}
            onClick={() => onChange(option)}
            onKeyDown={(event) => {
              const nextIndex =
                event.key === 'ArrowDown'
                  ? (index + 1) % options.length
                  : event.key === 'ArrowUp'
                    ? (index - 1 + options.length) % options.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? options.length - 1
                        : -1;
              if (nextIndex < 0) return;
              event.preventDefault();
              event.stopPropagation();
              onChange(options[nextIndex]);
              const nextButton = event.currentTarget.parentElement?.children[nextIndex] as
                | HTMLButtonElement
                | undefined;
              nextButton?.focus({ preventScroll: true });
              nextButton?.scrollIntoView({ block: 'nearest' });
            }}
            className={cn(
              dropdownOptionStyle,
              dropdownOptionInteractiveStyle,
              'focus-visible:ring-secondary-600 mb-1 h-7 justify-center px-1 text-center focus-visible:ring-2 focus-visible:ring-inset',
              option === value && 'bg-gray-200 font-semibold text-gray-950',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function TimePanel({ value, onSelect }: { value: string; onSelect: (value: string) => void }) {
  const [time, setTime] = useState(value || '09:00');
  const { period, hour, minute } = getTimeParts(time);

  return (
    <>
      <div className="flex gap-2">
        <TimeColumn
          label="오전·오후"
          options={PERIODS}
          value={period}
          onChange={(next) => setTime(to24HourTime(next, hour, minute))}
          autoFocus
        />
        <TimeColumn
          label="시"
          options={HOURS}
          value={hour}
          onChange={(next) => setTime(to24HourTime(period, next, minute))}
        />
        <TimeColumn
          label="분"
          options={MINUTES}
          value={minute}
          onChange={(next) => setTime(to24HourTime(period, hour, next))}
        />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
        <span aria-live="polite" className="text-[12px] font-medium">
          {getTimeLabel(time)}
        </span>
        <button
          type="button"
          onClick={() => onSelect(time)}
          className="bg-secondary-600 hover:bg-secondary-700 focus-visible:ring-secondary-700 rounded-[5px] px-3 py-1.5 text-[12px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          확인
        </button>
      </div>
    </>
  );
}

export function CalendarTimeField({
  value,
  label,
  onChange,
}: {
  value?: string;
  label: string;
  onChange: (value: string) => void;
}) {
  const time = toTimeInputValue(value);
  return (
    <CalendarFieldPopover label={label} displayValue={getTimeLabel(time)} width={236}>
      {(close) => (
        <TimePanel
          value={time}
          onSelect={(next) => {
            onChange(next);
            close();
          }}
        />
      )}
    </CalendarFieldPopover>
  );
}
