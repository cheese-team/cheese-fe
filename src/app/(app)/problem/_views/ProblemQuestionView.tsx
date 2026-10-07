'use client';

import ProblemExitConfirmModal from '../_components/ProblemExitConfirmModal';
import ProblemQuestionCard from '../_components/ProblemQuestionCard';
import ProblemSideToc from '../_components/ProblemSideToc';
import ProblemSolvingHeader from '../_components/ProblemSolvingHeader';
import { useProblemQuestionController } from '../_hooks/useProblemQuestionController';
import { formatElapsedTime } from '../_utils/formatElapsedTime';

type ProblemQuestionViewProps = {
  problemSetId: string;
  questionId: string;
  isReviewMode?: boolean;
};

export default function ProblemQuestionView({
  problemSetId,
  questionId,
  isReviewMode = false,
}: ProblemQuestionViewProps) {
  const controller = useProblemQuestionController({ problemSetId, questionId, isReviewMode });

  if (controller.status === 'loading') {
    return (
      <main className="bg-bg-1 flex min-h-dvh items-center justify-center text-[16px] font-medium text-gray-600">
        문제를 불러오는 중입니다.
      </main>
    );
  }

  if (controller.status === 'error') {
    return (
      <main className="bg-bg-1 flex min-h-dvh flex-col items-center justify-center gap-4 text-[16px] font-medium text-gray-600">
        <p role="alert">{controller.errorMessage}</p>
        <button
          type="button"
          className="text-secondary-700 underline"
          onClick={controller.handleReload}
        >
          다시 시도
        </button>
      </main>
    );
  }

  if (controller.status === 'not-in-set') {
    return (
      <main className="bg-bg-1 flex min-h-dvh items-center justify-center text-[16px] font-medium text-gray-600">
        문제집에 포함되지 않은 문제입니다.
      </main>
    );
  }

  const { question } = controller;

  return (
    <main className="bg-bg-1 min-h-dvh">
      <ProblemSolvingHeader
        title={
          isReviewMode
            ? '최종 결과로 돌아가기'
            : `${String(question.no).padStart(2, '0')}. ${question.title}`
        }
        backHref={controller.backHref}
        onBack={controller.handleHeaderBack}
        elapsedTime={formatElapsedTime(controller.totalElapsedSeconds)}
        current={controller.completedCount}
        total={controller.questions.length}
        onMenuClick={controller.handleOpenToc}
      />

      <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center py-[60px]">
        {controller.isHydrated && (
          <ProblemQuestionCard
            key={`${question.id}:${isReviewMode}`}
            question={question}
            attempt={controller.attempt}
            isLastQuestion={controller.isLastQuestion}
            isReviewMode={isReviewMode}
            isBusy={controller.isBusy}
            isSubmitting={controller.isSubmitting}
            isRetrying={controller.isRetrying}
            onDraftChange={controller.handleDraftChange}
            onSubmitAnswer={controller.handleSubmitAnswer}
            onSelfCheck={controller.handleSelfCheck}
            onRetry={controller.handleRetry}
            onNext={controller.handleNext}
          />
        )}
      </div>

      <ProblemSideToc
        problemSetId={problemSetId}
        questions={controller.questions}
        isOpen={controller.isTocOpen}
        onClose={controller.handleCloseToc}
        navigation={{
          previousHref: controller.previousHref,
          nextHref: controller.nextHref,
          previousDisabled: !controller.previousHref,
          nextDisabled: false,
          onExitClick: controller.handleOpenExitModal,
        }}
        questionHrefSuffix={controller.reviewQuery}
        isBusy={controller.isBusy}
        onNavigate={(href) => {
          void controller.handleSaveAndNavigate(href);
        }}
      />

      <ProblemExitConfirmModal
        isOpen={controller.isExitModalOpen}
        onClose={controller.handleCloseExitModal}
        isPending={controller.isBusy}
        onSaveAndExit={controller.handleSaveAndExit}
        onExitWithoutSave={controller.handleExitWithoutSave}
      />
    </main>
  );
}
