import Image from 'next/image';
import Link from 'next/link';

import ProblemActionIcon from './ProblemActionIcon';
import type { ProblemSetSummary } from '../_types/problemSolving';

type ProblemSetSummaryCardProps = {
  problemSetId: string;
  summary: ProblemSetSummary;
  actionLabel: string;
  actionHref: string;
  showProgress?: boolean;
};

export default function ProblemSetSummaryCard({
  problemSetId,
  summary,
  actionLabel,
  actionHref,
  showProgress = true,
}: ProblemSetSummaryCardProps) {
  const progressPercent =
    summary.totalCount <= 0
      ? 0
      : Math.min(100, Math.max(0, (summary.solvedCount / summary.totalCount) * 100));

  return (
    <section className="bg-bg-white mx-auto flex h-[151.52px] w-[1060px] overflow-hidden rounded-[15px]">
      <div className="relative h-[151.52px] w-[250px] shrink-0 overflow-hidden">
        <Image
          src={summary.thumbnailSrc}
          alt={`${summary.title} 썸네일`}
          fill
          sizes="250px"
          className="object-cover"
        />

        <span className="bg-bg-white absolute top-[12px] left-[12px] flex h-[24px] w-[38px] items-center justify-center rounded-full text-[12px] leading-[24px] font-bold">
          FE
        </span>
      </div>

      <div className="flex flex-1 items-center pr-[28px] pl-[32px]">
        <div className="flex flex-1 flex-col justify-center">
          <h1 className="text-[20px] leading-[30px] font-bold">{summary.title}</h1>

          <p className="mt-[12px] text-[14px] leading-[20px] font-medium text-gray-600">
            마지막 진행일 : {summary.lastProgressDate}
          </p>

          {showProgress && (
            <div className="mt-[12px] flex w-[500px] flex-col items-end">
              <div className="h-[16px] w-full rounded-full bg-gray-300">
                <div className="bg-secondary-600 h-full" style={{ width: `${progressPercent}%` }} />
              </div>

              <span className="mt-[4px] text-[14px] leading-[20px] font-medium text-gray-700">
                {summary.solvedCount}/{summary.totalCount} 완료
              </span>
            </div>
          )}
        </div>

        <Link
          href={actionHref}
          className="bg-secondary-600 ml-[32px] flex h-[46px] w-[128px] shrink-0 items-center justify-center gap-[16px] rounded-[10px] text-[14px] leading-[24px] font-medium text-white"
        >
          <ProblemActionIcon className="h-[16px] w-[16px] shrink-0" />
          <span>{actionLabel}</span>
        </Link>
      </div>

      <span className="sr-only">문제 세트 ID: {problemSetId}</span>
    </section>
  );
}
