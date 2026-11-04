'use client';

import { useId, useRef } from 'react';

import { cn } from '@/lib/cn';

type DatePickerProps = {
  value: string;
  label?: string;
  min?: string;
  onChange: (value: string) => void;
  formatDisplayValue?: (value: string) => string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
};

export default function DatePicker({
  value,
  label = '날짜',
  min,
  placeholder = '날짜 선택',
  formatDisplayValue,
  onChange,
  className,
  buttonClassName,
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  const openPicker = () => {
    const input = inputRef.current;

    if (!input) return;

    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.click();
      }
    } catch {
      input.focus();
    }
  };

  const displayValue = value && formatDisplayValue ? formatDisplayValue(value) : value;

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        aria-label={`${label} 선택${displayValue ? `: ${displayValue}` : ''}`}
        aria-controls={inputId}
        onClick={openPicker}
        className={cn('flex w-full items-center text-left', buttonClassName)}
      >
        <span className={value ? 'text-gray-700' : 'text-gray-500'}>
          {(displayValue ?? value) || placeholder}
        </span>
      </button>

      <input
        ref={inputRef}
        id={inputId}
        aria-label={label}
        type="date"
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        tabIndex={-1}
      />
    </div>
  );
}
