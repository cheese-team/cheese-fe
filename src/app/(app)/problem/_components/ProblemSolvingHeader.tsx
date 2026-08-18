import Link from 'next/link';

import ArrowIcon from '@/assets/icons/common/arrow.svg';

type ProblemSolvingHeaderProps = {
  title: string;
  backHref: string;
  onBack?: () => void;
  elapsedTime: string;
  current: number;
  total: number;
  onMenuClick: () => void;
};

export default function ProblemSolvingHeader({
  title,
  backHref,
  onBack,
  elapsedTime,
  current,
  total,
  onMenuClick,
}: ProblemSolvingHeaderProps) {
  const progressPercent = total <= 0 ? 0 : Math.min(100, Math.max(0, (current / total) * 100));
  const backContent = (
    <>
      <span className="flex h-[50px] w-[30px] shrink-0 items-center justify-center">
        <ArrowIcon
          className="block h-[24px] w-[14px] shrink-0 text-gray-700"
          aria-hidden="true"
          focusable="false"
        />
      </span>

      <span>{title}</span>
    </>
  );
  const backClassName = 'flex items-center gap-[20px] text-[20px] leading-[30px] font-medium';

  return (
    <header className="bg-bg-1 flex h-[80px] items-center justify-between border-b border-gray-300 px-[32px]">
      {onBack ? (
        <button type="button" className={backClassName} onClick={onBack}>
          {backContent}
        </button>
      ) : (
        <Link href={backHref} className={backClassName}>
          {backContent}
        </Link>
      )}

      <div className="flex h-full items-center gap-[24px]">
        <span className="mr-[16px] text-[24px] leading-[30px] font-medium text-gray-950">
          {elapsedTime}
        </span>

        <div className="h-[50px] w-px bg-gray-300" />

        <div className="flex items-center gap-[12px]">
          <div className="h-[6px] w-[300px] overflow-hidden rounded-full border border-gray-500 bg-gray-300">
            <div className="bg-secondary-600 h-full" style={{ width: `${progressPercent}%` }} />
          </div>

          <span className="text-[14px] leading-[20px] font-medium whitespace-nowrap text-gray-700">
            {current}/{total} 진행중
          </span>
        </div>

        <div className="h-[50px] w-px bg-gray-300" />

        <button
          type="button"
          aria-label="목차 열기"
          className="flex h-[44px] w-[44px] items-center justify-center text-gray-600"
          onClick={onMenuClick}
        >
          <span className="flex flex-col gap-[5px]">
            <span className="block h-[3px] w-[28px] rounded-full bg-current" />
            <span className="block h-[3px] w-[28px] rounded-full bg-current" />
            <span className="block h-[3px] w-[28px] rounded-full bg-current" />
          </span>
        </button>
      </div>
    </header>
  );
}
