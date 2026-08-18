import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';

import cssThumbnail from '../../../../../public/images/problem/css.png';

import type { ProblemSet, ProblemThumbnailType } from '../_types/problem';

type ProblemCardProps = {
  problemSet: ProblemSet;
};

const thumbnailSrcMap: Record<ProblemThumbnailType, string | StaticImageData> = {
  css: cssThumbnail,
  html: '/images/problem/html.png',
  js: '/images/problem/js.png',
};

export default function ProblemCard({ problemSet }: ProblemCardProps) {
  const hasProgress = problemSet.solvedCount > 0;
  const progressPercent =
    problemSet.totalCount <= 0
      ? 0
      : Math.min(100, Math.max(0, (problemSet.solvedCount / problemSet.totalCount) * 100));

  return (
    <Link
      href={`/problem/${problemSet.id}`}
      className="group/card bg-bg-white block h-[250px] w-[231px] overflow-hidden rounded-[10px] border border-gray-300 shadow-none transition-shadow duration-200 hover:shadow-[0_4px_10px_rgba(0,0,0,0.10)] focus-visible:shadow-[0_4px_10px_rgba(0,0,0,0.10)] focus-visible:outline-none"
    >
      <div className="relative h-[140px] w-full overflow-hidden">
        <Image
          src={thumbnailSrcMap[problemSet.thumbnailType]}
          alt={`${problemSet.title} 썸네일`}
          fill
          sizes="231px"
          className="scale-100 object-cover transition-transform duration-200 ease-out group-hover/card:scale-105 group-focus-visible/card:scale-105"
        />

        <span className="bg-bg-white absolute top-[12px] left-[12px] flex h-[24px] w-[38px] items-center justify-center rounded-[50px] text-[12px] leading-[24px] font-bold text-gray-950">
          {problemSet.badge}
        </span>
      </div>

      <div className="flex h-[110px] flex-col pt-[12px] pr-[22px] pb-[12px] pl-[20px]">
        <h3 className="h-[30px] w-full truncate text-[16px] leading-[30px] font-medium text-gray-950">
          {problemSet.title}
        </h3>

        <p className="text-[12px] leading-[20px] font-normal text-gray-600">
          {problemSet.lastProgressDate
            ? `${problemSet.lastProgressDate} 진행`
            : hasProgress
              ? '진행 중'
              : '미진행'}
        </p>

        <div className="mt-[12px] mb-0">
          <div className="h-[4px] w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="bg-secondary-600 h-full rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-end text-[12px] leading-[20px] font-normal text-gray-600">
            {problemSet.solvedCount}/{problemSet.totalCount}
          </div>
        </div>
      </div>
    </Link>
  );
}
