'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import ProblemExitConfirmModal from '../_components/ProblemExitConfirmModal';
import ProblemResultTable from '../_components/ProblemResultTable';
import ProblemSetSummaryCard from '../_components/ProblemSetSummaryCard';
import ProblemSideToc from '../_components/ProblemSideToc';
import ProblemSolvingHeader from '../_components/ProblemSolvingHeader';
import { useProblemSolvingSession } from '../_contexts/ProblemSolvingSessionContext';
import { mockProblemQuestions, mockProblemSetSummary } from '../_data/mockProblemSolving';
import { formatElapsedTime } from '../_utils/formatElapsedTime';

type ProblemResultViewProps = {
  problemSetId: string;
};

export default function ProblemResultView({ problemSetId }: ProblemResultViewProps) {
  const router = useRouter();
  const { totalElapsedSeconds, attempts, isHydrated, pauseSession, finishSession, resetSession } =
    useProblemSolvingSession();
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const firstQuestion = mockProblemQuestions[0];
  const lastQuestion = mockProblemQuestions[mockProblemQuestions.length - 1];
  const firstQuestionHref = firstQuestion
    ? `/problem/${problemSetId}/questions/${firstQuestion.id}`
    : `/problem/${problemSetId}`;
  const lastQuestionHref = lastQuestion
    ? `/problem/${problemSetId}/questions/${lastQuestion.id}?from=result`
    : undefined;

  const resultRows = useMemo(
    () =>
      mockProblemQuestions.map((question) => {
        const attempt = attempts[question.id];
        return {
          questionId: question.id,
          no: question.no,
          title: question.title,
          status: attempt?.submitted ? attempt.status : 'pending',
          elapsedTime:
            attempt && attempt.elapsedSeconds > 0 ? formatElapsedTime(attempt.elapsedSeconds) : '',
        } as const;
      }),
    [attempts],
  );
  const completedCount = Object.values(attempts).filter((attempt) => attempt.submitted).length;

  useEffect(() => {
    if (isHydrated) {
      finishSession();
    }
  }, [finishSession, isHydrated]);

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
        current={completedCount}
        total={mockProblemQuestions.length}
        onMenuClick={() => {
          setIsTocOpen(true);
        }}
      />

      <div className="h-[calc(100dvh-80px)] overflow-y-auto">
        <div className="mx-auto w-[1060px] pt-[28px] pb-[46px]">
          <ProblemSetSummaryCard
            problemSetId={problemSetId}
            summary={mockProblemSetSummary}
            actionLabel="처음부터 시작"
            actionHref={firstQuestionHref}
            onActionClick={resetSession}
            showProgress={false}
          />

          <ProblemResultTable problemSetId={problemSetId} rows={resultRows} />
        </div>
      </div>

      <ProblemSideToc
        problemSetId={problemSetId}
        questions={mockProblemQuestions}
        isOpen={isTocOpen}
        onClose={() => {
          setIsTocOpen(false);
        }}
        questionHrefSuffix="?from=result"
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
        onExitWithoutSave={handleExitWithoutSave}
      />
    </main>
  );
}
