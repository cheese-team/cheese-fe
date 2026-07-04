import ArrowIcon from '@/assets/icons/common/arrow.svg';

import { cn } from '@/lib/cn';

type BackButtonProps = {
  onClick: () => void;
  buttonClassName?: string;
  iconClassName?: string;
  ariaLabel?: string;
};

export default function BackButton({
  onClick,
  buttonClassName,
  iconClassName,
  ariaLabel = '뒤로가기',
}: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn('flex h-[30px] w-[30px] items-center justify-center', buttonClassName)}
    >
      <ArrowIcon aria-hidden="true" className={cn('h-4 text-gray-700', iconClassName)} />
    </button>
  );
}
