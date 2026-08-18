'use client';

import type { CalendarView } from '../../_model/types';

type Props = {
  value: CalendarView;
  onChange: (next: CalendarView) => void;
};

const items: Array<{ value: CalendarView; label: string }> = [
  { value: 'month', label: '월' },
  { value: 'week', label: '주' },
  { value: 'day', label: '일' },
];

export function CalendarViewSwitcher({ value, onChange }: Props) {
  return (
    <div className="bg-bg-2 flex h-8 w-[228px] items-center rounded-[10px] p-[4px]">
      <div className="flex w-full items-center justify-between">
        {items.map((item) => {
          const active = item.value === value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={[
                'flex h-6 w-[60px] items-center justify-center rounded-[10px] text-[14px] leading-[20px] font-medium tracking-normal transition outline-none',
                active ? 'bg-bg-white text-gray-700' : 'bg-transparent text-gray-700',
              ].join(' ')}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
