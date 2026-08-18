'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import ProblemExitConfirmModal from '../_components/ProblemExitConfirmModal';
import ProblemQuestionCard from '../_components/ProblemQuestionCard';
import ProblemSideToc from '../_components/ProblemSideToc';
import ProblemSolvingHeader from '../_components/ProblemSolvingHeader';
import { useProblemSolvingSession } from '../_contexts/ProblemSolvingSessionContext';
import { mockProblemQuestions } from '../_data/mockProblemSolving';
import type { ProblemQuestion } from '../_types/problemSolving';
import { formatElapsedTime } from '../_utils/formatElapsedTime';

type ProblemQuestionViewProps = {
  problemSetId: string;
  question: ProblemQuestion;
  questionIndex: number;
  isReviewMode?: boolean;
};

export default function ProblemQuestionView({
  problemSetId,
  question,
  questionIndex,
  isReviewMode = false,
}: ProblemQuestionViewProps) {
  const router = useRouter();

  const {
    totalElapsedSeconds,
    attempts,
    isHydrated,
    startQuestion,
    saveDraft,
    submitQuestion,
    gradeQuestion,
    retryQuestion,
    pauseSession,
    finishSession,
    resetSession,
  } = useProblemSolvingSession();

  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const isLastQuestion = questionIndex === mockProblemQuestions.length - 1;
  const previousQuestion = mockProblemQuestions[questionIndex - 1];
  const nextQuestion = mockProblemQuestions[questionIndex + 1];
  const reviewQuery = isReviewMode ? '?from=result' : '';

  useEffect(() => {
    if (isHydrated) {
      startQuestion(question.id, { review: isReviewMode });
    }
  }, [isHydrated, isReviewMode, question.id, startQuestion]);

  const handleNext = () => {
    if (isLastQuestion) {
      finishSession();
      router.push(`/problem/${problemSetId}/result`);
      return;
    }

    router.push(`/problem/${problemSetId}/questions/${nextQuestion.id}${reviewQuery}`);
  };

  const handleRetry = () => {
    retryQuestion(question.id);
  };

  const handleOpenExitModal = () => {
    pauseSession();
    setIsTocOpen(false);
    setIsExitModalOpen(true);
  };

  const handleCloseExitModal = () => {
    setIsExitModalOpen(false);

    if (isReviewMode || !attempts[question.id]?.submitted) {
      startQuestion(question.id, { review: isReviewMode });
    }
  };

  const handleHeaderBack = () => {
    if (isReviewMode) {
      pauseSession();
      router.push(`/problem/${problemSetId}/result`);
      return;
    }

    handleOpenExitModal();
  };

  const handleSaveAndExit = () => {
    pauseSession();
    router.push(`/problem/${problemSetId}`);
  };

  const handleExitWithoutSave = () => {
    resetSession();
    router.push(`/problem/${problemSetId}`);
  };

  return (
    <main className="bg-bg-1 min-h-dvh">
      <ProblemSolvingHeader
        title={
          isReviewMode
            ? '최종 결과로 돌아가기'
            : `${String(question.no).padStart(2, '0')}. ${question.title}`
        }
        backHref={isReviewMode ? `/problem/${problemSetId}/result` : `/problem/${problemSetId}`}
        onBack={handleHeaderBack}
        elapsedTime={formatElapsedTime(totalElapsedSeconds)}
        current={question.no}
        total={mockProblemQuestions.length}
        onMenuClick={() => {
          setIsTocOpen(true);
        }}
      />

      <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center py-[60px]">
        {isHydrated && (
          <ProblemQuestionCard
            key={`${question.id}:${isReviewMode ? 'review' : 'solve'}`}
            question={question}
            initialAttempt={attempts[question.id]}
            isLastQuestion={isLastQuestion}
            isReviewMode={isReviewMode}
            onDraftChange={(draft) => {
              saveDraft(question.id, draft);
            }}
            onSubmitAnswer={(submission) => {
              submitQuestion(question.id, submission);
            }}
            onSelfCheck={(status) => {
              gradeQuestion(question.id, status);
            }}
            onNext={handleNext}
            onRetry={handleRetry}
          />
        )}
      </div>

      <ProblemSideToc
        problemSetId={problemSetId}
        questions={mockProblemQuestions}
        isOpen={isTocOpen}
        onClose={() => {
          setIsTocOpen(false);
        }}
        navigation={{
          previousHref: previousQuestion
            ? `/problem/${problemSetId}/questions/${previousQuestion.id}${reviewQuery}`
            : undefined,
          nextHref: nextQuestion
            ? `/problem/${problemSetId}/questions/${nextQuestion.id}${reviewQuery}`
            : `/problem/${problemSetId}/result`,
          previousDisabled: !previousQuestion,
          nextDisabled: false,
          onExitClick: handleOpenExitModal,
        }}
        questionHrefSuffix={reviewQuery}
      />

      <ProblemExitConfirmModal
        isOpen={isExitModalOpen}
        onClose={handleCloseExitModal}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSave={handleExitWithoutSave}
      />
    </main>
  );
}
