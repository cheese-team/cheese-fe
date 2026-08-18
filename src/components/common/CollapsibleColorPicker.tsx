'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

type ColorPickerOption<T extends string> = {
  value: T;
  label: string;
  swatchClassName?: string;
};

type CollapsibleColorPickerProps<T extends string> = {
  value?: T;
  options: Array<ColorPickerOption<T>>;
  onChange: (value: T) => void;
  swatchSlotSize?: number;
  swatchGap?: number;
};

const COLOR_SWATCH_SIZE = 20;

export function CollapsibleColorPicker<T extends string>({
  value,
  options,
  onChange,
  swatchSlotSize = COLOR_SWATCH_SIZE,
  swatchGap = 8,
}: CollapsibleColorPickerProps<T>) {
  const [open, setOpen] = useState(!value);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);
  const isCollapsed = Boolean(selectedOption) && !open;
  const visibleOptions = isCollapsed && selectedOption ? [selectedOption] : options;
  const paletteWidth =
    visibleOptions.length * swatchSlotSize + Math.max(visibleOptions.length - 1, 0) * swatchGap;
  const swatchSlotPadding = Math.max((swatchSlotSize - COLOR_SWATCH_SIZE) / 2, 0);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!pickerRef.current) return;
      if (pickerRef.current.contains(event.target as Node)) return;

      if (value) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open, value]);

  return (
    <div
      ref={pickerRef}
      className="flex items-center"
      data-color-picker-expanded={open ? 'true' : 'false'}
    >
      <div
        className="overflow-hidden"
        style={{
          width: `${paletteWidth}px`,
          transition: 'width 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="flex items-center" style={{ gap: `${swatchGap}px` }}>
          {visibleOptions.map((option) => {
            const selected = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-label={`${option.label} 색상 선택`}
                aria-pressed={selected}
                onClick={() => {
                  if (selected) {
                    setOpen((prev) => !prev);
                    return;
                  }

                  onChange(option.value);
                  setOpen(false);
                }}
                className="shrink-0 rounded-[5px] transition-transform duration-150 outline-none hover:scale-105"
                style={{
                  width: `${swatchSlotSize}px`,
                  height: `${swatchSlotSize}px`,
                  padding: `${swatchSlotPadding}px`,
                }}
              >
                <span
                  aria-hidden="true"
                  className={cn('block h-full w-full rounded-[5px]', option.swatchClassName)}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
