'use client';

import { cn } from '@/lib/cn';

export type CategoryTabItem<TValue extends string = string> = {
  label: string;
  value: TValue;
};

type CategoryTabsSize = 'sm' | 'md' | 'lg';

type CategoryTabsProps<TValue extends string = string> = {
  items: readonly CategoryTabItem<TValue>[];
  activeValue: TValue;
  onChange: (value: TValue) => void;
  size?: CategoryTabsSize;
  className?: string;
};

const sizeClassName: Record<CategoryTabsSize, string> = {
  sm: 'h-[46px] px-[22px] text-[14px] leading-[20px]',
  md: 'h-[52px] px-[24px] text-[15px] leading-[22px]',
  lg: 'h-[54px] px-[28px] text-[16px] leading-[24px]',
};

export function CategoryTabs<TValue extends string = string>({
  items,
  activeValue,
  onChange,
  size = 'md',
  className,
}: CategoryTabsProps<TValue>) {
  return (
    <div className={cn('flex items-center gap-[10px]', className)}>
      {items.map((item) => {
        const isActive = item.value === activeValue;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              'flex shrink-0 items-center justify-center rounded-[10px] border bg-white font-medium transition-colors',
              sizeClassName[size],
              isActive
                ? 'border-secondary-700 text-secondary-700'
                : 'hover:border-secondary-700 hover:text-secondary-700 border-gray-300 text-gray-800',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryTabs;
