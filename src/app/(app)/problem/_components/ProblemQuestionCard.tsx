'use client';

import { useEffect, useRef, useState } from 'react';

import ProblemStatusIcon from './ProblemStatusIcon';
import DoubleArrowIcon from '@/assets/icons/problem/double-arrow.svg';
import CorrectCircleIcon from '@/assets/icons/common/cancel-circle.svg';
import IncorrectCircleIcon from '@/assets/icons/problem/check-circle.svg';
import DocumentsIcon from '@/assets/icons/settings/documents.svg';
import ReturnIcon from '@/assets/icons/problem/return.svg';
import SkillsIcon from '@/assets/icons/settings/skills.svg';

import type { ProblemQuestion } from '../_types/problemSolving';

type ProblemQuestionCardProps = {
  question: ProblemQuestion;
  isLastQuestion: boolean;
  onNext: () => void;
  onRetry: () => void;
};

type SelfCheckStatus = 'correct' | 'incorrect' | '';

const SELF_CHECK_DELAY_MS = 500;

function cn(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function normalizeAnswer(value: string) {
  return value.replace(/\s+/g, '').toLowerCase();
}

function AnswerResultMessage({ status }: { status: 'correct' | 'incorrect' }) {
  const isCorrect = status === 'correct';

  return (
    <div className="mt-[28px] flex items-center gap-[10px]">
      <ProblemStatusIcon type={isCorrect ? 'correct' : 'incorrect'} />

      <p
        className={cn(
          'text-[18px] leading-[24px] font-bold',
          isCorrect ? 'text-success-subtle' : 'text-error',
        )}
      >
        {isCorrect ? '정답입니다!' : '오답입니다.'}
      </p>
    </div>
  );
}
export default function ProblemQuestionCard({
  question,
  isLastQuestion,
  onNext,
  onRetry,
}: ProblemQuestionCardProps) {
  const selfCheckTimerIdRef = useRef<number | null>(null);

  const [textAnswer, setTextAnswer] = useState('');
  const [selectedChoiceId, setSelectedChoiceId] = useState('');
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selfCheck, setSelfCheck] = useState<SelfCheckStatus>('');
  const [pendingSelfCheck, setPendingSelfCheck] = useState<SelfCheckStatus>('');

  const selectedChoice = question.choices?.find((choice) => choice.id === selectedChoiceId);

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
    if (!canSubmit) {
      return;
    }

    setIsSubmitted(true);
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
      setPendingSelfCheck('');
      selfCheckTimerIdRef.current = null;
    }, SELF_CHECK_DELAY_MS);
  };

  return (
    <section className="bg-bg-white w-[960px] rounded-[15px] px-[40px] py-[40px]">
      <div className="flex items-center gap-[12px] text-[14px] leading-[20px] font-medium">
        <span className="text-secondary-600">문제 {question.no}.</span>
        <span className="text-gray-700">{question.title}</span>
      </div>

      <h1 className="mt-[34px] text-[20px] leading-[30px] font-bold">{question.question}</h1>

      {question.type === 'shortAnswer' && (
        <div className="mt-[64px] border-b border-gray-400">
          <input
            value={textAnswer}
            disabled={isSubmitted}
            placeholder=""
            className="h-[38px] w-full bg-transparent px-[12px] text-[16px] leading-[24px] font-medium outline-none placeholder:text-gray-700 disabled:text-gray-900"
            onChange={(event) => {
              setTextAnswer(event.target.value);
            }}
          />
        </div>
      )}

      {question.type === 'multipleChoice' && (
        <ol className="mt-[36px] flex flex-col gap-[12px]">
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
                    'flex items-center gap-[12px] text-[18px] leading-[24px] font-medium',
                    isSelected ? selectedTextClassName : 'text-gray-900',
                  )}
                  onClick={() => {
                    setSelectedChoiceId(choice.id);
                  }}
                >
                  <span
                    className={cn(
                      'flex h-[24px] w-[24px] items-center justify-center rounded-full border text-[14px] leading-none font-medium',
                      isSelected ? selectedCircleClassName : 'border-gray-500 text-gray-500',
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
          <AnswerResultMessage status={isAutoCorrect ? 'correct' : 'incorrect'} />

          <p className="mt-[18px] text-[16px] leading-[24px] font-medium">
            정답 : {question.correctAnswer}
          </p>
        </>
      )}

      {isSubmitted && question.gradingMode === 'self' && (
        <div className="mt-[28px]">
          {!selfCheck && (
            <>
              <p className="text-[18px] leading-[24px] font-bold text-gray-600">
                정답을 맞추셨나요?
              </p>

              <div className="mt-[14px] w-[330px] overflow-hidden rounded-[8px] border border-gray-300">
                <button
                  type="button"
                  disabled={Boolean(pendingSelfCheck)}
                  className={cn(
                    'flex h-[64px] w-full items-center gap-[18px] px-[20px] text-[16px] leading-[24px] font-medium',
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
                        ? 'text-tag-green-500 [&_circle]:!fill-white [&_path]:!fill-current [&_path]:!stroke-current'
                        : 'text-gray-300 [&_circle]:!fill-current [&_path]:!fill-white [&_path]:!stroke-white',
                    )}
                    aria-hidden="true"
                    focusable="false"
                  />
                  <span>정답</span>
                </button>

                <button
                  type="button"
                  disabled={Boolean(pendingSelfCheck)}
                  className={cn(
                    'flex h-[64px] w-full items-center gap-[18px] border-t border-gray-300 px-[20px] text-[16px] leading-[24px] font-medium',
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
                        ? 'text-error [&_circle]:!fill-white [&_path]:!fill-current [&_path]:!stroke-current'
                        : 'text-gray-300 [&_circle]:!fill-current [&_path]:!fill-white [&_path]:!stroke-white',
                    )}
                    aria-hidden="true"
                    focusable="false"
                  />
                  <span>오답</span>
                </button>
              </div>
            </>
          )}

          {selfCheck && <AnswerResultMessage status={selfCheck} />}

          <p className="mt-[18px] text-[16px] leading-[24px] font-medium">
            정답 : {question.correctAnswer}
          </p>
        </div>
      )}

      {isHintVisible && (
        <div className="border-primary-700 mt-[28px] flex h-[96px] flex-col justify-center rounded-[10px] border-2 px-[16px]">
          <p className="text-[14px] leading-[20px] font-bold">Hint 1.</p>
          <p className="mt-[10px] text-[16px] leading-[24px] font-medium text-gray-700">
            {question.hint}
          </p>
        </div>
      )}

      <div className="mt-[34px] flex justify-end gap-[10px]">
        {isSubmitted ? (
          <>
            <button
              type="button"
              className="border-secondary-600 flex h-[54px] w-[110px] items-center justify-center gap-[10px] rounded-[8px] border text-[16px] leading-[24px] font-medium text-gray-700"
              onClick={handleRetry}
            >
              <ReturnIcon
                className="h-[24px] w-[20px] shrink-0 text-gray-600 [&_*]:!fill-current [&_*]:!stroke-current"
                aria-hidden="true"
                focusable="false"
              />
              <span>다시풀기</span>
            </button>

            <button
              type="button"
              className="bg-secondary-600 flex h-[54px] w-[110px] items-center justify-center gap-[10px] rounded-[8px] text-[16px] leading-[24px] font-medium text-white disabled:bg-gray-400 disabled:text-gray-100"
              disabled={!canMoveNext}
              onClick={onNext}
            >
              <DoubleArrowIcon
                className="h-[24px] w-[20px] shrink-0 [&_*]:!fill-current [&_*]:!stroke-current"
                aria-hidden="true"
                focusable="false"
              />
              <span>{isLastQuestion ? '결과보기' : '다음문제'}</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="border-secondary-600 flex h-[54px] w-[110px] items-center justify-center gap-[10px] rounded-[8px] border text-[16px] leading-[24px] font-medium text-gray-700"
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
            </button>

            <button
              type="button"
              disabled={!canSubmit}
              className="bg-secondary-600 flex h-[54px] w-[110px] items-center justify-center gap-[10px] rounded-[8px] text-[16px] leading-[24px] font-medium text-white disabled:bg-gray-400 disabled:text-gray-100"
              onClick={handleSubmit}
            >
              <DocumentsIcon
                className="h-[18px] w-[18px] shrink-0 [&_*]:!fill-current [&_*]:!stroke-current"
                aria-hidden="true"
                focusable="false"
              />
              <span>정답제출</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
