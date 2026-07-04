'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import ProblemExitConfirmModal from '../_components/ProblemExitConfirmModal';
import ProblemSetSummaryCard from '../_components/ProblemSetSummaryCard';
import ProblemSideToc from '../_components/ProblemSideToc';
import ProblemSolvingHeader from '../_components/ProblemSolvingHeader';
import ProblemTocCard from '../_components/ProblemTocCard';
import { mockProblemQuestions, mockProblemSetSummary } from '../_data/mockProblemSolving';

type ProblemSetIntroViewProps = {
  problemSetId: string;
};

export default function ProblemSetIntroView({ problemSetId }: ProblemSetIntroViewProps) {
  const router = useRouter();

  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const firstQuestion = mockProblemQuestions[0];

  const firstQuestionHref = firstQuestion
    ? `/problem/${problemSetId}/questions/${firstQuestion.id}`
    : `/problem/${problemSetId}`;

  const handleOpenExitModal = () => {
    setIsTocOpen(false);
    setIsExitModalOpen(true);
  };

  const handleExit = () => {
    router.push('/problem');
  };

  return (
    <main className="bg-bg-1 min-h-dvh">
      <ProblemSolvingHeader
        title="문제풀이 홈으로 나가기"
        backHref="/problem"
        elapsedTime="00:00"
        current={0}
        total={mockProblemQuestions.length}
        onMenuClick={() => {
          setIsTocOpen(true);
        }}
      />

      <div className="h-[calc(100dvh-80px)] overflow-y-auto">
        <div className="mx-auto w-[1060px] pt-[28px] pb-[68px]">
          <ProblemSetSummaryCard
            problemSetId={problemSetId}
            summary={mockProblemSetSummary}
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
        onExitWithoutSave={handleExit}
      />
    </main>
  );
}
