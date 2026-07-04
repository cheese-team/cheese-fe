import Image from 'next/image';
import Link from 'next/link';

import type { ProblemSet, ProblemThumbnailType } from '../_types/problem';

type ProblemCardProps = {
  problemSet: ProblemSet;
};

const thumbnailSrcMap: Record<ProblemThumbnailType, string> = {
  css: '/images/problem/css.png',
  html: '/images/problem/html.png',
  js: '/images/problem/js.png',
};

export default function ProblemCard({ problemSet }: ProblemCardProps) {
  const progressPercent =
    problemSet.totalCount <= 0
      ? 0
      : Math.min(100, Math.max(0, (problemSet.solvedCount / problemSet.totalCount) * 100));

  return (
    <Link
      href={`/problem/${problemSet.id}`}
      className="bg-bg-white block h-[250px] w-[231px] overflow-hidden rounded-[8px] shadow-[0_4px_10px_rgba(0,0,0,0.10)]"
    >
      <div className="relative h-[140px] w-full overflow-hidden">
        <Image
          src={thumbnailSrcMap[problemSet.thumbnailType]}
          alt={`${problemSet.title} 썸네일`}
          fill
          sizes="231px"
          className="object-cover"
        />

        <span className="bg-bg-white absolute top-[12px] left-[12px] flex h-[24px] w-[38px] items-center justify-center rounded-[50px] text-[12px] leading-[24px] font-bold">
          {problemSet.badge}
        </span>
      </div>

      <div className="flex h-[110px] flex-col pt-[12px] pr-[22px] pb-[12px] pl-[20px]">
        <h3 className="h-[30px] w-full truncate text-[16px] leading-[30px] font-medium">
          {problemSet.title}
        </h3>

        <p className="text-[12px] leading-[20px] font-normal text-gray-600">
          {problemSet.lastProgressDate} 진행
        </p>

        <div className="mt-auto">
          <div className="h-[4px] w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="bg-secondary-600 h-full rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-[6px] flex justify-end text-[12px] leading-[20px] font-normal text-gray-600">
            {problemSet.solvedCount}/{problemSet.totalCount}
          </div>
        </div>
      </div>
    </Link>
  );
}
