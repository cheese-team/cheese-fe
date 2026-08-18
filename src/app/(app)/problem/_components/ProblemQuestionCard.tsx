'use client';

import { useEffect, useRef, useState } from 'react';

import CorrectCircleIcon from '@/assets/icons/common/cancel-circle.svg';
import DocumentsIcon from '@/assets/icons/settings/documents.svg';
import SkillsIcon from '@/assets/icons/settings/skills.svg';
import DoubleArrowIcon from '@/assets/icons/problem/double-arrow.svg';
import IncorrectCircleIcon from '@/assets/icons/problem/check-circle.svg';
import ReturnIcon from '@/assets/icons/problem/return.svg';
import { Button } from '@/components/common/Button';

import type { ProblemAttempt, ProblemQuestion, ProblemSolveStatus } from '../_types/problemSolving';
import ProblemStatusIcon from './ProblemStatusIcon';

type ProblemQuestionCardProps = {
  question: ProblemQuestion;
  initialAttempt?: ProblemAttempt;
  isLastQuestion: boolean;
  isReviewMode?: boolean;
  onDraftChange: (draft: { answer?: string; selectedChoiceId?: string }) => void;
  onSubmitAnswer: (submission: {
    answer: string;
    selectedChoiceId: string;
    status: ProblemSolveStatus;
  }) => void;
  onSelfCheck: (status: Exclude<ProblemSolveStatus, 'pending'>) => void;
  onNext: () => void;
  onRetry: () => void;
};

type SelfCheckStatus = 'correct' | 'incorrect' | '';

const SELF_CHECK_DELAY_MS = 500;
const CIRCLED_NUMBERS = ['①', '②', '③', '④', '⑤'];

function cn(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function normalizeAnswer(value: string) {
  return value.replace(/\s+/g, '').toLowerCase();
}

function AnswerResultMessage({
  status,
  className,
}: {
  status: 'correct' | 'incorrect';
  className?: string;
}) {
  const isCorrect = status === 'correct';

  return (
    <div className={cn('flex items-center gap-[12px]', className)}>
      <ProblemStatusIcon type={isCorrect ? 'correct' : 'incorrect'} />

      <p
        className={cn(
          'text-[18px] leading-[24px] font-bold tracking-normal',
          isCorrect ? 'text-success-subtle' : 'text-error',
        )}
      >
        {isCorrect ? '정답입니다!' : '오답입니다'}
      </p>
    </div>
  );
}

export default function ProblemQuestionCard({
  question,
  initialAttempt,
  isLastQuestion,
  isReviewMode = false,
  onDraftChange,
  onSubmitAnswer,
  onSelfCheck,
  onNext,
  onRetry,
}: ProblemQuestionCardProps) {
  const selfCheckTimerIdRef = useRef<number | null>(null);

  const [textAnswer, setTextAnswer] = useState(initialAttempt?.answer ?? '');
  const [selectedChoiceId, setSelectedChoiceId] = useState(initialAttempt?.selectedChoiceId ?? '');
  const [isHintVisible, setIsHintVisible] = useState(isReviewMode);
  const [isSubmitted, setIsSubmitted] = useState(
    isReviewMode ? false : Boolean(initialAttempt?.submitted),
  );
  const [selfCheck, setSelfCheck] = useState<SelfCheckStatus>(
    !isReviewMode && initialAttempt?.selfChecked && initialAttempt.status !== 'pending'
      ? initialAttempt.status
      : '',
  );
  const [pendingSelfCheck, setPendingSelfCheck] = useState<SelfCheckStatus>('');

  const selectedChoice = question.choices?.find((choice) => choice.id === selectedChoiceId);
  const correctChoiceIndex = question.choices?.findIndex(
    (choice) => normalizeAnswer(choice.label) === normalizeAnswer(question.correctAnswer),
  );
  const correctChoiceNumber =
    correctChoiceIndex !== undefined && correctChoiceIndex >= 0
      ? CIRCLED_NUMBERS[correctChoiceIndex]
      : question.correctAnswer;

  const answerValue = question.type === 'shortAnswer' ? textAnswer : (selectedChoice?.label ?? '');
  const isAutoCorrect = normalizeAnswer(answerValue) === normalizeAnswer(question.correctAnswer);
  const canSubmit =
    question.type === 'shortAnswer' ? textAnswer.trim().length > 0 : selectedChoiceId.length > 0;
  const canMoveNext = question.gradingMode === 'self' ? selfCheck.length > 0 : isSubmitted;

  useEffect(() => {
    return () => {
      if (selfCheckTimerIdRef.current !== null) {
        window.clearTimeout(selfCheckTimerIdRef.current);
      }
    };
  }, []);

  const clearSelfCheckTimer = () => {
    if (selfCheckTimerIdRef.current !== null) {
      window.clearTimeout(selfCheckTimerIdRef.current);
      selfCheckTimerIdRef.current = null;
    }
  };

  const resetQuestionState = () => {
    clearSelfCheckTimer();
    setTextAnswer('');
    setSelectedChoiceId('');
    setIsHintVisible(false);
    setIsSubmitted(false);
    setSelfCheck('');
    setPendingSelfCheck('');
  };

  const handleSubmit = () => {
    if (canSubmit) {
      setIsSubmitted(true);
      onSubmitAnswer({
        answer: textAnswer,
        selectedChoiceId,
        status:
          question.gradingMode === 'auto' ? (isAutoCorrect ? 'correct' : 'incorrect') : 'pending',
      });
    }
  };

  const handleRetry = () => {
    resetQuestionState();
    onRetry();
  };

  const handleSelfCheckSelect = (nextSelfCheck: Exclude<SelfCheckStatus, ''>) => {
    if (selfCheck || pendingSelfCheck) {
      return;
    }

    setPendingSelfCheck(nextSelfCheck);
    selfCheckTimerIdRef.current = window.setTimeout(() => {
      setSelfCheck(nextSelfCheck);
      onSelfCheck(nextSelfCheck);
      setPendingSelfCheck('');
      selfCheckTimerIdRef.current = null;
    }, SELF_CHECK_DELAY_MS);
  };

  return (
    <section className="bg-bg-white w-[960px] rounded-[15px] px-[40px] py-[40px]">
      <div className="flex items-center gap-[12px] text-[16px] leading-[30px] font-medium">
        <span className="text-secondary-700 tracking-normal">
          문제 {String(question.no).padStart(2, '0')}.
        </span>
        <span className="tracking-[-0.02em] text-gray-700">{question.title}</span>
      </div>

      <h1 className="mt-[40px] text-[20px] leading-[30px] font-bold tracking-[-0.04em] text-gray-950">
        {question.question}
      </h1>

      {question.type === 'shortAnswer' && (
        <div className="mt-[60px] border-b border-gray-400">
          <input
            value={textAnswer}
            disabled={isSubmitted}
            aria-label="주관식 답안"
            className="h-[38px] w-full bg-transparent px-[12px] text-[18px] leading-[24px] font-medium tracking-normal text-gray-900 outline-none disabled:text-gray-900"
            onChange={(event) => {
              const nextAnswer = event.target.value;
              setTextAnswer(nextAnswer);
              onDraftChange({ answer: nextAnswer });
            }}
          />
        </div>
      )}

      {question.type === 'multipleChoice' && (
        <ol className="mt-[40px] flex flex-col gap-[16px]">
          {question.choices?.map((choice) => {
            const isSelected = choice.id === selectedChoiceId;
            const selectedTextClassName = isSubmitted ? 'text-success' : 'text-secondary-600';
            const selectedCircleClassName = isSubmitted
              ? 'border-success text-success'
              : 'border-secondary-600 text-secondary-600';

            return (
              <li key={choice.id}>
                <button
                  type="button"
                  disabled={isSubmitted}
                  className={cn(
                    'flex items-center gap-[12px] text-[20px] leading-[24px] font-medium tracking-normal',
                    isSelected ? selectedTextClassName : 'text-gray-900',
                  )}
                  onClick={() => {
                    setSelectedChoiceId(choice.id);
                    onDraftChange({ selectedChoiceId: choice.id });
                  }}
                >
                  <span
                    className={cn(
                      'flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 text-[20px] leading-[20px] font-medium',
                      isSelected ? selectedCircleClassName : 'border-gray-500 text-gray-600',
                    )}
                  >
                    {choice.id}
                  </span>
                  <span>{choice.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {isSubmitted && question.gradingMode === 'auto' && (
        <>
          <AnswerResultMessage
            status={isAutoCorrect ? 'correct' : 'incorrect'}
            className="mt-[28px]"
          />
          <p className="mt-[18px] flex items-center gap-[10px] font-medium tracking-normal text-gray-900">
            <span className="text-[20px] leading-[24px]">정답 :</span>
            <span className="flex h-[24px] items-center text-[18px] leading-[24px]">
              {correctChoiceNumber}
            </span>
          </p>
          <p className="mt-[12px] text-[18px] leading-[24px] font-medium tracking-normal text-gray-900">
            {question.explanation ?? question.correctAnswer}
          </p>
        </>
      )}

      {isSubmitted && question.gradingMode === 'self' && (
        <div className="mt-[40px]">
          {!selfCheck && (
            <>
              <p className="text-[18px] leading-[24px] font-bold text-gray-600">
                정답을 맞추셨나요?
              </p>

              <div className="mt-[16px] w-[330px] overflow-hidden rounded-[10px] border border-gray-300">
                <button
                  type="button"
                  disabled={Boolean(pendingSelfCheck)}
                  className={cn(
                    'flex h-[72px] w-full items-center gap-[16px] px-[20px] text-[16px] leading-[20px] font-medium tracking-normal',
                    pendingSelfCheck === 'correct'
                      ? 'bg-tag-green-500 text-white'
                      : 'bg-bg-white text-gray-700',
                  )}
                  onClick={() => {
                    handleSelfCheckSelect('correct');
                  }}
                >
                  <CorrectCircleIcon
                    className={cn(
                      'h-[36px] w-[36px] shrink-0',
                      pendingSelfCheck === 'correct'
                        ? 'text-tag-green-500 [&_path]:!fill-current [&_rect]:!fill-white'
                        : 'text-gray-300 [&_path]:!fill-white [&_rect]:!fill-current',
                    )}
                    aria-hidden="true"
                    focusable="false"
                  />
                  <span className="tracking-normal">정답</span>
                </button>

                <button
                  type="button"
                  disabled={Boolean(pendingSelfCheck)}
                  className={cn(
                    'flex h-[72px] w-full items-center gap-[16px] border-t border-gray-300 px-[20px] text-[16px] leading-[20px] font-medium tracking-normal',
                    pendingSelfCheck === 'incorrect'
                      ? 'bg-error text-white'
                      : 'bg-bg-white text-gray-700',
                  )}
                  onClick={() => {
                    handleSelfCheckSelect('incorrect');
                  }}
                >
                  <IncorrectCircleIcon
                    className={cn(
                      'h-[36px] w-[36px] shrink-0',
                      pendingSelfCheck === 'incorrect'
                        ? 'text-error [&_path]:!fill-current [&_rect]:!fill-white'
                        : 'text-gray-300 [&_path]:!fill-white [&_rect]:!fill-current',
                    )}
                    aria-hidden="true"
                    focusable="false"
                  />
                  <span className="tracking-normal">오답</span>
                </button>
              </div>
            </>
          )}

          {selfCheck && <AnswerResultMessage status={selfCheck} />}

          <p
            className={cn(
              'flex items-center gap-[10px] font-medium tracking-normal text-gray-900',
              selfCheck ? 'mt-[18px]' : 'mt-[16px]',
            )}
          >
            <span className="text-[20px] leading-[24px]">정답 :</span>
            <span className="text-[18px] leading-[24px]">{question.correctAnswer}</span>
          </p>
        </div>
      )}

      {isHintVisible && (
        <div className="border-primary-700 mt-[32px] flex h-[96px] flex-col rounded-[10px] border-2 p-[20px]">
          <p className="text-[16px] leading-[24px] font-medium tracking-[-0.04em] text-gray-900">
            Hint 1.
          </p>
          <p className="mt-[8px] text-[18px] leading-[24px] font-medium tracking-normal text-gray-700">
            {question.hint}
          </p>
        </div>
      )}

      <div className="mt-[32px] flex justify-end gap-[10px]">
        {isSubmitted ? (
          <>
            <Button
              variant="outline"
              size={54}
              width={110}
              className="gap-[12px] leading-[24px]"
              onClick={handleRetry}
            >
              <ReturnIcon
                className="h-[24px] w-[20px] shrink-0 text-gray-600 [&_path]:!fill-current"
                aria-hidden="true"
                focusable="false"
              />
              <span>다시풀기</span>
            </Button>

            <Button
              size={54}
              width={110}
              className="gap-[12px] leading-[24px]"
              disabled={!canMoveNext}
              onClick={onNext}
            >
              <DoubleArrowIcon
                className="h-[24px] w-[20px] shrink-0 [&_path]:!fill-current"
                aria-hidden="true"
                focusable="false"
              />
              <span>{isLastQuestion ? '결과보기' : '다음문제'}</span>
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size={54}
              width={110}
              className="gap-[12px] leading-[24px]"
              onClick={() => {
                setIsHintVisible(true);
              }}
            >
              <SkillsIcon
                className="text-secondary-600 h-[18px] w-[18px] shrink-0 [&_*]:!fill-current [&_*]:!stroke-current"
                aria-hidden="true"
                focusable="false"
              />
              <span>힌트보기</span>
            </Button>

            <Button
              size={54}
              width={110}
              disabled={!canSubmit}
              className="gap-[12px] leading-[24px]"
              onClick={handleSubmit}
            >
              <DocumentsIcon
                className="h-[18px] w-[18px] shrink-0 [&_*]:!fill-current [&_*]:!stroke-current"
                aria-hidden="true"
                focusable="false"
              />
              <span>정답제출</span>
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
