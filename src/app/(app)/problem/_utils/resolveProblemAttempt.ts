import type { ProblemAttempt } from '../_types/problemSolving';

export const createEmptyProblemAttempt = (): ProblemAttempt => ({
  answer: '',
  selectedChoiceId: '',
  status: 'pending',
  elapsedSeconds: 0,
  submitted: false,
  selfChecked: false,
});

type ResolveProblemAttemptOptions = {
  serverAttempt?: ProblemAttempt;
  sessionAttempt?: ProblemAttempt;
};

export function resolveProblemAttempt({
  serverAttempt,
  sessionAttempt,
}: ResolveProblemAttemptOptions): ProblemAttempt {
  // 제출 이력이 있으면 서버 상태를 따른다. 다시 풀기로 초기화된 응답도 포함한다.
  if (serverAttempt && (serverAttempt.submitted || sessionAttempt?.submitted)) {
    return serverAttempt;
  }

  // 제출 전에는 아직 서버에 저장하지 않은 세션 초안을 유지한다.
  return sessionAttempt ?? serverAttempt ?? createEmptyProblemAttempt();
}
