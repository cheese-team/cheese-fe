import Link from 'next/link';

import ArrowIcon from '@/assets/icons/common/arrow.svg';

import type { ProblemQuestion } from '../_types/problemSolving';

type ProblemSideTocNavigation = {
  previousHref?: string;
  previousDisabled?: boolean;
  nextHref?: string;
  nextDisabled?: boolean;
  onExitClick?: () => void;
};

type ProblemSideTocProps = {
  problemSetId: string;
  questions: ProblemQuestion[];
  isOpen: boolean;
  onClose: () => void;
  navigation?: ProblemSideTocNavigation;
};

type SideNavigationButtonProps = {
  href?: string;
  disabled?: boolean;
  direction: 'previous' | 'next';
  label: string;
};

function cn(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function SideNavigationArrow({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <span
      className="flex h-[16px] w-[16px] shrink-0 items-center justify-center overflow-visible text-gray-500"
      aria-hidden="true"
    >
      <ArrowIcon
        className={cn(
          'block h-[24px] w-[14px] shrink-0 origin-center scale-[0.6667]',
          direction === 'next' && 'rotate-180',
        )}
        focusable="false"
      />
    </span>
  );
}

function SideNavigationButton({
  href,
  disabled = false,
  direction,
  label,
}: SideNavigationButtonProps) {
  const isDisabled = disabled || !href;

  const content = (
    <>
      {direction === 'previous' && <SideNavigationArrow direction="previous" />}

      <span>{label}</span>

      {direction === 'next' && <SideNavigationArrow direction="next" />}
    </>
  );

  const className = cn(
    'flex h-[46px] items-center justify-center gap-[5px] rounded-[10px] border text-[16px] font-medium leading-[24px]',
    isDisabled
      ? 'border-gray-300 bg-gray-100 text-gray-500'
      : 'border-secondary-600 bg-bg-white text-gray-900',
  );

  if (isDisabled || !href) {
    return (
      <button type="button" disabled className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export default function ProblemSideToc({
  problemSetId,
  questions,
  isOpen,
  onClose,
  navigation,
}: ProblemSideTocProps) {
  return (
    <aside
      className={cn(
        'bg-bg-white fixed top-[80px] right-0 z-30 flex h-[calc(100dvh-80px)] w-[360px] flex-col px-[32px] py-[32px] shadow-[-16px_0_40px_rgb(0_0_0_/_0.08)] transition-transform duration-200',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] leading-[30px] font-bold">목차</h2>

        <button
          type="button"
          aria-label="목차 닫기"
          className="flex h-[32px] w-[32px] items-center justify-center text-[28px] leading-none font-medium text-gray-500"
          onClick={onClose}
        >
          »
        </button>
      </div>

      <div className="mt-[20px] h-px w-full bg-gray-300" />

      <nav className="mt-[24px] flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-[24px]">
          {questions.map((question) => (
            <li key={question.id} className="flex h-[46px] items-center justify-between gap-[12px]">
              <p className="flex min-w-0 flex-1 items-center gap-[6px] text-[15px] leading-[24px] font-medium">
                <span className="shrink-0 font-bold">{String(question.no).padStart(2, '0')}.</span>
                <span className="truncate">{question.title}</span>
              </p>

              <Link
                href={`/problem/${problemSetId}/questions/${question.id}`}
                className="bg-secondary-600 flex h-[46px] w-[84px] shrink-0 items-center justify-center rounded-[10px] text-[14px] leading-[24px] font-medium text-white"
              >
                문제 선택
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {navigation && (
        <div className="mt-[24px] border-t border-gray-300 pt-[24px]">
          <div className="grid grid-cols-2 gap-[10px]">
            <SideNavigationButton
              href={navigation.previousHref}
              disabled={navigation.previousDisabled}
              direction="previous"
              label="이전문제"
            />

            <SideNavigationButton
              href={navigation.nextHref}
              disabled={navigation.nextDisabled}
              direction="next"
              label="다음문제"
            />
          </div>

          <button
            type="button"
            className="bg-secondary-600 mt-[10px] flex h-[46px] w-full items-center justify-center rounded-[10px] text-[14px] leading-[24px] font-medium text-white"
            onClick={navigation.onExitClick}
          >
            저장하고 종료하기
          </button>
        </div>
      )}
    </aside>
  );
}
