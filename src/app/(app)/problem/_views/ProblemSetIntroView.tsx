'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import ProblemExitConfirmModal from '../_components/ProblemExitConfirmModal';
import ProblemSetSummaryCard from '../_components/ProblemSetSummaryCard';
import ProblemSideToc from '../_components/ProblemSideToc';
import ProblemSolvingHeader from '../_components/ProblemSolvingHeader';
import ProblemTocCard from '../_components/ProblemTocCard';
import { useProblemSolvingSession } from '../_contexts/ProblemSolvingSessionContext';
import { mockProblemQuestions, mockProblemSetSummary } from '../_data/mockProblemSolving';
import { formatElapsedTime } from '../_utils/formatElapsedTime';

type ProblemSetIntroViewProps = {
  problemSetId: string;
};

export default function ProblemSetIntroView({ problemSetId }: ProblemSetIntroViewProps) {
  const router = useRouter();
  const { totalElapsedSeconds, attempts, pauseSession, resetSession } = useProblemSolvingSession();

  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const firstQuestion = mockProblemQuestions[0];

  const firstQuestionHref = firstQuestion
    ? `/problem/${problemSetId}/questions/${firstQuestion.id}`
    : `/problem/${problemSetId}`;
  const solvedCount = Object.values(attempts).filter((attempt) => attempt.submitted).length;
  const problemSetSummary = {
    ...mockProblemSetSummary,
    solvedCount,
    totalCount: mockProblemQuestions.length,
  };

  const handleOpenExitModal = () => {
    setIsTocOpen(false);
    setIsExitModalOpen(true);
  };

  const handleExit = () => {
    pauseSession();
    router.push('/problem');
  };

  const handleExitWithoutSave = () => {
    resetSession();
    router.push('/problem');
  };

  return (
    <main className="bg-bg-1 min-h-dvh">
      <ProblemSolvingHeader
        title="문제풀이 홈으로 나가기"
        backHref="/problem"
        elapsedTime={formatElapsedTime(totalElapsedSeconds)}
        current={solvedCount}
        total={mockProblemQuestions.length}
        onMenuClick={() => {
          setIsTocOpen(true);
        }}
      />

      <div className="h-[calc(100dvh-80px)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto w-[1060px] pt-[28px] pb-[68px]">
          <ProblemSetSummaryCard
            problemSetId={problemSetId}
            summary={problemSetSummary}
            actionLabel="이어서 시작"
            actionHref={firstQuestionHref}
          />

          <ProblemTocCard problemSetId={problemSetId} questions={mockProblemQuestions} />
        </div>
      </div>

      <ProblemSideToc
        problemSetId={problemSetId}
        questions={mockProblemQuestions}
        isOpen={isTocOpen}
        onClose={() => {
          setIsTocOpen(false);
        }}
        navigation={{
          previousDisabled: true,
          nextHref: firstQuestionHref,
          nextDisabled: !firstQuestion,
          onExitClick: handleOpenExitModal,
        }}
      />

      <ProblemExitConfirmModal
        isOpen={isExitModalOpen}
        onClose={() => {
          setIsExitModalOpen(false);
        }}
        onSaveAndExit={handleExit}
        onExitWithoutSave={handleExitWithoutSave}
      />
    </main>
  );
}
