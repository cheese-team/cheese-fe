import { cn } from '@/lib/cn';
import type { ProblemSubCategory } from '../_types/problem';

type ProblemSubCategoryTabItem = {
  label: string;
  value: ProblemSubCategory;
};

type ProblemSubCategoryTabsProps = {
  items: readonly ProblemSubCategoryTabItem[];
  activeValue: ProblemSubCategory;
  onChange: (value: ProblemSubCategory) => void;
};

export default function ProblemSubCategoryTabs({
  items,
  activeValue,
  onChange,
}: ProblemSubCategoryTabsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex h-[30px] items-center gap-[28px] pl-[20px]">
      {items.map((item) => {
        const isActive = item.value === activeValue;

        return (
          <button
            key={item.value}
            type="button"
            className={cn(
              'h-[30px] text-[14px] leading-[30px] font-medium',
              isActive ? 'text-secondary-800 font-bold' : 'text-gray-700',
            )}
            onClick={() => {
              onChange(item.value);
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
