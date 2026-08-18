import { cn } from '@/lib/cn';

import ArrowIcon from '@/assets/icons/common/arrow.svg';

type DashboardCarouselNavButtonProps = {
  label: string;
  direction: 'left' | 'right';
  onClick: () => void;
};

export default function DashboardCarouselNavButton({
  label,
  direction,
  onClick,
}: DashboardCarouselNavButtonProps) {
  const isLeft = direction === 'left';

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'border-border absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
        isLeft ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2',
      )}
    >
      <ArrowIcon
        aria-hidden="true"
        focusable="false"
        className={cn('h-[18px] w-[10.5px] shrink-0', !isLeft && 'rotate-180')}
      />
    </button>
  );
}
