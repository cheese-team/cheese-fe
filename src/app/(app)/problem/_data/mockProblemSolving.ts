import cssThumbnail from '../../../../../public/images/problem/css.png';

import type { ProblemQuestion, ProblemSetSummary } from '../_types/problemSolving';

export const mockProblemSetSummary: ProblemSetSummary = {
  id: 'css-basic',
  title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
  lastProgressDate: '2026.02.27',
  thumbnailSrc: cssThumbnail,
  solvedCount: 0,
  totalCount: 8,
};

export const mockProblemQuestions: ProblemQuestion[] = [
  {
    id: 'cursor-role',
    no: 1,
    title: 'cursor의 역할',
    question: '다음 중 퀵모드(quirks mode)의 특징으로 옳은 것은?',
    type: 'multipleChoice',
    gradingMode: 'auto',
    correctAnswer: '구버전 브라우저 렌더링을 흉내냄',
    explanation: '퀵모드는 구버전 브라우저 호환을 위해 사용됩니다.',
    hint: '구버전 브라우저 호환을 위해 사용',
    choices: [
      { id: '1', label: '최신 HTML/CSS 표준을 엄격히 적용' },
      { id: '2', label: '구버전 브라우저 렌더링을 흉내냄' },
      { id: '3', label: 'JS 실행이 불가능' },
      { id: '4', label: 'CSS가 적용되지 않음' },
      { id: '5', label: '구버전 브라우저 호환을 위해 사용' },
    ],
  },
  {
    id: 'next-project-structure',
    no: 2,
    title: 'Next.js의 프로젝트 구조',
    question:
      '표준모드(standards mode)와 퀵모드(quirks mode)의 차이와 동작 조건에 대해 설명하시오.',
    type: 'shortAnswer',
    gradingMode: 'self',
    correctAnswer: '퀵모드는 구버전 브라우저 호환을 위해 사용됩니다.',
    hint: '구버전 브라우저 호환을 위해 사용',
  },
  {
    id: 'v0-setting',
    no: 3,
    title: 'V0 가입 및 설정',
    question: 'V0를 사용하는 목적과 초기 설정 시 확인해야 할 항목을 설명하시오.',
    type: 'shortAnswer',
    gradingMode: 'self',
    correctAnswer:
      'V0는 UI 초안을 빠르게 생성하고 프로젝트 요구사항에 맞게 수정하기 위해 사용합니다.',
    hint: 'UI 초안 생성과 프로젝트 요구사항 반영',
  },
  {
    id: 'supabase-drizzle-clerk',
    no: 4,
    title: 'Supabase, DrizzleORM, Clerk 설명',
    question: 'Supabase, DrizzleORM, Clerk의 역할을 각각 설명하시오.',
    type: 'shortAnswer',
    gradingMode: 'self',
    correctAnswer:
      'Supabase는 백엔드와 DB, DrizzleORM은 타입 기반 ORM, Clerk는 인증 관리를 담당합니다.',
    hint: 'DB, ORM, 인증 역할을 구분',
  },
  {
    id: 'vercel-storage',
    no: 5,
    title: 'Vercel 배포 및 스토리지 설명',
    question: 'Vercel 배포와 스토리지 사용 목적을 설명하시오.',
    type: 'shortAnswer',
    gradingMode: 'self',
    correctAnswer: 'Vercel은 프론트엔드 배포와 서버리스 실행 환경을 제공합니다.',
    hint: '프론트엔드 배포와 서버리스 실행 환경',
  },
  {
    id: 'next-routing',
    no: 6,
    title: 'Next.js의 라우팅 시스템',
    question: 'Next.js App Router에서 폴더 기반 라우팅이 동작하는 방식을 설명하시오.',
    type: 'shortAnswer',
    gradingMode: 'self',
    correctAnswer: 'App Router는 app 폴더의 디렉터리 구조를 기반으로 route를 생성합니다.',
    hint: 'app 폴더와 page.tsx',
  },
  {
    id: 'next-route-handlers',
    no: 7,
    title: 'Next.js의 Route Handlers',
    question: 'Route Handler의 역할과 사용 위치를 설명하시오.',
    type: 'shortAnswer',
    gradingMode: 'self',
    correctAnswer: 'Route Handler는 app 디렉터리의 route.ts에서 HTTP 요청을 처리합니다.',
    hint: 'route.ts와 HTTP method',
  },
  {
    id: 'git-commit-push',
    no: 8,
    title: 'git commit, git push 실습',
    question: 'git commit과 git push의 차이를 설명하시오.',
    type: 'shortAnswer',
    gradingMode: 'self',
    correctAnswer: 'commit은 로컬 저장소에 기록하고 push는 원격 저장소에 업로드합니다.',
    hint: '로컬 저장소와 원격 저장소',
  },
];

export function getProblemQuestion(questionId: string) {
  return mockProblemQuestions.find((question) => question.id === questionId);
}

export function getProblemQuestionIndex(questionId: string) {
  return mockProblemQuestions.findIndex((question) => question.id === questionId);
}
