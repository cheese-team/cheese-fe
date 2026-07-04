import type { ProblemSet } from '../_types/problem';
import ProblemCard from './ProblemCard';

type ProblemCardGridProps = {
  problemSets: ProblemSet[];
};

export default function ProblemCardGrid({ problemSets }: ProblemCardGridProps) {
  if (problemSets.length === 0) {
    return (
      <div className="bg-bg-white flex h-[240px] w-full items-center justify-center rounded-[10px] border border-gray-300">
        <p className="text-text-muted text-[15px] font-medium">조건에 맞는 문제풀이가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid w-[1100px] grid-cols-[repeat(4,231px)] justify-center gap-x-[32px] gap-y-[32px]">
      {problemSets.map((problemSet) => (
        <ProblemCard key={problemSet.id} problemSet={problemSet} />
      ))}
    </div>
  );
}
