'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ProblemAttempt, ProblemSolveStatus } from '../_types/problemSolving';
import { formatProgressDate } from '../_utils/formatProgressDate';

const MAX_SESSION_SECONDS = 60 * 60;

type ProblemSolvingSessionState = {
  totalElapsedSeconds: number;
  attempts: Record<string, ProblemAttempt>;
  lastProgressDate: string | null;
  activeQuestionId: string | null;
  isRunning: boolean;
};

type AnswerDraft = {
  answer?: string;
  selectedChoiceId?: string;
};

type AnswerSubmission = {
  answer: string;
  selectedChoiceId: string;
  status: ProblemSolveStatus;
};

type ProblemSolvingSessionContextValue = {
  totalElapsedSeconds: number;
  attempts: Record<string, ProblemAttempt>;
  isHydrated: boolean;
  startQuestion: (questionId: string, options?: { review?: boolean }) => void;
  saveDraft: (questionId: string, draft: AnswerDraft) => void;
  submitQuestion: (questionId: string, submission: AnswerSubmission) => void;
  gradeQuestion: (questionId: string, status: Exclude<ProblemSolveStatus, 'pending'>) => void;
  retryQuestion: (questionId: string) => void;
  pauseSession: () => void;
  finishSession: () => void;
  resetSession: () => void;
};

const createEmptyAttempt = (): ProblemAttempt => ({
  answer: '',
  selectedChoiceId: '',
  status: 'pending',
  elapsedSeconds: 0,
  submitted: false,
  selfChecked: false,
});

const createInitialState = (): ProblemSolvingSessionState => ({
  totalElapsedSeconds: 0,
  attempts: {},
  lastProgressDate: null,
  activeQuestionId: null,
  isRunning: false,
});

const ProblemSolvingSessionContext = createContext<ProblemSolvingSessionContextValue | null>(null);

function sanitizeStoredState(value: unknown): ProblemSolvingSessionState {
  if (!value || typeof value !== 'object') {
    return createInitialState();
  }

  const stored = value as Partial<ProblemSolvingSessionState>;
  const rawAttempts = stored.attempts && typeof stored.attempts === 'object' ? stored.attempts : {};
  const attempts = Object.entries(rawAttempts).reduce<Record<string, ProblemAttempt>>(
    (nextAttempts, [questionId, rawAttempt]) => {
      if (!rawAttempt || typeof rawAttempt !== 'object') {
        return nextAttempts;
      }

      const attempt = rawAttempt as Partial<ProblemAttempt>;
      nextAttempts[questionId] = {
        answer: typeof attempt.answer === 'string' ? attempt.answer : '',
        selectedChoiceId:
          typeof attempt.selectedChoiceId === 'string' ? attempt.selectedChoiceId : '',
        status:
          attempt.status === 'correct' || attempt.status === 'incorrect'
            ? attempt.status
            : 'pending',
        elapsedSeconds:
          typeof attempt.elapsedSeconds === 'number'
            ? Math.max(0, Math.floor(attempt.elapsedSeconds))
            : 0,
        submitted: Boolean(attempt.submitted),
        selfChecked: Boolean(attempt.selfChecked),
      };
      return nextAttempts;
    },
    {},
  );

  const totalElapsedSeconds =
    typeof stored.totalElapsedSeconds === 'number'
      ? Math.min(MAX_SESSION_SECONDS, Math.max(0, Math.floor(stored.totalElapsedSeconds)))
      : 0;

  return {
    totalElapsedSeconds,
    attempts,
    lastProgressDate:
      typeof stored.lastProgressDate === 'string'
        ? stored.lastProgressDate
        : Object.values(attempts).some((attempt) => attempt.submitted)
          ? formatProgressDate()
          : null,
    activeQuestionId: null,
    isRunning: false,
  };
}

export function ProblemSolvingSessionProvider({
  problemSetId,
  children,
}: {
  problemSetId: string;
  children: ReactNode;
}) {
  const storageKey = `cheese:problem-session:${problemSetId}`;
  const [state, setState] = useState<ProblemSolvingSessionState>(createInitialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.sessionStorage.getItem(storageKey);
      if (storedValue) {
        setState(sanitizeStoredState(JSON.parse(storedValue)));
      }
    } catch {
      window.sessionStorage.removeItem(storageKey);
    } finally {
      setIsHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.sessionStorage.setItem(storageKey, JSON.stringify(state));
  }, [isHydrated, state, storageKey]);

  useEffect(() => {
    if (!state.isRunning) {
      return;
    }

    const timerId = window.setInterval(() => {
      setState((currentState) => {
        if (!currentState.isRunning) {
          return currentState;
        }

        const nextTotalElapsedSeconds = Math.min(
          MAX_SESSION_SECONDS,
          currentState.totalElapsedSeconds + 1,
        );
        const activeQuestionId = currentState.activeQuestionId;
        const attempts = activeQuestionId
          ? {
              ...currentState.attempts,
              [activeQuestionId]: {
                ...(currentState.attempts[activeQuestionId] ?? createEmptyAttempt()),
                elapsedSeconds: (currentState.attempts[activeQuestionId]?.elapsedSeconds ?? 0) + 1,
              },
            }
          : currentState.attempts;

        return {
          ...currentState,
          totalElapsedSeconds: nextTotalElapsedSeconds,
          attempts,
          activeQuestionId:
            nextTotalElapsedSeconds >= MAX_SESSION_SECONDS ? null : activeQuestionId,
          isRunning: nextTotalElapsedSeconds < MAX_SESSION_SECONDS,
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [state.isRunning]);

  const startQuestion = useCallback((questionId: string, options?: { review?: boolean }) => {
    setState((currentState) => {
      const attempt = currentState.attempts[questionId] ?? createEmptyAttempt();
      const shouldTrackQuestion = options?.review || !attempt.submitted;

      return {
        ...currentState,
        attempts: { ...currentState.attempts, [questionId]: attempt },
        activeQuestionId: shouldTrackQuestion ? questionId : null,
        isRunning: currentState.totalElapsedSeconds < MAX_SESSION_SECONDS,
      };
    });
  }, []);

  const saveDraft = useCallback((questionId: string, draft: AnswerDraft) => {
    setState((currentState) => ({
      ...currentState,
      attempts: {
        ...currentState.attempts,
        [questionId]: {
          ...(currentState.attempts[questionId] ?? createEmptyAttempt()),
          ...draft,
        },
      },
    }));
  }, []);

  const submitQuestion = useCallback((questionId: string, submission: AnswerSubmission) => {
    setState((currentState) => ({
      ...currentState,
      attempts: {
        ...currentState.attempts,
        [questionId]: {
          ...(currentState.attempts[questionId] ?? createEmptyAttempt()),
          ...submission,
          submitted: true,
          selfChecked: submission.status !== 'pending',
        },
      },
      lastProgressDate: formatProgressDate(),
      activeQuestionId: null,
      isRunning: false,
    }));
  }, []);

  const gradeQuestion = useCallback(
    (questionId: string, status: Exclude<ProblemSolveStatus, 'pending'>) => {
      setState((currentState) => ({
        ...currentState,
        attempts: {
          ...currentState.attempts,
          [questionId]: {
            ...(currentState.attempts[questionId] ?? createEmptyAttempt()),
            status,
            submitted: true,
            selfChecked: true,
          },
        },
        lastProgressDate: formatProgressDate(),
      }));
    },
    [],
  );

  const retryQuestion = useCallback((questionId: string) => {
    setState((currentState) => ({
      ...currentState,
      attempts: { ...currentState.attempts, [questionId]: createEmptyAttempt() },
      activeQuestionId: questionId,
      isRunning: currentState.totalElapsedSeconds < MAX_SESSION_SECONDS,
    }));
  }, []);

  const pauseSession = useCallback(() => {
    setState((currentState) => ({ ...currentState, activeQuestionId: null, isRunning: false }));
  }, []);

  const finishSession = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      activeQuestionId: null,
      isRunning: false,
    }));
  }, []);

  const resetSession = useCallback(() => {
    setState(createInitialState());
  }, []);

  const value = useMemo<ProblemSolvingSessionContextValue>(
    () => ({
      totalElapsedSeconds: state.totalElapsedSeconds,
      attempts: state.attempts,
      isHydrated,
      startQuestion,
      saveDraft,
      submitQuestion,
      gradeQuestion,
      retryQuestion,
      pauseSession,
      finishSession,
      resetSession,
    }),
    [
      finishSession,
      gradeQuestion,
      isHydrated,
      pauseSession,
      resetSession,
      retryQuestion,
      saveDraft,
      startQuestion,
      state.attempts,
      state.totalElapsedSeconds,
      submitQuestion,
    ],
  );

  return (
    <ProblemSolvingSessionContext.Provider value={value}>
      {children}
    </ProblemSolvingSessionContext.Provider>
  );
}

export function useProblemSolvingSession() {
  const context = useContext(ProblemSolvingSessionContext);
  if (!context) {
    throw new Error('useProblemSolvingSession must be used inside ProblemSolvingSessionProvider');
  }
  return context;
}
