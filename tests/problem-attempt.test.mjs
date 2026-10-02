import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mapProblemAttempt } from '../src/app/(app)/problem/_utils/mapProblemAttempt.ts';
import {
  createEmptyProblemAttempt,
  resolveProblemAttempt,
} from '../src/app/(app)/problem/_utils/resolveProblemAttempt.ts';

const emptyAttempt = Object.freeze({
  answer: '',
  selectedChoiceId: '',
  status: 'pending',
  elapsedSeconds: 0,
  submitted: false,
  selfChecked: false,
});

function sessionAttempt(overrides = {}) {
  return Object.freeze({ ...emptyAttempt, ...overrides });
}

function serverAttempt(overrides = {}) {
  return Object.freeze(
    mapProblemAttempt({
      id: 'question-1',
      no: 1,
      title: '배열 메서드',
      question: '배열 끝에 값을 추가하는 메서드는?',
      type: 'shortAnswer',
      gradingMode: 'auto',
      hint: '',
      status: 'notStarted',
      ...overrides,
    }),
  );
}

test('풀이 이력이 없으면 미제출 상태의 빈 답안으로 시작한다', () => {
  assert.deepEqual(resolveProblemAttempt({}), emptyAttempt);
});

test('새 풀이와 다시 풀기에 사용할 빈 답안은 각각 독립적으로 생성한다', () => {
  const first = resolveProblemAttempt({});
  const second = resolveProblemAttempt({});
  const reset = createEmptyProblemAttempt();

  first.answer = '작성 중인 답안';
  first.elapsedSeconds = 10;

  assert.deepEqual(second, emptyAttempt);
  assert.deepEqual(reset, emptyAttempt);
  assert.notEqual(second, reset);
});

test('세션이 없으면 서버에 임시 저장된 객관식 답안과 소요시간을 복원한다', () => {
  const server = serverAttempt({
    type: 'multipleChoice',
    myAnswer: { selectedChoiceId: 'choice-2' },
    elapsedSeconds: 12,
  });

  assert.deepEqual(resolveProblemAttempt({ serverAttempt: server }), {
    ...emptyAttempt,
    selectedChoiceId: 'choice-2',
    elapsedSeconds: 12,
  });
});

test('제출 전 서버 답안보다 현재 작성 중인 세션 답안과 소요시간을 우선한다', () => {
  const server = serverAttempt({ myAnswer: { answer: '이전 답안' }, elapsedSeconds: 12 });
  const session = sessionAttempt({ answer: '수정 중인 답안', elapsedSeconds: 25 });

  assert.deepEqual(
    resolveProblemAttempt({ serverAttempt: server, sessionAttempt: session }),
    session,
  );
});

test('세션에서 지운 답안을 서버의 이전 답안으로 되돌리지 않는다', () => {
  const server = serverAttempt({ myAnswer: { answer: '이전 답안' }, elapsedSeconds: 12 });
  const session = sessionAttempt({ answer: '', elapsedSeconds: 25 });

  assert.deepEqual(
    resolveProblemAttempt({ serverAttempt: server, sessionAttempt: session }),
    session,
  );
});

test('객관식 선택을 바꾸면 서버에 임시 저장된 선택보다 세션의 선택을 우선한다', () => {
  const server = serverAttempt({
    type: 'multipleChoice',
    myAnswer: { selectedChoiceId: 'choice-1' },
    elapsedSeconds: 12,
  });
  const session = sessionAttempt({ selectedChoiceId: 'choice-2', elapsedSeconds: 25 });

  assert.deepEqual(
    resolveProblemAttempt({ serverAttempt: server, sessionAttempt: session }),
    session,
  );
});

for (const status of ['correct', 'incorrect']) {
  test(`서버에서 ${status}로 채점된 답안은 미제출 세션 초안보다 우선한다`, () => {
    const server = serverAttempt({
      status,
      myAnswer: { answer: '제출된 답안' },
      elapsedSeconds: 18,
    });
    const session = sessionAttempt({ answer: '이전 초안', elapsedSeconds: 20 });

    assert.deepEqual(resolveProblemAttempt({ serverAttempt: server, sessionAttempt: session }), {
      answer: '제출된 답안',
      selectedChoiceId: '',
      status,
      elapsedSeconds: 18,
      submitted: true,
      selfChecked: true,
    });
  });
}

test('서버의 직접 채점 대기 상태가 세션의 이전 채점 결과보다 우선한다', () => {
  const server = serverAttempt({
    gradingMode: 'self',
    status: 'awaitingSelfGrade',
    myAnswer: { answer: '다시 제출한 답안' },
    elapsedSeconds: 15,
  });
  const session = sessionAttempt({
    answer: '이전 답안',
    status: 'correct',
    submitted: true,
    selfChecked: true,
    elapsedSeconds: 10,
  });

  assert.deepEqual(resolveProblemAttempt({ serverAttempt: server, sessionAttempt: session }), {
    answer: '다시 제출한 답안',
    selectedChoiceId: '',
    status: 'pending',
    elapsedSeconds: 15,
    submitted: true,
    selfChecked: false,
  });
});

test('직접 채점이 완료되면 서버 결과가 세션의 채점 대기 상태를 대체한다', () => {
  const server = serverAttempt({
    gradingMode: 'self',
    status: 'incorrect',
    myAnswer: { answer: '제출한 답안' },
    elapsedSeconds: 15,
  });
  const session = sessionAttempt({ answer: '제출한 답안', submitted: true, elapsedSeconds: 15 });

  assert.deepEqual(resolveProblemAttempt({ serverAttempt: server, sessionAttempt: session }), {
    ...session,
    status: 'incorrect',
    selfChecked: true,
  });
});

test('서버에서 다시 풀기로 초기화되면 세션에 남은 제출 완료 답안을 복원하지 않는다', () => {
  const server = serverAttempt();
  const session = sessionAttempt({
    answer: '이전 답안',
    status: 'correct',
    submitted: true,
    selfChecked: true,
    elapsedSeconds: 30,
  });

  assert.deepEqual(
    resolveProblemAttempt({ serverAttempt: server, sessionAttempt: session }),
    emptyAttempt,
  );
});

test('건너뛴 서버 답안을 세션 초안으로 되돌리거나 채점 완료로 바꾸지 않는다', () => {
  const server = serverAttempt({ status: 'skipped', elapsedSeconds: 7 });
  const session = sessionAttempt({ answer: '이전 초안', elapsedSeconds: 5 });

  assert.deepEqual(resolveProblemAttempt({ serverAttempt: server, sessionAttempt: session }), {
    ...emptyAttempt,
    elapsedSeconds: 7,
    submitted: true,
  });
});

test('서버 답안이 전달되지 않은 재개에서는 세션 초안을 유지한다', () => {
  const session = sessionAttempt({ answer: '작성 중인 답안', elapsedSeconds: 15 });

  assert.deepEqual(resolveProblemAttempt({ sessionAttempt: session }), session);
});

test('서버 답안이 전달되지 않은 재개에서는 세션의 제출 결과를 유지한다', () => {
  const session = sessionAttempt({
    answer: '제출한 답안',
    status: 'correct',
    submitted: true,
    selfChecked: true,
    elapsedSeconds: 15,
  });

  assert.deepEqual(resolveProblemAttempt({ sessionAttempt: session }), session);
});
