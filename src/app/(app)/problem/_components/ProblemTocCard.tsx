import Link from 'next/link';

import ProblemActionIcon from './ProblemActionIcon';
import type { ProblemQuestion } from '../_types/problemSolving';

type ProblemTocCardProps = {
  problemSetId: string;
  questions: ProblemQuestion[];
};

function TocDotLine() {
  return (
    <div
      className="h-[6px] flex-1 bg-repeat-x"
      style={{
        backgroundImage: 'radial-gradient(circle, var(--color-gray-500) 1.5px, transparent 1.6px)',
        backgroundSize: '16px 6px',
        backgroundPosition: 'center',
      }}
    />
  );
}

export default function ProblemTocCard({ problemSetId, questions }: ProblemTocCardProps) {
  return (
    <section className="bg-bg-white mt-[32px] h-[720px] w-[1060px] rounded-[15px] px-[40px] py-[40px]">
      <h2 className="text-[24px] leading-[30px] font-bold">목차</h2>

      <div className="mt-[28px] h-px w-full bg-gray-300" />

      <div className="mx-auto mt-[24px] flex w-[893px] flex-col gap-[24px]">
        {questions.map((question) => (
          <div key={question.id} className="flex h-[46px] w-[893px] items-center gap-[30px]">
            <p className="flex shrink-0 items-center gap-[8px] text-[18px] leading-[30px] font-semibold">
              <span>{String(question.no).padStart(2, '0')}.</span>
              <span>{question.title}</span>
            </p>

            <TocDotLine />

            <Link
              href={`/problem/${problemSetId}/questions/${question.id}`}
              className="bg-secondary-600 flex h-[46px] w-[114px] shrink-0 items-center justify-center gap-[16px] rounded-[10px] text-[14px] leading-[24px] font-medium text-white"
            >
              <ProblemActionIcon className="h-[16px] w-[16px] shrink-0" />
              <span>문제 선택</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
