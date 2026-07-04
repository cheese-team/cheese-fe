'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import ProblemExitConfirmModal from '../_components/ProblemExitConfirmModal';
import ProblemQuestionCard from '../_components/ProblemQuestionCard';
import ProblemSideToc from '../_components/ProblemSideToc';
import ProblemSolvingHeader from '../_components/ProblemSolvingHeader';
import { mockProblemQuestions } from '../_data/mockProblemSolving';
import type { ProblemQuestion } from '../_types/problemSolving';
import { formatElapsedTime } from '../_utils/formatElapsedTime';

type ProblemQuestionViewProps = {
  problemSetId: string;
  question: ProblemQuestion;
  questionIndex: number;
};

export default function ProblemQuestionView({
  problemSetId,
  question,
  questionIndex,
}: ProblemQuestionViewProps) {
  const router = useRouter();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const isLastQuestion = questionIndex === mockProblemQuestions.length - 1;
  const previousQuestion = mockProblemQuestions[questionIndex - 1];
  const nextQuestion = mockProblemQuestions[questionIndex + 1];

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setElapsedSeconds((prevElapsedSeconds) => prevElapsedSeconds + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const handleNext = () => {
    if (isLastQuestion) {
      router.push(`/problem/${problemSetId}/result`);
      return;
    }

    router.push(`/problem/${problemSetId}/questions/${nextQuestion.id}`);
  };

  const handleRetry = () => {
    setElapsedSeconds(0);
  };

  const handleOpenExitModal = () => {
    setIsTocOpen(false);
    setIsExitModalOpen(true);
  };

  const handleSaveAndExit = () => {
    // TODO: 진행도 저장 API 연결 예정
    router.push(`/problem/${problemSetId}`);
  };

  const handleExitWithoutSave = () => {
    router.push(`/problem/${problemSetId}`);
  };

  return (
    <main className="bg-bg-1 min-h-dvh">
      <ProblemSolvingHeader
        title={`${String(question.no).padStart(2, '0')}. ${question.title}`}
        backHref={`/problem/${problemSetId}`}
        elapsedTime={formatElapsedTime(elapsedSeconds)}
        current={question.no}
        total={mockProblemQuestions.length}
        onMenuClick={() => {
          setIsTocOpen(true);
        }}
      />

      <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center py-[60px]">
        <ProblemQuestionCard
          question={question}
          isLastQuestion={isLastQuestion}
          onNext={handleNext}
          onRetry={handleRetry}
        />
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
            ? `/problem/${problemSetId}/questions/${previousQuestion.id}`
            : undefined,
          nextHref: nextQuestion
            ? `/problem/${problemSetId}/questions/${nextQuestion.id}`
            : `/problem/${problemSetId}/result`,
          previousDisabled: !previousQuestion,
          nextDisabled: false,
          onExitClick: handleOpenExitModal,
        }}
      />

      <ProblemExitConfirmModal
        isOpen={isExitModalOpen}
        onClose={() => {
          setIsExitModalOpen(false);
        }}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSave={handleExitWithoutSave}
      />
    </main>
  );
}
