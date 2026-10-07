'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import {
  useSaveProblemAnswerMutation,
  useRetryProblemQuestionMutation,
  useSelfGradeProblemQuestionMutation,
  useSubmitProblemAnswerMutation,
} from '@/queries/problem/useProblemMutations';
import { useProblemQuestion, useProblemSetDetail } from '@/queries/problem/useProblemQueries';

import { useProblemSolvingSession } from '../_contexts/ProblemSolvingSessionContext';
import type { ProblemAttempt, ProblemSolveStatus } from '../_types/problemSolving';
import { mapProblemAttempt } from '../_utils/mapProblemAttempt';
import { resolveProblemAttempt } from '../_utils/resolveProblemAttempt';

type UseProblemQuestionControllerOptions = {
  problemSetId: string;
  questionId: string;
  isReviewMode?: boolean;
};

type AnswerSubmission = Pick<ProblemAttempt, 'answer' | 'selectedChoiceId'>;
type GradedStatus = Exclude<ProblemSolveStatus, 'pending'>;

export function useProblemQuestionController({
  problemSetId,
  questionId,
  isReviewMode = false,
}: UseProblemQuestionControllerOptions) {
  const router = useRouter();
  const {
    totalElapsedSeconds,
    attempts,
    isHydrated,
    startQuestion,
    saveDraft,
    submitQuestion,
    gradeQuestion,
    pauseSession,
    finishSession,
    resetSession,
    resetQuestion,
  } = useProblemSolvingSession();

  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationPending = useRef(false);

  const currentUserQuery = useCurrentUser();
  const userId = currentUserQuery.data?.account.userId;
  const detailQuery = useProblemSetDetail({
    problemSetId,
    enabled: currentUserQuery.isSuccess,
  });
  const questionQuery = useProblemQuestion({
    problemSetId,
    questionId,
    enabled: currentUserQuery.isSuccess,
  });
  const saveAnswerMutation = useSaveProblemAnswerMutation();
  const submitAnswerMutation = useSubmitProblemAnswerMutation();
  const selfGradeMutation = useSelfGradeProblemQuestionMutation();
  const retryQuestionMutation = useRetryProblemQuestionMutation();
  const isBusy =
    isNavigating ||
    saveAnswerMutation.isPending ||
    submitAnswerMutation.isPending ||
    selfGradeMutation.isPending ||
    retryQuestionMutation.isPending;

  const apiAttempt = useMemo(
    () => (questionQuery.data ? mapProblemAttempt(questionQuery.data) : undefined),
    [questionQuery.data],
  );
  const question = questionQuery.data;

  useEffect(() => {
    if (isHydrated && question && apiAttempt && !isExitModalOpen && !isNavigating) {
      startQuestion(question.id, { review: isReviewMode, initialAttempt: apiAttempt });
    }
    return pauseSession;
  }, [
    apiAttempt,
    isHydrated,
    isReviewMode,
    question,
    startQuestion,
    pauseSession,
    isExitModalOpen,
    isNavigating,
  ]);

  const error = currentUserQuery.error ?? detailQuery.error ?? questionQuery.error;
  const isLoading =
    !error &&
    (currentUserQuery.isPending ||
      (Boolean(userId) && (detailQuery.isPending || questionQuery.isPending)));

  const handleReload = () => {
    if (currentUserQuery.error) {
      void currentUserQuery.refetch();
      return;
    }

    void Promise.all([detailQuery.refetch(), questionQuery.refetch()]);
  };

  if (isLoading) {
    return { status: 'loading' } as const;
  }

  const detail = detailQuery.data;
  if (!userId || !detail || !question || !apiAttempt || error) {
    return {
      status: 'error',
      errorMessage: error instanceof Error ? error.message : '문제를 찾을 수 없습니다.',
      handleReload,
    } as const;
  }

  const questionIndex = detail.questions.findIndex((item) => item.id === question.id);
  if (questionIndex < 0) {
    return { status: 'not-in-set' } as const;
  }

  const previousQuestion = detail.questions[questionIndex - 1];
  const sequentialNextQuestion = detail.questions[questionIndex + 1];
  const nextQuestion =
    sequentialNextQuestion ??
    (!isReviewMode
      ? detail.questions.find(
          (item) =>
            item.id !== question.id &&
            item.status === 'notStarted' &&
            !attempts[item.id]?.submitted,
        )
      : undefined);
  const isLastQuestion = !nextQuestion;
  const reviewQuery = isReviewMode ? '?from=result' : '';
  const attempt = resolveProblemAttempt({
    serverAttempt: apiAttempt,
    sessionAttempt: attempts[question.id],
  });

  const handleNext = () => {
    if (isBusy) return;
    if (!nextQuestion) {
      finishSession();
      router.push(`/problem/${problemSetId}/result`);
      return;
    }

    router.push(`/problem/${problemSetId}/questions/${nextQuestion.id}${reviewQuery}`);
  };

  const handleOpenToc = () => {
    if (!isBusy) setIsTocOpen(true);
  };

  const handleCloseToc = () => {
    setIsTocOpen(false);
  };

  const handleOpenExitModal = () => {
    if (isBusy) return;
    pauseSession();
    setIsTocOpen(false);
    setIsExitModalOpen(true);
  };

  const handleCloseExitModal = () => {
    if (isBusy) return;
    setIsExitModalOpen(false);

    if (isReviewMode || !attempts[question.id]?.submitted) {
      startQuestion(question.id, { review: isReviewMode, initialAttempt: apiAttempt });
    }
  };

  const handleHeaderBack = () => {
    if (isBusy) return;
    if (isReviewMode) {
      pauseSession();
      router.push(`/problem/${problemSetId}/result`);
      return;
    }

    handleOpenExitModal();
  };

  const handleSaveAndNavigate = async (href: string) => {
    if (isBusy || navigationPending.current) return;
    navigationPending.current = true;
    setIsNavigating(true);
    pauseSession();

    try {
      if (!attempt.submitted && !isReviewMode) {
        await saveAnswerMutation.mutateAsync({
          userId,
          problemSetId,
          questionId: question.id,
          answer: {
            answer: question.type === 'shortAnswer' ? attempt.answer : undefined,
            selectedChoiceId:
              question.type === 'multipleChoice' ? attempt.selectedChoiceId : undefined,
            elapsedSeconds: attempt.elapsedSeconds,
          },
        });
      }

      pauseSession();
      setIsTocOpen(false);
      router.push(href);
    } catch (saveError) {
      window.alert(
        saveError instanceof Error
          ? saveError.message
          : '진행도를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      navigationPending.current = false;
      setIsNavigating(false);
    }
  };

  const handleSaveAndExit = () => {
    void handleSaveAndNavigate(`/problem/${problemSetId}`);
  };

  const handleExitWithoutSave = () => {
    if (isBusy) return;
    resetSession();
    router.push(`/problem/${problemSetId}`);
  };

  const handleDraftChange = (draft: Partial<AnswerSubmission>) => {
    saveDraft(question.id, draft);
  };

  const handleSubmitAnswer = async (submission: AnswerSubmission) => {
    const elapsedSeconds = attempts[question.id]?.elapsedSeconds ?? apiAttempt.elapsedSeconds;
    const submittedQuestion = await submitAnswerMutation.mutateAsync({
      userId,
      problemSetId,
      questionId: question.id,
      answer: {
        answer: question.type === 'shortAnswer' ? submission.answer : undefined,
        selectedChoiceId:
          question.type === 'multipleChoice' ? submission.selectedChoiceId : undefined,
        elapsedSeconds,
      },
    });

    const status =
      submittedQuestion.status === 'correct'
        ? 'correct'
        : submittedQuestion.status === 'incorrect'
          ? 'incorrect'
          : null;
    const submittedAnswer = {
      answer: submittedQuestion.myAnswer?.answer ?? submission.answer,
      selectedChoiceId: submittedQuestion.myAnswer?.selectedChoiceId ?? submission.selectedChoiceId,
    };

    if (
      submittedQuestion.gradingMode === 'self' &&
      submittedQuestion.status === 'awaitingSelfGrade'
    ) {
      submitQuestion(question.id, { ...submittedAnswer, status: 'pending' });
      return;
    }

    if (!status) {
      throw new Error('채점 결과를 확인할 수 없습니다.');
    }

    submitQuestion(question.id, { ...submittedAnswer, status });
  };

  const handleSelfCheck = async (status: GradedStatus) => {
    const gradedQuestion = await selfGradeMutation.mutateAsync({
      userId,
      problemSetId,
      questionId: question.id,
      status: status === 'correct' ? 'correct' : 'wrong',
    });
    if (gradedQuestion.status !== 'correct' && gradedQuestion.status !== 'incorrect') {
      throw new Error('채점 결과를 확인할 수 없습니다.');
    }
    gradeQuestion(question.id, gradedQuestion.status);
  };

  const handleRetry = async () => {
    await retryQuestionMutation.mutateAsync({
      userId,
      problemSetId,
      questionId: question.id,
    });
    resetQuestion(question.id);
    startQuestion(question.id);
    if (isReviewMode) {
      router.replace(`/problem/${problemSetId}/questions/${question.id}`);
    }
  };

  return {
    status: 'ready',
    question,
    questions: detail.questions,
    attempt,
    totalElapsedSeconds,
    completedCount: detail.summary.solvedCount,
    isHydrated,
    isBusy,
    isSubmitting: submitAnswerMutation.isPending,
    isRetrying: retryQuestionMutation.isPending,
    isLastQuestion,
    isTocOpen,
    isExitModalOpen,
    reviewQuery,
    backHref: isReviewMode ? `/problem/${problemSetId}/result` : `/problem/${problemSetId}`,
    previousHref: previousQuestion
      ? `/problem/${problemSetId}/questions/${previousQuestion.id}${reviewQuery}`
      : undefined,
    nextHref: nextQuestion
      ? `/problem/${problemSetId}/questions/${nextQuestion.id}${reviewQuery}`
      : `/problem/${problemSetId}/result`,
    handleNext,
    handleOpenToc,
    handleCloseToc,
    handleOpenExitModal,
    handleCloseExitModal,
    handleHeaderBack,
    handleSaveAndNavigate,
    handleSaveAndExit,
    handleExitWithoutSave,
    handleDraftChange,
    handleSubmitAnswer,
    handleSelfCheck,
    handleRetry,
  } as const;
}
