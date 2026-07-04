'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import ProblemExitConfirmModal from '../_components/ProblemExitConfirmModal';
import ProblemResultTable from '../_components/ProblemResultTable';
import ProblemSetSummaryCard from '../_components/ProblemSetSummaryCard';
import ProblemSideToc from '../_components/ProblemSideToc';
import ProblemSolvingHeader from '../_components/ProblemSolvingHeader';
import {
  mockProblemQuestions,
  mockProblemResultRows,
  mockProblemSetSummary,
} from '../_data/mockProblemSolving';

type ProblemResultViewProps = {
  problemSetId: string;
};

export default function ProblemResultView({ problemSetId }: ProblemResultViewProps) {
  const router = useRouter();

  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const firstQuestion = mockProblemQuestions[0];
  const lastQuestion = mockProblemQuestions[mockProblemQuestions.length - 1];

  const firstQuestionHref = firstQuestion
    ? `/problem/${problemSetId}/questions/${firstQuestion.id}`
    : `/problem/${problemSetId}`;

  const lastQuestionHref = lastQuestion
    ? `/problem/${problemSetId}/questions/${lastQuestion.id}`
    : undefined;

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
        elapsedTime="26:32"
        current={mockProblemQuestions.length}
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
            actionLabel="처음부터 시작"
            actionHref={firstQuestionHref}
            showProgress={false}
          />

          <ProblemResultTable problemSetId={problemSetId} rows={mockProblemResultRows} />
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
          previousHref: lastQuestionHref,
          previousDisabled: !lastQuestion,
          nextDisabled: true,
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
