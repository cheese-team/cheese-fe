import Link from 'next/link';

import ProblemActionIcon from './ProblemActionIcon';
import ProblemStatusIcon from './ProblemStatusIcon';
import type { ProblemResultRow } from '../_types/problemSolving';

type ProblemResultTableProps = {
  problemSetId: string;
  rows: ProblemResultRow[];
};

function ResultStatusIcon({ status }: { status: ProblemResultRow['status'] }) {
  if (status === 'correct') {
    return <ProblemStatusIcon type="correct" />;
  }

  if (status === 'incorrect') {
    return <ProblemStatusIcon type="incorrect" />;
  }

  return <ProblemStatusIcon type="skipped" />;
}

export default function ProblemResultTable({ problemSetId, rows }: ProblemResultTableProps) {
  return (
    <section className="bg-bg-white mt-[32px] h-[720px] w-[1060px] rounded-[15px] px-[40px] py-[40px]">
      <div className="relative h-[64px] border-b border-gray-300">
        <span className="absolute top-[12px] left-[80px] text-[24px] leading-[30px] font-bold">
          문제명
        </span>

        <span className="absolute top-[12px] left-[410px] text-[24px] leading-[30px] font-bold">
          정답 결과
        </span>

        <span className="absolute top-[12px] left-[602px] text-[24px] leading-[30px] font-bold">
          소요시간
        </span>

        <span className="absolute top-[12px] right-[80px] text-[24px] leading-[30px] font-bold">
          복습
        </span>
      </div>

      <div className="mt-[24px] flex flex-col gap-[24px]">
        {rows.map((row) => (
          <div key={row.questionId} className="relative h-[46px]">
            <Link
              href={`/problem/${problemSetId}/questions/${row.questionId}`}
              className="absolute top-0 left-[40px] flex h-[46px] w-[360px] items-center gap-[8px] text-[20px] leading-[30px]"
            >
              <span className="shrink-0 font-bold">{String(row.no).padStart(2, '0')}.</span>
              <span className="truncate font-medium">{row.title}</span>
            </Link>

            <div className="absolute top-0 left-[446px] flex h-[46px] w-[24px] items-center justify-center">
              <ResultStatusIcon status={row.status} />
            </div>

            <div className="absolute top-0 left-[580px] flex h-[46px] w-[120px] items-center justify-center text-[20px] leading-[30px] font-medium">
              {row.elapsedTime || '-'}
            </div>

            <Link
              href={`/problem/${problemSetId}/questions/${row.questionId}`}
              className="bg-secondary-600 absolute top-0 right-[40px] flex h-[46px] w-[110px] items-center justify-center gap-[16px] rounded-[10px] text-[14px] leading-[24px] font-medium text-white"
            >
              <ProblemActionIcon className="h-[16px] w-[16px] shrink-0" />
              <span>다시 풀기</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
