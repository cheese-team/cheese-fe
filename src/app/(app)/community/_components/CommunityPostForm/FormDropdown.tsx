'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

import ArrowIcon from '@/assets/icons/common/arrow.svg';

type DropdownOption = {
  label: string;
  value: string;
};

type FormDropdownProps = {
  value: string;
  options: DropdownOption[];
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function FormDropdown({
  value,
  options,
  placeholder = '선택',
  onChange,
}: FormDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;

      setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-[30px] w-full items-center justify-between pr-5 font-medium',
          open ? 'border-secondary-600 rounded-[10px] border-2 pl-5' : 'border-b border-gray-400',
        )}
      >
        <span className={cn(!selectedOption && 'text-gray-500')}>
          {selectedOption?.label ?? placeholder}
        </span>

        <ArrowIcon
          className={cn(
            'h-[10px] rotate-[-90deg] text-gray-500 transition-transform',
            open && 'rotate-90',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute top-full left-0 z-20 mt-2 flex w-full flex-col gap-2 overflow-hidden rounded-[10px] border border-gray-400 bg-white p-3"
        >
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'h-5 w-full rounded-[5px] px-2 text-left text-[12px] font-medium hover:bg-gray-200',
                    selected ? 'text-secondary-800' : 'text-gray-700',
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
