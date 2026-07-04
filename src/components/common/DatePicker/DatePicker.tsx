'use client';

import { useRef } from 'react';

import { cn } from '@/lib/cn';

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  formatDisplayValue?: (value: string) => string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
};

export default function DatePicker({
  value,
  placeholder = '날짜 선택',
  formatDisplayValue,
  onChange,
  className,
  buttonClassName,
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    if (!inputRef.current) return;

    if ('showPicker' in HTMLInputElement.prototype) {
      (inputRef.current as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
      return;
    }

    inputRef.current.click();
  };

  const displayValue = value && formatDisplayValue ? formatDisplayValue(value) : value;

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={openPicker}
        className={cn('flex w-full items-center text-left', buttonClassName)}
      >
        <span className={value ? 'text-gray-700' : 'text-gray-500'}>
          {(displayValue ?? value) || placeholder}
        </span>
      </button>

      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        tabIndex={-1}
      />
    </div>
  );
}
