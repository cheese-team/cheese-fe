import Link from 'next/link';

import { Button } from '@/components/common/Button';

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
    <section className="bg-bg-white mt-[32px] h-[720px] w-[1060px] rounded-[15px] px-[40px] pt-[56px]">
      <h2 className="ml-[20px] text-[24px] leading-[30px] font-bold text-gray-950">목차</h2>

      <div className="mt-[28px] h-px w-full bg-gray-300" />

      <div className="mx-auto mt-[24px] flex w-[893px] flex-col gap-[24px]">
        {questions.map((question) => (
          <div key={question.id} className="flex h-[46px] w-[893px] items-center gap-[30px]">
            <p className="flex shrink-0 items-center gap-[8px] leading-[30px] tracking-[-0.02em] text-gray-950">
              <span className="text-[20px] font-bold">{String(question.no).padStart(2, '0')}.</span>
              <span className="text-[20px] font-medium">{question.title}</span>
            </p>

            <TocDotLine />

            <Button
              asChild
              size={46}
              width={114}
              className="shrink-0 gap-[16px] !text-[16px] leading-[30px]"
            >
              <Link href={`/problem/${problemSetId}/questions/${question.id}`}>
                <ProblemActionIcon className="h-[16px] w-[16px] shrink-0" />
                <span>문제 선택</span>
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
